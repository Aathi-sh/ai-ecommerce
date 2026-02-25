// app/api/payments/verify/route.js - ENHANCED PROFESSIONAL VERSION
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ========== CONFIGURATION ==========
const VALID_UPI_IDS = [
    'subaask21@oksbi',
    'posterpro.store@okaxis', 
    'posterpro.store@paytm',
    'posterpro.store@axl',
    'posterpro.store@ybl'
];

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

// ========== MONGODB CONNECTION ==========
async function connectToDatabase() {
    if (mongoose.connections[0].readyState) {
        return mongoose.connections[0];
    }
    
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
        return connection;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

// ========== MONGODB SCHEMA ==========
const paymentVerificationSchema = new mongoose.Schema({
    verificationId: {
        type: String,
        required: true,
        unique: true,
        default: () => `PV_${Date.now()}_${uuidv4().slice(0, 8)}`
    },
    orderNumber: {
        type: String,
        required: true,
        index: true
    },
    customerPhone: {
        type: String,
        required: true,
        index: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    customerName: {
        type: String,
        trim: true
    },
    orderReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        index: true
    },
    
    // Order Details
    orderDetails: {
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: Number,
        totalGst: Number,
        items: [{
            productId: mongoose.Schema.Types.ObjectId,
            productName: String,
            quantity: Number,
            price: Number,
            mrp: Number,
            gstRate: Number
        }],
        shippingAddress: mongoose.Schema.Types.Mixed,
        pincode: String,
        customerEmail: String
    },

    // Payment Proof
    paymentProof: {
        imageData: String,
        mimeType: {
            type: String,
            enum: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        },
        fileSize: Number,
        originalFilename: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        imageHash: String,
        imageUrl: String
    },

    // OCR Analysis Results
    ocrAnalysis: {
        extractedText: String,
        confidenceScore: {
            type: Number,
            min: 0,
            max: 100
        },
        wordCount: Number,
        processingTime: Number,
        extractedAmount: Number,
        extractedUPI: String,
        transactionId: String,
        extractedTime: String,
        extractedDate: String,
        appName: String,
        bankName: String,
        rawText: String,
        processedAt: {
            type: Date,
            default: Date.now
        },
        ocrEngine: String,
        ocrVersion: String
    },

    // Detected Payment Information
    detectedPayment: {
        amount: {
            type: Number,
            min: 0
        },
        upiId: String,
        transactionId: String,
        transactionTime: Date,
        status: {
            type: String,
            enum: ['success', 'failed', 'pending', 'unknown'],
            default: 'unknown'
        },
        appName: String,
        bankName: String,
        payerName: String,
        payerVPA: String,
        payeeVPA: String,
        reference: String,
        remarks: String
    },

    // Validation Results
    validationResults: {
        amountMatch: {
            type: Boolean,
            default: false
        },
        upiMatch: {
            type: Boolean,
            default: false
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        matchQuality: {
            type: String,
            enum: ['exact', 'close', 'near', 'far', 'none'],
            default: 'none'
        },
        amountDifference: Number,
        expectedAmount: Number,
        foundAmount: Number,
        validationErrors: [String],
        validationWarnings: [String],
        validationPassed: {
            type: Boolean,
            default: false
        },
        verifiedAt: Date
    },

    // Fraud Detection Results
    fraudAnalysis: {
        isSuspicious: {
            type: Boolean,
            default: false
        },
        fraudScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        reasons: [String],
        flags: [String],
        ipAddress: String,
        userAgent: String,
        deviceFingerprint: String,
        locationData: mongoose.Schema.Types.Mixed
    },

    // Verification Status
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        index: true
    },
    
    // Verification Metadata
    verifiedAt: Date,
    verifiedBy: String,
    verificationMethod: {
        type: String,
        enum: Object.values(VERIFICATION_METHODS),
        default: VERIFICATION_METHODS.AUTO_OCR
    },
    verificationNotes: String,
    verificationHistory: [{
        status: String,
        changedBy: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        reason: String,
        metadata: mongoose.Schema.Types.Mixed
    }],

    // Rejection Details
    rejectedAt: Date,
    rejectedBy: String,
    rejectionReason: String,
    rejectionCategory: {
        type: String,
        enum: ['amount_mismatch', 'upi_mismatch', 'old_payment', 'duplicate', 'fraud', 'other']
    },

    // Invoice Details
    invoiceNumber: String,
    invoiceGenerated: {
        type: Boolean,
        default: false
    },
    invoiceGeneratedAt: Date,
    invoiceUrl: String,

    // System Fields
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30*24*60*60*1000)
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    metadata: mongoose.Schema.Types.Mixed,
    tags: [String]
}, {
    timestamps: true,
    collection: 'payment_verifications'
});

// Indexes for better performance
paymentVerificationSchema.index({ orderNumber: 1, customerPhone: 1 });
paymentVerificationSchema.index({ status: 1, createdAt: -1 });
paymentVerificationSchema.index({ 'detectedPayment.transactionId': 1 });
paymentVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
paymentVerificationSchema.index({ isActive: 1, status: 1 });

// Pre-save middleware
paymentVerificationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // Calculate fraud score based on validation results
    if (this.validationResults && !this.fraudAnalysis.fraudScore) {
        let score = 0;
        
        if (!this.validationResults.amountMatch) score += 30;
        if (!this.validationResults.upiMatch) score += 30;
        if (this.validationResults.confidenceScore < 70) score += 20;
        if (this.detectedPayment?.status === 'failed') score += 50;
        
        this.fraudAnalysis.fraudScore = Math.min(100, score);
        this.fraudAnalysis.isSuspicious = score > 50;
    }
    
    next();
});

// Get or create model
const PaymentVerification = mongoose.models.PaymentVerification || 
    mongoose.model('PaymentVerification', paymentVerificationSchema);

// ========== IN-MEMORY STORAGE FALLBACK ==========
class InMemoryStorage {
    constructor() {
        this.verifications = new Map();
        this.counter = 0;
    }

    create(data) {
        const id = `PV_${Date.now()}_${uuidv4().slice(0, 8)}`;
        const verification = {
            _id: id,
            verificationId: id,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
        this.verifications.set(id, verification);
        return verification;
    }

    find(query = {}) {
        let results = Array.from(this.verifications.values());
        
        if (query.status) {
            results = results.filter(v => v.status === query.status);
        }
        if (query.customerPhone) {
            results = results.filter(v => v.customerPhone === query.customerPhone);
        }
        if (query.orderNumber) {
            results = results.filter(v => v.orderNumber === query.orderNumber);
        }
        
        return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    findById(id) {
        return this.verifications.get(id) || null;
    }

    updateById(id, updates) {
        const verification = this.verifications.get(id);
        if (!verification) return null;
        
        const updated = {
            ...verification,
            ...updates,
            updatedAt: new Date()
        };
        this.verifications.set(id, updated);
        return updated;
    }

    deleteById(id) {
        return this.verifications.delete(id);
    }
}

const inMemoryStorage = new InMemoryStorage();

// ========== HELPER FUNCTIONS ==========

function generateVerificationId() {
    return `PV_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

function validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? cleaned : null;
}

function validateUPI(upiId) {
    if (!upiId) return false;
    const cleanUpi = upiId.toLowerCase().trim();
    return VALID_UPI_IDS.some(valid => 
        cleanUpi === valid || 
        cleanUpi.includes(valid.split('@')[0]) ||
        valid.includes(cleanUpi.split('@')[0])
    );
}

function calculateFraudScore(validation) {
    let score = 0;
    
    if (!validation.amountMatch) score += 30;
    if (!validation.upiMatch) score += 30;
    if (validation.confidenceScore < 70) score += 20;
    
    return Math.min(100, score);
}

function sanitizeImageData(imageData) {
    if (!imageData) return null;
    // Truncate large image data for storage
    return imageData.length > 10000 ? imageData.substring(0, 10000) : imageData;
}

// ========== API HANDLERS ==========

/**
 * POST /api/payments/verify
 * Create a new payment verification
 */
export async function POST(request) {
    const startTime = Date.now();
    
    try {
        // Parse request body
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
            orderNumber: body.orderNumber,
            customerPhone: body.customerPhone,
            hasOrderReference: !!body.orderReference,
            timestamp: new Date().toISOString()
        });

        // Validate required fields
        if (!body.orderNumber || !body.customerPhone) {
            return NextResponse.json({
                success: false,
                message: 'Order number and customer phone are required',
                error: 'MISSING_FIELDS',
                requiredFields: ['orderNumber', 'customerPhone'],
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        // Validate phone number
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

        // Check for duplicate (recent verification for same order)
        let existingVerification = null;
        try {
            await connectToDatabase();
            existingVerification = await PaymentVerification.findOne({
                orderNumber: body.orderNumber,
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
            }).lean();
        } catch (dbError) {
            const recent = inMemoryStorage.find({ orderNumber: body.orderNumber })
                .filter(v => new Date(v.createdAt) > new Date(Date.now() - 5 * 60 * 1000));
            existingVerification = recent[0];
        }

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

        // Prepare verification data
        const verificationData = {
            verificationId: generateVerificationId(),
            orderNumber: body.orderNumber,
            customerPhone: cleanPhone,
            customerName: body.customerName || '',
            orderReference: body.orderReference || null,
            
            orderDetails: {
                totalAmount: body.orderDetails?.totalAmount || body.detectedPayment?.amount || 0,
                subtotal: body.orderDetails?.subtotal || 0,
                totalGst: body.orderDetails?.totalGst || 0,
                items: body.orderDetails?.items || [],
                shippingAddress: body.orderDetails?.shippingAddress || {},
                pincode: body.orderDetails?.pincode || '',
                customerEmail: body.orderDetails?.customerEmail || ''
            },

            paymentProof: {
                imageData: sanitizeImageData(body.paymentProof?.imageData),
                mimeType: body.paymentProof?.mimeType || 'image/jpeg',
                fileSize: body.paymentProof?.imageData?.length || 0,
                originalFilename: body.paymentProof?.filename || 'payment_screenshot.jpg',
                uploadedAt: new Date(),
                imageHash: body.paymentProof?.imageHash || null,
                imageUrl: body.paymentProof?.imageUrl || null
            },

            ocrAnalysis: {
                extractedText: body.ocrAnalysis?.extractedText || '',
                confidenceScore: body.ocrAnalysis?.confidenceScore || 0,
                wordCount: body.ocrAnalysis?.wordCount || 0,
                processingTime: body.ocrAnalysis?.processingTime || 0,
                extractedAmount: body.ocrAnalysis?.extractedAmount || null,
                extractedUPI: body.ocrAnalysis?.extractedUPI || null,
                transactionId: body.ocrAnalysis?.transactionId || null,
                extractedTime: body.ocrAnalysis?.timestamp || null,
                appName: body.ocrAnalysis?.appName || null,
                bankName: body.ocrAnalysis?.bankName || null,
                rawText: body.ocrAnalysis?.rawText || body.ocrAnalysis?.extractedText || '',
                ocrEngine: 'tesseract.js',
                ocrVersion: '4.0.0'
            },

            detectedPayment: {
                amount: body.detectedPayment?.amount || body.ocrAnalysis?.extractedAmount || null,
                upiId: body.detectedPayment?.upiId || body.ocrAnalysis?.extractedUPI || null,
                transactionId: body.detectedPayment?.transactionId || body.ocrAnalysis?.transactionId || null,
                transactionTime: body.detectedPayment?.transactionTime || body.detectedPayment?.timestamp || new Date(),
                status: body.detectedPayment?.status || 'success',
                appName: body.detectedPayment?.appName || body.ocrAnalysis?.appName || null,
                bankName: body.detectedPayment?.bankName || body.ocrAnalysis?.bankName || null,
                payerName: body.detectedPayment?.payerName || null,
                payerVPA: body.detectedPayment?.payerVPA || null,
                payeeVPA: body.detectedPayment?.payeeVPA || body.ocrAnalysis?.extractedUPI || null,
                reference: body.detectedPayment?.reference || null,
                remarks: body.detectedPayment?.remarks || ''
            },

            validationResults: body.validationResults || {
                amountMatch: false,
                upiMatch: false,
                confidenceScore: body.ocrAnalysis?.confidenceScore || 0,
                matchQuality: 'none',
                validationErrors: [],
                validationWarnings: []
            },

            fraudAnalysis: body.fraudAnalysis || {
                isSuspicious: false,
                fraudScore: 0,
                reasons: [],
                flags: []
            },

            status: PAYMENT_STATUS.PENDING,
            verificationHistory: [{
                status: PAYMENT_STATUS.PENDING,
                changedBy: 'system',
                changedAt: new Date(),
                reason: 'Payment verification created',
                metadata: { source: body.metadata?.source || 'whatsapp' }
            }],

            metadata: {
                source: body.metadata?.source || 'whatsapp',
                ipAddress: request.headers.get('x-forwarded-for') || request.ip,
                userAgent: request.headers.get('user-agent'),
                requestId: uuidv4()
            },

            tags: body.tags || [],
            isActive: true
        };

        // Calculate validation results if not provided
        if (!body.validationResults && verificationData.detectedPayment.amount && body.orderDetails?.totalAmount) {
            const expectedAmount = body.orderDetails.totalAmount;
            const foundAmount = verificationData.detectedPayment.amount;
            const amountDiff = Math.abs(expectedAmount - foundAmount);
            
            verificationData.validationResults = {
                amountMatch: amountDiff <= 2,
                upiMatch: validateUPI(verificationData.detectedPayment.upiId),
                confidenceScore: body.ocrAnalysis?.confidenceScore || 0,
                matchQuality: amountDiff === 0 ? 'exact' : amountDiff <= 2 ? 'close' : amountDiff <= 10 ? 'near' : 'far',
                amountDifference: amountDiff,
                expectedAmount: expectedAmount,
                foundAmount: foundAmount,
                validationErrors: [],
                validationWarnings: []
            };
        }

        // Calculate fraud score
        verificationData.fraudAnalysis.fraudScore = calculateFraudScore(verificationData.validationResults);
        verificationData.fraudAnalysis.isSuspicious = verificationData.fraudAnalysis.fraudScore > 50;

        // Save to database
        let savedVerification;
        let usingMongoDB = false;

        try {
            await connectToDatabase();
            
            const newVerification = new PaymentVerification(verificationData);
            await newVerification.save();
            savedVerification = newVerification.toObject();
            usingMongoDB = true;
            
            console.log('✅ Payment verification saved to MongoDB:', savedVerification._id);
        } catch (dbError) {
            console.warn('⚠️ MongoDB save failed, using in-memory storage:', dbError.message);
            
            savedVerification = inMemoryStorage.create(verificationData);
            console.log('✅ Payment verification saved to in-memory storage:', savedVerification._id);
        }

        const processingTime = Date.now() - startTime;
        console.log('✅ POST /api/payments/verify completed:', {
            id: savedVerification._id,
            status: savedVerification.status,
            processingTime: `${processingTime}ms`,
            storage: usingMongoDB ? 'mongodb' : 'memory'
        });

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
                validationResults: savedVerification.validationResults,
                fraudScore: savedVerification.fraudAnalysis?.fraudScore,
                createdAt: savedVerification.createdAt,
                verificationHistory: savedVerification.verificationHistory
            },
            metadata: {
                processingTime,
                storage: usingMongoDB ? 'mongodb' : 'memory'
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

/**
 * GET /api/payments/verify
 * Get payment verifications with filters
 */
export async function GET(request) {
    const startTime = Date.now();
    
    try {
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
        const includeInactive = searchParams.get('includeInactive') === 'true';

        console.log('📥 GET /api/payments/verify - Request:', {
            id, verificationId, status, customerPhone, orderNumber,
            fromDate, toDate, page, limit, includeInactive
        });

        // If ID is provided, get single verification
        if (id || verificationId) {
            const queryId = id || verificationId;
            
            let verification;
            try {
                await connectToDatabase();
                
                verification = await PaymentVerification.findOne({
                    $or: [
                        { _id: queryId },
                        { verificationId: queryId }
                    ]
                }).lean();
            } catch (dbError) {
                verification = inMemoryStorage.findById(queryId);
            }

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
                timestamp: new Date().toISOString()
            });
        }

        // Build query for multiple verifications
        const query = {};
        
        if (!includeInactive) {
            query.isActive = true;
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

        // Build sort options
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        let results = [];
        let total = 0;
        let usingMongoDB = false;

        try {
            await connectToDatabase();
            
            const [verifications, count] = await Promise.all([
                PaymentVerification.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                PaymentVerification.countDocuments(query)
            ]);
            
            results = verifications;
            total = count;
            usingMongoDB = true;
        } catch (dbError) {
            console.warn('⚠️ MongoDB query failed, using in-memory storage:', dbError.message);
            
            let filtered = inMemoryStorage.find(query);
            
            filtered.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];
                const multiplier = sortOrder === 'asc' ? 1 : -1;
                
                if (aVal < bVal) return -1 * multiplier;
                if (aVal > bVal) return 1 * multiplier;
                return 0;
            });
            
            total = filtered.length;
            results = filtered.slice(skip, skip + limit);
        }

        // Calculate statistics
        const stats = {
            total: total,
            pending: results.filter(v => v.status === PAYMENT_STATUS.PENDING).length,
            verified: results.filter(v => v.status === PAYMENT_STATUS.VERIFIED).length,
            rejected: results.filter(v => v.status === PAYMENT_STATUS.REJECTED).length,
            fraud: results.filter(v => v.status === PAYMENT_STATUS.FRAUD).length,
            totalAmount: results.reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
            verifiedAmount: results.filter(v => v.status === PAYMENT_STATUS.VERIFIED)
                .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0),
            pendingAmount: results.filter(v => v.status === PAYMENT_STATUS.PENDING)
                .reduce((sum, v) => sum + (v.orderDetails?.totalAmount || 0), 0)
        };

        const processingTime = Date.now() - startTime;
        console.log('✅ GET /api/payments/verify completed:', {
            count: results.length,
            total,
            page,
            processingTime: `${processingTime}ms`,
            storage: usingMongoDB ? 'mongodb' : 'memory'
        });

        return NextResponse.json({
            success: true,
            count: results.length,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: results,
            stats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            metadata: {
                processingTime,
                storage: usingMongoDB ? 'mongodb' : 'memory',
                query: { status, customerPhone, orderNumber, fromDate, toDate, includeInactive }
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

/**
 * PATCH /api/payments/verify
 * Update payment verification (partial updates)
 */
export async function PATCH(request) {
    try {
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

        console.log('📥 PATCH /api/payments/verify:', { id: queryId, updates: body });

        // Prepare updates
        const updates = {
            ...body,
            updatedAt: new Date()
        };

        // Add to history if status is changing
        if (body.status) {
            updates.$push = {
                verificationHistory: {
                    status: body.status,
                    changedBy: body.changedBy || 'system',
                    changedAt: new Date(),
                    reason: body.reason || `Status updated to ${body.status}`,
                    metadata: body.metadata || {}
                }
            };
        }

        let updatedVerification;
        let usingMongoDB = false;

        try {
            await connectToDatabase();
            
            updatedVerification = await PaymentVerification.findOneAndUpdate(
                { $or: [{ _id: queryId }, { verificationId: queryId }] },
                updates,
                { new: true, runValidators: true }
            ).lean();
            
            usingMongoDB = true;
        } catch (dbError) {
            console.warn('⚠️ MongoDB update failed, using in-memory storage:', dbError.message);
            
            const existing = inMemoryStorage.findById(queryId);
            if (existing) {
                updatedVerification = inMemoryStorage.updateById(queryId, updates);
            }
        }

        if (!updatedVerification) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        console.log('✅ PATCH /api/payments/verify completed:', {
            id: updatedVerification._id,
            status: updatedVerification.status,
            storage: usingMongoDB ? 'mongodb' : 'memory'
        });

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

/**
 * PUT /api/payments/verify
 * Complete payment verification actions (verify, reject, mark-fraud)
 */
export async function PUT(request) {
    try {
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

        console.log('📥 PUT /api/payments/verify:', { id: queryId, action, body });

        // Prepare updates based on action
        const updates = {
            updatedAt: new Date()
        };

        const historyEntry = {
            changedBy: body.changedBy || body.verifiedBy || body.rejectedBy || 'system',
            changedAt: new Date(),
            reason: body.reason || '',
            metadata: body.metadata || {}
        };

        switch (action) {
            case 'verify':
                updates.status = PAYMENT_STATUS.VERIFIED;
                updates.verifiedAt = new Date();
                updates.verifiedBy = body.verifiedBy || 'auto-verification';
                updates.verificationMethod = body.method || VERIFICATION_METHODS.AUTO_OCR;
                updates.verificationNotes = body.notes || '';
                
                if (body.confidenceScore !== undefined) {
                    updates.validationResults = {
                        ...(body.validationResults || {}),
                        confidenceScore: body.confidenceScore,
                        verifiedAt: new Date()
                    };
                }
                
                historyEntry.status = PAYMENT_STATUS.VERIFIED;
                historyEntry.reason = body.reason || 'Payment verified successfully';
                break;

            case 'reject':
                updates.status = PAYMENT_STATUS.REJECTED;
                updates.rejectedAt = new Date();
                updates.rejectedBy = body.rejectedBy || 'admin';
                updates.rejectionReason = body.reason || body.rejectionReason;
                updates.rejectionCategory = body.category || 'other';
                
                historyEntry.status = PAYMENT_STATUS.REJECTED;
                historyEntry.reason = body.reason || 'Payment rejected';
                break;

            case 'mark-fraud':
                updates.status = PAYMENT_STATUS.FRAUD;
                updates.fraudAnalysis = {
                    ...(body.fraudAnalysis || {}),
                    isSuspicious: true,
                    fraudScore: 100,
                    reasons: body.reasons || ['Marked as fraud by admin'],
                    flags: body.flags || [],
                    markedAt: new Date(),
                    markedBy: body.markedBy || 'admin'
                };
                
                historyEntry.status = PAYMENT_STATUS.FRAUD;
                historyEntry.reason = body.reason || 'Marked as fraudulent';
                break;
        }

        updates.$push = {
            verificationHistory: historyEntry
        };

        let updatedVerification;
        let usingMongoDB = false;

        try {
            await connectToDatabase();
            
            updatedVerification = await PaymentVerification.findOneAndUpdate(
                { $or: [{ _id: queryId }, { verificationId: queryId }] },
                updates,
                { new: true, runValidators: true }
            ).lean();
            
            usingMongoDB = true;
        } catch (dbError) {
            console.warn('⚠️ MongoDB update failed, using in-memory storage:', dbError.message);
            
            const existing = inMemoryStorage.findById(queryId);
            if (existing) {
                const existingHistory = existing.verificationHistory || [];
                updatedVerification = inMemoryStorage.updateById(queryId, {
                    ...updates,
                    verificationHistory: [...existingHistory, historyEntry]
                });
            }
        }

        if (!updatedVerification) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        console.log('✅ PUT /api/payments/verify completed:', {
            id: updatedVerification._id,
            action,
            status: updatedVerification.status,
            storage: usingMongoDB ? 'mongodb' : 'memory'
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

/**
 * DELETE /api/payments/verify
 * Delete payment verification (soft delete)
 */
export async function DELETE(request) {
    try {
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

        console.log('🗑️ DELETE /api/payments/verify:', { id: queryId, permanent });

        let deleted = false;
        let usingMongoDB = false;

        try {
            await connectToDatabase();
            
            if (permanent) {
                const result = await PaymentVerification.findOneAndDelete({
                    $or: [{ _id: queryId }, { verificationId: queryId }]
                });
                deleted = !!result;
            } else {
                const result = await PaymentVerification.findOneAndUpdate(
                    { $or: [{ _id: queryId }, { verificationId: queryId }] },
                    {
                        isActive: false,
                        status: PAYMENT_STATUS.REJECTED,
                        updatedAt: new Date(),
                        $push: {
                            verificationHistory: {
                                status: 'deleted',
                                changedBy: 'system',
                                changedAt: new Date(),
                                reason: 'Payment verification deleted'
                            }
                        }
                    },
                    { new: true }
                );
                deleted = !!result;
            }
            
            usingMongoDB = true;
        } catch (dbError) {
            console.warn('⚠️ MongoDB delete failed, using in-memory storage:', dbError.message);
            
            if (permanent) {
                deleted = inMemoryStorage.deleteById(queryId);
            } else {
                const existing = inMemoryStorage.findById(queryId);
                if (existing) {
                    inMemoryStorage.updateById(queryId, {
                        isActive: false,
                        status: PAYMENT_STATUS.REJECTED,
                        updatedAt: new Date()
                    });
                    deleted = true;
                }
            }
        }

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: 'Payment verification not found',
                error: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            }, { status: 404 });
        }

        console.log('✅ DELETE /api/payments/verify completed:', {
            id: queryId,
            permanent,
            storage: usingMongoDB ? 'mongodb' : 'memory'
        });

        return NextResponse.json({
            success: true,
            message: permanent ? 'Payment verification permanently deleted' : 'Payment verification soft deleted',
            data: { id: queryId, deleted: true },
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

/**
 * OPTIONS /api/payments/verify
 * CORS preflight and API documentation
 */
export async function OPTIONS(request) {
    return NextResponse.json({
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        description: 'Payment Verification API',
        endpoints: {
            GET: {
                description: 'Retrieve payment verifications',
                parameters: {
                    id: 'Get by ID',
                    verificationId: 'Get by verification ID',
                    status: 'Filter by status (pending, verified, rejected, fraud)',
                    customerPhone: 'Filter by customer phone',
                    orderNumber: 'Filter by order number',
                    fromDate: 'Start date filter',
                    toDate: 'End date filter',
                    page: 'Page number',
                    limit: 'Items per page',
                    includeInactive: 'Include inactive verifications'
                }
            },
            POST: {
                description: 'Create a new payment verification',
                required: ['orderNumber', 'customerPhone'],
                body: {
                    orderNumber: 'Order number',
                    customerPhone: 'Customer phone number',
                    orderDetails: 'Order details object',
                    paymentProof: 'Payment proof image data',
                    ocrAnalysis: 'OCR analysis results',
                    detectedPayment: 'Detected payment information'
                }
            },
            PUT: {
                description: 'Perform actions on verification',
                parameters: {
                    id: 'Verification ID',
                    action: 'verify, reject, mark-fraud'
                },
                body: {
                    verifiedBy: 'User performing verification',
                    reason: 'Reason for action',
                    confidenceScore: 'Confidence score for verification'
                }
            },
            PATCH: {
                description: 'Partial update of verification',
                parameters: { id: 'Verification ID' }
            },
            DELETE: {
                description: 'Delete verification',
                parameters: {
                    id: 'Verification ID',
                    permanent: 'Set true for permanent delete'
                }
            }
        },
        timestamp: new Date().toISOString()
    });
}