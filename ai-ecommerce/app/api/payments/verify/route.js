// app/api/payments/verify/route.js - PROFESSIONAL 3-OCR MULTI-TENANT VERSION
// Industry standard: Supports PaddleOCR, EasyOCR, QR codes, UPI, phone payments with company isolation

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/utils/db';
import PaymentVerification from '@/models/PaymentVerification';
import Order from '@/models/Order';
import Company from '@/models/Company';
import CompanySettings from '@/models/CompanySettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

// ========== CONFIGURATION ==========
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    FRAUD: 'fraud',
    MANUAL_REVIEW: 'manual_review'
};

const VERIFICATION_METHODS = {
    AUTO_OCR: 'auto_ocr',
    ADMIN_MANUAL: 'admin_manual',
    API: 'api',
    BATCH: 'batch'
};

// ========== HELPER FUNCTIONS ==========

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && 
           /^[0-9a-fA-F]{24}$/.test(id);
};

const getCompanyContext = async (request) => {
    try {
        const companyId = request.headers.get('x-company-id') || 
                         request.nextUrl?.searchParams.get('companyId');
        
        if (companyId && isValidObjectId(companyId)) {
            const company = await Company.findById(companyId);
            if (company) return companyId;
        }
        return null;
    } catch (error) {
        console.error('Error getting company context:', error);
        return null;
    }
};

function validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? cleaned : null;
}

function generateVerificationId() {
    return `PV_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

function calculateFraudScore(validation) {
    let score = 0;
    
    if (!validation.amountMatch) score += 30;
    if (!validation.upiMatch) score += 30;
    if (validation.confidenceScore < 70) score += 20;
    if (validation.confidenceScore < 50) score += 30;
    
    return Math.min(100, score);
}

function sanitizeImageData(imageData) {
    if (!imageData) return null;
    return imageData.length > 10000 ? imageData.substring(0, 10000) : imageData;
}

// ========== POST HANDLER ==========
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        // ===== MULTI-TENANCY: Get company context =====
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'MISSING_COMPANY_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== AUTHENTICATION: Get user ID =====
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        await connectDB();

        // ===== PARSE REQUEST BODY =====
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Invalid JSON in request body',
                error: 'PARSE_ERROR',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        console.log('📥 POST /api/payments/verify - Request received:', {
            companyId,
            orderNumber: body.orderNumber,
            customerPhone: body.customerPhone,
            hasOcrData: !!body.ocrAnalysis,
            hasQrData: !!body.detectedPayment,
            timestamp: new Date().toISOString()
        });

        // ===== VALIDATE REQUIRED FIELDS =====
        if (!body.orderNumber || !body.customerPhone) {
            return NextResponse.json({
                success: false,
                message: 'Order number and customer phone are required',
                error: 'MISSING_FIELDS',
                requiredFields: ['orderNumber', 'customerPhone'],
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== VALIDATE PHONE NUMBER =====
        const cleanPhone = validatePhoneNumber(body.customerPhone);
        if (!cleanPhone) {
            return NextResponse.json({
                success: false,
                message: 'Invalid phone number format. Must be 10 digits.',
                error: 'INVALID_PHONE',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }
        body.customerPhone = cleanPhone;

        // ===== CHECK FOR DUPLICATE (5 MINUTE WINDOW) =====
        const existingVerification = await PaymentVerification.findOne({
            companyId,
            orderNumber: body.orderNumber,
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
        }).lean();

        if (existingVerification) {
            return NextResponse.json({
                success: false,
                message: 'Duplicate verification detected',
                error: 'DUPLICATE_VERIFICATION',
                existingVerification: {
                    id: existingVerification._id,
                    status: existingVerification.status,
                    createdAt: existingVerification.createdAt
                },
                timestamp: new Date().toISOString()
            }, { status: 409 });
        }

        // ===== GET ORDER IF REFERENCE PROVIDED =====
        let order = null;
        if (body.orderReference && isValidObjectId(body.orderReference)) {
            order = await Order.findOne({ 
                _id: body.orderReference, 
                companyId 
            }).lean();
        }

        // ===== GET COMPANY UPI IDs FOR VALIDATION =====
        const settings = await CompanySettings.findOne({ companyId });
        const validUpiIds = settings?.upiIds
            .filter(upi => upi.isActive)
            .map(upi => upi.id) || [];
        
        const validGpayNumbers = settings?.gpayNumbers
            ?.filter(g => g.isActive)
            .map(g => g.phoneNumber.replace(/\D/g, '')) || [];
        
        const validPhonePeNumbers = settings?.phonePeNumbers
            ?.filter(p => p.isActive)
            .map(p => p.phoneNumber.replace(/\D/g, '')) || [];
        
        const validPaytmNumbers = settings?.paytmNumbers
            ?.filter(p => p.isActive)
            .map(p => p.phoneNumber.replace(/\D/g, '')) || [];

        // ===== PREPARE COMPREHENSIVE VERIFICATION DATA =====
        const verificationData = {
            // Multi-tenancy
            companyId,
            createdBy: userId,
            
            // Core identifiers
            verificationId: generateVerificationId(),
            orderNumber: body.orderNumber,
            customerPhone: cleanPhone,
            customerName: body.customerName || order?.customerName || '',
            orderReference: body.orderReference || order?._id || null,
            
            // Order details snapshot
            orderDetails: {
                totalAmount: body.orderDetails?.totalAmount || order?.totalPrice || 0,
                subtotal: body.orderDetails?.subtotal || order?.subtotal || 0,
                totalGst: body.orderDetails?.totalGst || order?.totalGst || 0,
                items: body.orderDetails?.items || order?.items || [],
                shippingAddress: body.orderDetails?.shippingAddress || order?.shippingAddress || {},
                pincode: body.orderDetails?.pincode || order?.shippingAddress?.pincode || '',
                customerEmail: body.orderDetails?.customerEmail || order?.customerEmail || ''
            },

            // Payment proof
            paymentProof: {
                imageData: sanitizeImageData(body.paymentProof?.imageData),
                mimeType: body.paymentProof?.mimeType || 'image/jpeg',
                fileSize: body.paymentProof?.imageData?.length || 0,
                fileName: body.paymentProof?.fileName || 'payment_screenshot.jpg',
                uploadedAt: new Date(),
                imageHash: body.paymentProof?.imageHash || null,
                imageUrl: body.paymentProof?.imageUrl || null
            },

            // ===== PROFESSIONAL 3-OCR ANALYSIS RESULTS =====
            ocrAnalysis: {
                // Core OCR data
                extractedText: body.ocrAnalysis?.extractedText || '',
                rawText: body.ocrAnalysis?.rawText || body.ocrAnalysis?.extractedText || '',
                
                // Overall confidence
                confidenceScore: body.ocrAnalysis?.confidenceScore || 0,
                
                // OCR engine info
                primaryEngine: body.ocrAnalysis?.primaryEngine || body.metadata?.ocrEngine || 'paddle',
                backupEngine: body.ocrAnalysis?.backupEngine || 'none',
                backupUsed: body.ocrAnalysis?.backupUsed || false,
                
                // Payment type detection
                paymentType: body.metadata?.paymentType || 'screenshot',
                
                // Performance metrics
                processingTime: body.ocrAnalysis?.processingTime || body.ocrAnalysis?.analysisTime || 0,
                wordCount: body.ocrAnalysis?.wordCount || 0,
                
                // Extracted fields with per-field confidence
                extractedAmount: body.ocrAnalysis?.extractedAmount || null,
                extractedAmountConfidence: body.ocrAnalysis?.extractedAmountConfidence || 0,
                
                extractedUPI: body.ocrAnalysis?.extractedUPI || null,
                extractedUPIConfidence: body.ocrAnalysis?.extractedUPIConfidence || 0,
                
                transactionId: body.ocrAnalysis?.transactionId || null,
                transactionIdConfidence: body.ocrAnalysis?.transactionIdConfidence || 0,
                
                paymentStatus: body.ocrAnalysis?.paymentStatus || body.ocrAnalysis?.status || 'unknown',
                paymentStatusConfidence: body.ocrAnalysis?.paymentStatusConfidence || 0,
                
                timestamp: body.ocrAnalysis?.timestamp || body.ocrAnalysis?.extractedTime || null,
                timestampConfidence: body.ocrAnalysis?.timestampConfidence || 0,
                
                appName: body.ocrAnalysis?.appName || null,
                appNameConfidence: body.ocrAnalysis?.appNameConfidence || 0,
                
                bankName: body.ocrAnalysis?.bankName || null,
                bankNameConfidence: body.ocrAnalysis?.bankNameConfidence || 0,
                
                // Word-level data for UI highlighting
                words: body.ocrAnalysis?.words || [],
                
                // OCR metadata
                processedAt: new Date(),
                ocrEngine: body.ocrAnalysis?.ocrEngine || 'paddle',
                ocrVersion: body.ocrAnalysis?.ocrVersion || '4.0.0'
            },

            // ===== DETECTED PAYMENT DETAILS =====
            detectedPayment: {
                amount: body.detectedPayment?.amount || body.ocrAnalysis?.extractedAmount || null,
                upiId: body.detectedPayment?.upiId || body.ocrAnalysis?.extractedUPI || null,
                transactionId: body.detectedPayment?.transactionId || body.ocrAnalysis?.transactionId || null,
                transactionTime: body.detectedPayment?.transactionTime || body.detectedPayment?.timestamp || new Date(),
                status: body.detectedPayment?.status || 'success',
                appName: body.detectedPayment?.appName || body.ocrAnalysis?.appName || null,
                bankName: body.detectedPayment?.bankName || body.ocrAnalysis?.bankName || null,
                senderName: body.detectedPayment?.senderName || null,
                senderUpi: body.detectedPayment?.senderUpi || null,
                payeeVPA: body.detectedPayment?.payeeVPA || body.ocrAnalysis?.extractedUPI || null,
                reference: body.detectedPayment?.reference || null,
                remarks: body.detectedPayment?.remarks || ''
            },

            // ===== PROFESSIONAL VALIDATION RESULTS =====
            validationResults: body.validationResults || {
                // Amount validation
                amountMatch: false,
                expectedAmount: body.orderDetails?.totalAmount || order?.totalPrice || 0,
                foundAmount: body.detectedPayment?.amount || body.ocrAnalysis?.extractedAmount || 0,
                amountDifference: 0,
                matchQuality: 'none',
                
                // UPI validation
                upiMatch: false,
                matchedUpiId: null,
                upiMatchType: 'none',
                
                // Time validation
                timeValid: false,
                detectedTime: body.detectedPayment?.transactionTime || null,
                timeDifferenceMinutes: 0,
                
                // Success indicators
                successIndicators: false,
                
                // Overall confidence
                confidenceScore: body.ocrAnalysis?.confidenceScore || 0,
                
                // Errors and warnings
                validationErrors: [],
                validationWarnings: []
            },

            // ===== FRAUD ANALYSIS =====
            fraudAnalysis: body.fraudAnalysis || {
                isSuspicious: false,
                fraudScore: 0,
                riskLevel: 'low',
                reasons: [],
                flags: [],
                analysisPerformedAt: new Date()
            },

            // ===== VERIFICATION WORKFLOW =====
            status: PAYMENT_STATUS.PENDING,
            verificationMethod: VERIFICATION_METHODS.AUTO_OCR,
            
            verificationHistory: [{
                status: PAYMENT_STATUS.PENDING,
                changedBy: userId || 'system',
                changedAt: new Date(),
                reason: 'Payment verification created',
                metadata: { source: body.metadata?.source || 'whatsapp' }
            }],

            // ===== METADATA =====
            metadata: {
                source: body.metadata?.source || 'whatsapp',
                ipAddress: request.headers.get('x-forwarded-for') || request.ip,
                userAgent: request.headers.get('user-agent'),
                requestId: uuidv4(),
                processingTime: 0,
                ocrEngine: body.metadata?.ocrEngine || body.ocrAnalysis?.primaryEngine || 'paddle',
                backupUsed: body.ocrAnalysis?.backupUsed || false,
                paymentType: body.metadata?.paymentType || 'screenshot'
            },

            tags: body.tags || [],
            isActive: true
        };

        // ===== CALCULATE VALIDATION RESULTS IF NOT PROVIDED =====
        if (!body.validationResults && verificationData.detectedPayment.amount) {
            const expectedAmount = verificationData.orderDetails.totalAmount;
            const foundAmount = verificationData.detectedPayment.amount;
            const amountDiff = Math.abs(expectedAmount - foundAmount);
            
            // Check UPI match against all company payment methods
            let upiMatch = false;
            let matchedUpiId = null;
            let upiMatchType = 'none';
            
            const detectedUpi = verificationData.detectedPayment.upiId?.toLowerCase();
            
            if (detectedUpi) {
                // Check against UPI IDs
                for (const validUpi of validUpiIds) {
                    if (detectedUpi === validUpi.toLowerCase()) {
                        upiMatch = true;
                        matchedUpiId = validUpi;
                        upiMatchType = 'exact';
                        break;
                    }
                    if (detectedUpi.includes(validUpi.split('@')[0].toLowerCase())) {
                        upiMatch = true;
                        matchedUpiId = validUpi;
                        upiMatchType = 'partial';
                    }
                }
                
                // Check against phone numbers (GPay, PhonePe, PayTM)
                if (!upiMatch) {
                    const phoneNumber = detectedUpi.split('@')[0];
                    if (validGpayNumbers.includes(phoneNumber) ||
                        validPhonePeNumbers.includes(phoneNumber) ||
                        validPaytmNumbers.includes(phoneNumber)) {
                        upiMatch = true;
                        matchedUpiId = detectedUpi;
                        upiMatchType = 'phone_match';
                    }
                }
            }
            
            // Time validation
            let timeValid = false;
            let timeDifferenceMinutes = 0;
            if (verificationData.detectedPayment.transactionTime) {
                const txnTime = new Date(verificationData.detectedPayment.transactionTime);
                const now = new Date();
                timeDifferenceMinutes = Math.abs(now - txnTime) / (1000 * 60);
                timeValid = timeDifferenceMinutes <= 15; // Within 15 minutes
            }
            
            verificationData.validationResults = {
                amountMatch: amountDiff <= 2,
                expectedAmount,
                foundAmount,
                amountDifference: amountDiff,
                matchQuality: amountDiff === 0 ? 'exact' : amountDiff <= 2 ? 'close' : amountDiff <= 10 ? 'near' : 'far',
                
                upiMatch,
                matchedUpiId,
                upiMatchType,
                
                timeValid,
                detectedTime: verificationData.detectedPayment.transactionTime,
                timeDifferenceMinutes,
                
                successIndicators: verificationData.detectedPayment.status === 'success',
                
                confidenceScore: verificationData.ocrAnalysis.confidenceScore || 0,
                validationErrors: [],
                validationWarnings: []
            };
        }

        // ===== CALCULATE FRAUD SCORE =====
        verificationData.fraudAnalysis.fraudScore = calculateFraudScore(verificationData.validationResults);
        verificationData.fraudAnalysis.isSuspicious = verificationData.fraudAnalysis.fraudScore > 50;
        
        // Set risk level based on fraud score
        const fraudScore = verificationData.fraudAnalysis.fraudScore;
        if (fraudScore >= 75) {
            verificationData.fraudAnalysis.riskLevel = 'critical';
        } else if (fraudScore >= 50) {
            verificationData.fraudAnalysis.riskLevel = 'high';
        } else if (fraudScore >= 25) {
            verificationData.fraudAnalysis.riskLevel = 'medium';
        } else {
            verificationData.fraudAnalysis.riskLevel = 'low';
        }

        // ===== UPDATE METADATA WITH PROCESSING TIME =====
        verificationData.metadata.processingTime = Date.now() - startTime;

        // ===== SAVE TO DATABASE =====
        const newVerification = new PaymentVerification(verificationData);
        await newVerification.save();
        
        const savedVerification = newVerification.toObject();

        const processingTime = Date.now() - startTime;
        console.log('✅ POST /api/payments/verify completed:', {
            companyId,
            id: savedVerification._id,
            status: savedVerification.status,
            confidence: savedVerification.ocrAnalysis?.confidenceScore,
            engine: savedVerification.ocrAnalysis?.primaryEngine,
            riskLevel: savedVerification.fraudAnalysis?.riskLevel,
            processingTime: `${processingTime}ms`
        });

        // ===== RETURN COMPLETE RESPONSE =====
        return NextResponse.json({
            success: true,
            message: 'Payment verification created successfully',
            data: {
                _id: savedVerification._id,
                verificationId: savedVerification.verificationId,
                orderNumber: savedVerification.orderNumber,
                customerPhone: savedVerification.customerPhone,
                status: savedVerification.status,
                amount: savedVerification.orderDetails?.totalAmount,
                detectedAmount: savedVerification.detectedPayment?.amount,
                ocrAnalysis: {
                    confidenceScore: savedVerification.ocrAnalysis?.confidenceScore,
                    extractedAmount: savedVerification.ocrAnalysis?.extractedAmount,
                    extractedUPI: savedVerification.ocrAnalysis?.extractedUPI,
                    transactionId: savedVerification.ocrAnalysis?.transactionId,
                    primaryEngine: savedVerification.ocrAnalysis?.primaryEngine,
                    backupUsed: savedVerification.ocrAnalysis?.backupUsed,
                    paymentType: savedVerification.ocrAnalysis?.paymentType,
                    wordCount: savedVerification.ocrAnalysis?.wordCount
                },
                validationResults: savedVerification.validationResults,
                fraudAnalysis: {
                    fraudScore: savedVerification.fraudAnalysis?.fraudScore,
                    riskLevel: savedVerification.fraudAnalysis?.riskLevel,
                    isSuspicious: savedVerification.fraudAnalysis?.isSuspicious
                },
                metadata: {
                    processingTime,
                    companyId,
                    ocrEngine: savedVerification.metadata?.ocrEngine,
                    paymentType: savedVerification.metadata?.paymentType
                },
                createdAt: savedVerification.createdAt
            },
            metadata: {
                processingTime,
                companyId
            },
            timestamp: new Date().toISOString()
        }, { status: 201 });

    } catch (error) {
        console.error('❌ POST /api/payments/verify error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// ========== GET HANDLER ==========
export async function GET(request) {
    const startTime = Date.now();
    
    try {
        // ===== MULTI-TENANCY: Get company context =====
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'MISSING_COMPANY_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const verificationId = searchParams.get('verificationId');
        const status = searchParams.get('status');
        const customerPhone = searchParams.get('customerPhone');
        const orderNumber = searchParams.get('orderNumber');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const page = parseInt(searchParams.get('page')) || 1;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        console.log('📥 GET /api/payments/verify - Request:', {
            companyId,
            id,
            verificationId,
            status,
            customerPhone,
            orderNumber,
            page,
            limit
        });

        // ===== SINGLE VERIFICATION BY ID =====
        if (id || verificationId) {
            const queryId = id || verificationId;
            
            let query = { companyId };
            
            if (isValidObjectId(queryId)) {
                query._id = queryId;
            } else {
                query.verificationId = queryId;
            }
            
            if (!includeDeleted) {
                query.deletedAt = null;
            }

            const verification = await PaymentVerification.findOne(query)
                .populate('orderReference')
                .lean();

            if (!verification) {
                return NextResponse.json({
                    success: false,
                    message: 'Payment verification not found',
                    error: 'NOT_FOUND',
                    timestamp: new Date().toISOString()
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: verification,
                metadata: {
                    processingTime: Date.now() - startTime,
                    companyId
                },
                timestamp: new Date().toISOString()
            });
        }

        // ===== BUILD QUERY FOR MULTIPLE VERIFICATIONS =====
        const query = { companyId };
        
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        
        if (status) query.status = status;
        if (customerPhone) {
            const cleanPhone = validatePhoneNumber(customerPhone);
            if (cleanPhone) query.customerPhone = cleanPhone;
        }
        if (orderNumber) query.orderNumber = orderNumber;
        
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }

        // ===== BUILD SORT OPTIONS =====
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // ===== EXECUTE QUERY =====
        const [verifications, total] = await Promise.all([
            PaymentVerification.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('orderReference', 'orderNumber totalPrice status')
                .lean(),
            PaymentVerification.countDocuments(query)
        ]);

        // ===== CALCULATE STATISTICS =====
        const stats = {
            total,
            pending: verifications.filter(v => v.status === PAYMENT_STATUS.PENDING).length,
            processing: verifications.filter(v => v.status === PAYMENT_STATUS.PROCESSING).length,
            verified: verifications.filter(v => v.status === PAYMENT_STATUS.VERIFIED).length,
            rejected: verifications.filter(v => v.status === PAYMENT_STATUS.REJECTED).length,
            fraud: verifications.filter(v => v.status === PAYMENT_STATUS.FRAUD).length,
            manualReview: verifications.filter(v => v.status === PAYMENT_STATUS.MANUAL_REVIEW).length,
            totalAmount: verifications.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
            verifiedAmount: verifications.filter(v => v.status === PAYMENT_STATUS.VERIFIED)
                .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
            pendingAmount: verifications.filter(v => v.status === PAYMENT_STATUS.PENDING)
                .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
            avgConfidence: verifications.length > 0 
                ? verifications.reduce((sum, v) => sum + (v.ocrAnalysis?.confidenceScore || 0), 0) / verifications.length 
                : 0
        };

        // ===== ENGINE STATISTICS =====
        const engineStats = {};
        verifications.forEach(v => {
            const engine = v.ocrAnalysis?.primaryEngine || 'unknown';
            if (!engineStats[engine]) {
                engineStats[engine] = { count: 0, totalConfidence: 0 };
            }
            engineStats[engine].count++;
            engineStats[engine].totalConfidence += v.ocrAnalysis?.confidenceScore || 0;
        });

        Object.keys(engineStats).forEach(engine => {
            engineStats[engine].avgConfidence = 
                engineStats[engine].totalConfidence / engineStats[engine].count;
        });

        const processingTime = Date.now() - startTime;

        console.log('✅ GET /api/payments/verify completed:', {
            companyId,
            count: verifications.length,
            total,
            page,
            processingTime: `${processingTime}ms`
        });

        return NextResponse.json({
            success: true,
            count: verifications.length,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: verifications,
            stats,
            engineStats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            metadata: {
                processingTime,
                companyId,
                query: { status, customerPhone, orderNumber, fromDate, toDate, includeDeleted }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ GET /api/payments/verify error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// ========== PUT HANDLER ==========
export async function PUT(request) {
    try {
        // ===== MULTI-TENANCY: Get company context =====
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'MISSING_COMPANY_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== AUTHENTICATION: Get user ID =====
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString()
            }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const verificationId = searchParams.get('verificationId');
        const action = searchParams.get('action');
        
        const queryId = id || verificationId;
        
        if (!queryId) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification ID is required',
                error: 'MISSING_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        if (!action || !['verify', 'reject', 'mark-fraud'].includes(action)) {
            return NextResponse.json({
                success: false,
                message: 'Valid action is required: verify, reject, or mark-fraud',
                error: 'INVALID_ACTION',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Invalid JSON in request body',
                error: 'PARSE_ERROR',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== FIND VERIFICATION AND VERIFY COMPANY OWNERSHIP =====
        let query = { companyId };
        if (isValidObjectId(queryId)) {
            query._id = queryId;
        } else {
            query.verificationId = queryId;
        }

        const verification = await PaymentVerification.findOne(query);
        
        if (!verification) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        // ===== PREPARE UPDATES BASED ON ACTION =====
        const updates = {
            updatedBy: userId,
            updatedAt: new Date()
        };

        const historyEntry = {
            status: '',
            changedBy: userId,
            changedAt: new Date(),
            reason: body.reason || '',
            metadata: body.metadata || {}
        };

        switch (action) {
            case 'verify':
                updates.status = PAYMENT_STATUS.VERIFIED;
                updates.verifiedAt = new Date();
                updates.verifiedBy = userId;
                updates.verificationMethod = body.method || VERIFICATION_METHODS.ADMIN_MANUAL;
                updates.verificationNotes = body.notes || '';
                
                if (body.confidenceScore !== undefined) {
                    updates.validationResults = {
                        ...(verification.validationResults || {}),
                        confidenceScore: body.confidenceScore,
                        validatedAt: new Date()
                    };
                }
                
                historyEntry.status = PAYMENT_STATUS.VERIFIED;
                historyEntry.reason = body.reason || 'Payment verified successfully';
                
                // Update order payment status if linked
                if (verification.orderReference) {
                    await Order.findByIdAndUpdate(verification.orderReference, {
                        paymentStatus: 'paid',
                        updatedBy: userId,
                        updatedAt: new Date()
                    });
                }
                break;

            case 'reject':
                updates.status = PAYMENT_STATUS.REJECTED;
                updates.rejectedAt = new Date();
                updates.rejectedBy = userId;
                updates.rejectionReason = body.reason || body.rejectionReason;
                updates.rejectionCategory = body.category || 'other';
                
                historyEntry.status = PAYMENT_STATUS.REJECTED;
                historyEntry.reason = body.reason || 'Payment rejected';
                break;

            case 'mark-fraud':
                updates.status = PAYMENT_STATUS.FRAUD;
                updates.fraudAnalysis = {
                    ...(verification.fraudAnalysis || {}),
                    isSuspicious: true,
                    fraudScore: 100,
                    reasons: body.reasons || ['Marked as fraud by admin'],
                    flags: body.flags || [],
                    markedAt: new Date(),
                    markedBy: userId,
                    riskLevel: 'critical'
                };
                updates.fraudMarkedAt = new Date();
                updates.fraudMarkedBy = userId;
                
                historyEntry.status = PAYMENT_STATUS.FRAUD;
                historyEntry.reason = body.reason || 'Marked as fraudulent';
                break;
        }

        // ===== ADD TO HISTORY =====
        if (!verification.verificationHistory) {
            updates.verificationHistory = [historyEntry];
        } else {
            updates.verificationHistory = [...verification.verificationHistory, historyEntry];
        }

        // ===== UPDATE VERIFICATION =====
        const updatedVerification = await PaymentVerification.findByIdAndUpdate(
            verification._id,
            updates,
            { new: true, runValidators: true }
        ).lean();

        console.log('✅ PUT /api/payments/verify completed:', {
            companyId,
            id: updatedVerification._id,
            action,
            status: updatedVerification.status
        });

        return NextResponse.json({
            success: true,
            message: `Payment verification ${action}ed successfully`,
            data: updatedVerification,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ PUT /api/payments/verify error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// ========== PATCH HANDLER ==========
export async function PATCH(request) {
    try {
        // ===== MULTI-TENANCY: Get company context =====
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'MISSING_COMPANY_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== AUTHENTICATION: Get user ID =====
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const verificationId = searchParams.get('verificationId');
        
        const queryId = id || verificationId;
        
        if (!queryId) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification ID is required',
                error: 'MISSING_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Invalid JSON in request body',
                error: 'PARSE_ERROR',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== FIND VERIFICATION AND VERIFY COMPANY OWNERSHIP =====
        let query = { companyId };
        if (isValidObjectId(queryId)) {
            query._id = queryId;
        } else {
            query.verificationId = queryId;
        }

        const verification = await PaymentVerification.findOne(query);
        
        if (!verification) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        // ===== ALLOWED FIELDS FOR PATCH =====
        const allowedUpdates = [
            'status',
            'verificationNotes',
            'adminNotes',
            'customerNotes',
            'tags',
            'metadata',
            'validationResults',
            'fraudAnalysis',
            'requiresFollowUp',
            'followUpReason',
            'followUpDate'
        ];

        const updates = {
            updatedBy: userId,
            updatedAt: new Date()
        };

        allowedUpdates.forEach(field => {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        });

        // ===== ADD TO HISTORY IF STATUS IS CHANGING =====
        if (body.status && body.status !== verification.status) {
            const historyEntry = {
                status: body.status,
                changedBy: userId || 'system',
                changedAt: new Date(),
                reason: body.reason || `Status updated to ${body.status}`,
                metadata: body.metadata || {}
            };

            if (!verification.verificationHistory) {
                updates.verificationHistory = [historyEntry];
            } else {
                updates.verificationHistory = [...verification.verificationHistory, historyEntry];
            }
        }

        const updatedVerification = await PaymentVerification.findByIdAndUpdate(
            verification._id,
            updates,
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json({
            success: true,
            message: 'Payment verification updated successfully',
            data: updatedVerification,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ PATCH /api/payments/verify error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// ========== DELETE HANDLER ==========
export async function DELETE(request) {
    try {
        // ===== MULTI-TENANCY: Get company context =====
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'MISSING_COMPANY_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== AUTHENTICATION: Get user ID =====
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString()
            }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const verificationId = searchParams.get('verificationId');
        const permanent = searchParams.get('permanent') === 'true';
        
        const queryId = id || verificationId;
        
        if (!queryId) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification ID is required',
                error: 'MISSING_ID',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // ===== FIND VERIFICATION AND VERIFY COMPANY OWNERSHIP =====
        let query = { companyId };
        if (isValidObjectId(queryId)) {
            query._id = queryId;
        } else {
            query.verificationId = queryId;
        }

        const verification = await PaymentVerification.findOne(query);
        
        if (!verification) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        if (permanent) {
            // ===== PERMANENT DELETE =====
            await PaymentVerification.findByIdAndDelete(verification._id);
        } else {
            // ===== SOFT DELETE =====
            await PaymentVerification.findByIdAndUpdate(verification._id, {
                deletedAt: new Date(),
                deletedBy: userId,
                isActive: false,
                status: PAYMENT_STATUS.REJECTED,
                updatedBy: userId,
                updatedAt: new Date(),
                $push: {
                    verificationHistory: {
                        status: 'deleted',
                        changedBy: userId,
                        changedAt: new Date(),
                        reason: 'Payment verification soft deleted'
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: permanent ? 'Payment verification permanently deleted' : 'Payment verification soft deleted',
            data: { id: verification._id, verificationId: verification.verificationId },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ DELETE /api/payments/verify error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// ========== OPTIONS HANDLER ==========
export async function OPTIONS(request) {
    return NextResponse.json({
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        description: 'Multi-tenant Payment Verification API with 3-OCR Support',
        required: ['companyId'],
        features: [
            'Multi-tenant company isolation',
            '3-OCR engine support (PaddleOCR, EasyOCR, QR)',
            'UPI, GPay, PhonePe, PayTM payment validation',
            'Fraud detection with risk scoring',
            'Complete audit trail with verification history',
            'Auto vs manual verification workflow',
            'Company-specific UPI ID validation',
            'Phone number payment validation',
            'QR code payment support'
        ],
        endpoints: {
            GET: {
                description: 'Retrieve payment verifications',
                parameters: {
                    companyId: 'Required - Company ID',
                    id: 'Get by MongoDB ID',
                    verificationId: 'Get by verification ID',
                    status: 'Filter by status (pending/verified/rejected/fraud)',
                    customerPhone: 'Filter by customer phone',
                    orderNumber: 'Filter by order number',
                    fromDate: 'Start date filter (YYYY-MM-DD)',
                    toDate: 'End date filter (YYYY-MM-DD)',
                    page: 'Page number (default: 1)',
                    limit: 'Items per page (default: 50)',
                    sortBy: 'Sort field (createdAt/updatedAt/status)',
                    sortOrder: 'asc or desc',
                    includeDeleted: 'Include soft deleted records'
                }
            },
            POST: {
                description: 'Create a new payment verification',
                required: ['companyId', 'orderNumber', 'customerPhone'],
                body: {
                    orderNumber: 'Order number (required)',
                    customerPhone: 'Customer phone number (required)',
                    customerName: 'Customer name (optional)',
                    orderReference: 'Order ObjectId (optional)',
                    orderDetails: 'Complete order details object',
                    paymentProof: 'Payment proof image data',
                    ocrAnalysis: '3-OCR analysis results with confidence scores',
                    detectedPayment: 'Detected payment information',
                    validationResults: 'Validation results',
                    fraudAnalysis: 'Fraud analysis results',
                    metadata: 'Additional metadata'
                }
            },
            PUT: {
                description: 'Perform actions on verification',
                parameters: {
                    companyId: 'Required',
                    id: 'Verification ID',
                    action: 'verify, reject, mark-fraud'
                },
                body: {
                    verifiedBy: 'User performing verification',
                    reason: 'Reason for action',
                    confidenceScore: 'Confidence score for verification',
                    notes: 'Additional notes',
                    category: 'Rejection category',
                    reasons: 'Fraud reasons (array)',
                    flags: 'Fraud flags (array)'
                }
            },
            PATCH: {
                description: 'Partial update of verification',
                parameters: { companyId: 'Required', id: 'Verification ID' },
                allowedFields: [
                    'status', 'verificationNotes', 'adminNotes', 'customerNotes',
                    'tags', 'metadata', 'validationResults', 'fraudAnalysis',
                    'requiresFollowUp', 'followUpReason', 'followUpDate'
                ]
            },
            DELETE: {
                description: 'Delete verification (soft delete by default)',
                parameters: {
                    companyId: 'Required',
                    id: 'Verification ID',
                    permanent: 'Set true for permanent delete (default: false)'
                }
            }
        }
    }, { 
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
        }
    });
}