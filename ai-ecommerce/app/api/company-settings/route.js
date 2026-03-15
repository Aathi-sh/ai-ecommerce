

// // above code is without saas












// // app/api/company-settings/route.js
// import { NextResponse } from 'next/server';
// import { connectDB } from '@/utils/db';
// import CompanySettings from '@/models/CompanySettings';
// import Company from '@/models/Company';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/nextauth';
// import { writeFile, unlink, mkdir } from 'fs/promises';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import sharp from 'sharp';
// import mongoose from 'mongoose';

// // ==================== CONFIGURATION ====================
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// export const maxDuration = 30;
// export const revalidate = 0;

// const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/company');
// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// // ==================== HELPER FUNCTIONS ====================

// const isValidObjectId = (id) => {
//     return mongoose.Types.ObjectId.isValid(id) && 
//            /^[0-9a-fA-F]{24}$/.test(id);
// };

// const getCompanyContext = async (request) => {
//     try {
//         const companyId = request.headers.get('x-company-id') || 
//                          request.nextUrl?.searchParams.get('companyId');
        
//         if (companyId && isValidObjectId(companyId)) {
//             const company = await Company.findById(companyId);
//             if (company) return companyId;
//         }
//         return null;
//     } catch (error) {
//         console.error('Error getting company context:', error);
//         return null;
//     }
// };

// /**
//  * Validate UPI ID format
//  */
// function isValidUpiId(upiId) {
//     if (!upiId || typeof upiId !== 'string') return false;
//     const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
//     return upiPattern.test(upiId);
// }

// /**
//  * Validate GSTIN format
//  */
// function isValidGstin(gstin) {
//     if (!gstin) return true;
//     const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     return gstinPattern.test(gstin);
// }

// /**
//  * Validate PAN format
//  */
// function isValidPan(pan) {
//     if (!pan) return true;
//     const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//     return panPattern.test(pan);
// }

// /**
//  * Validate IFSC code format
//  */
// function isValidIfsc(ifsc) {
//     if (!ifsc) return true;
//     const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
//     return ifscPattern.test(ifsc);
// }

// /**
//  * Validate email format
//  */
// function isValidEmail(email) {
//     if (!email) return false;
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailPattern.test(email);
// }

// /**
//  * Validate phone number
//  */
// function isValidPhone(phone) {
//     if (!phone) return false;
//     const digits = phone.replace(/\D/g, '');
//     return digits.length >= 10 && digits.length <= 12;
// }

// /**
//  * Validate color hex code
//  */
// function isValidColor(color) {
//     return /^#[0-9A-F]{6}$/i.test(color);
// }

// /**
//  * Validate order flow mode
//  */
// function isValidOrderFlowMode(mode) {
//     return mode === 'short' || mode === 'long';
// }

// /**
//  * Process and save uploaded image
//  */
// async function processAndSaveImage(file, type) {
//     try {
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);
        
//         if (buffer.length > MAX_FILE_SIZE) {
//             throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
//         }
        
//         await mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});
        
//         const extension = file.name.split('.').pop() || 'png';
//         const filename = `${type}-${uuidv4()}.${extension}`;
//         const filepath = path.join(UPLOAD_DIR, filename);
        
//         let processedBuffer = buffer;
        
//         if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
//             try {
//                 processedBuffer = await sharp(buffer)
//                     .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
//                     .toBuffer();
//             } catch (sharpError) {
//                 console.warn('Sharp processing failed:', sharpError.message);
//             }
//         }
        
//         await writeFile(filepath, processedBuffer);
//         return `/uploads/company/${filename}`;
        
//     } catch (error) {
//         console.error('Image processing error:', error);
//         throw error;
//     }
// }

// /**
//  * Delete old image file
//  */
// async function deleteOldImage(imageUrl) {
//     if (!imageUrl) return;
//     try {
//         const filename = path.basename(imageUrl);
//         const filepath = path.join(UPLOAD_DIR, filename);
//         await unlink(filepath).catch(() => {});
//     } catch (error) {
//         console.warn('Failed to delete old image:', error.message);
//     }
// }

// // ==================== GET HANDLER ====================

// export async function GET(request) {
//     try {
//         // Get company context
//         const companyId = await getCompanyContext(request);
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required',
//                 error: 'Missing or invalid company ID'
//             }, { status: 400 });
//         }

//         await connectDB();
        
//         // Get settings for this specific company
//         let settings = await CompanySettings.findOne({ companyId });
        
//         // If no settings exist, return 404 (should be created during company setup)
//         if (!settings) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company settings not found',
//                 error: 'Settings not configured for this company'
//             }, { status: 404 });
//         }
        
//         return NextResponse.json({
//             success: true,
//             data: settings,
//             companyId
//         });
        
//     } catch (error) {
//         console.error('❌ Error fetching company settings:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to fetch company settings',
//                 details: process.env.NODE_ENV === 'development' ? error.message : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// // ==================== PUT HANDLER ====================

// export async function PUT(request) {
//     try {
//         // Check authentication
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return NextResponse.json(
//                 { success: false, error: 'Unauthorized' },
//                 { status: 401 }
//             );
//         }

//         // Get company context
//         const companyId = await getCompanyContext(request);
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required',
//                 error: 'Missing or invalid company ID'
//             }, { status: 400 });
//         }

//         await connectDB();
        
//         // Parse form data
//         let body;
//         let files = {};
        
//         const contentType = request.headers.get('content-type') || '';
        
//         if (contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             body = {};
//             for (const [key, value] of formData.entries()) {
//                 if (!(value instanceof File)) {
//                     if (key.includes('.')) {
//                         const parts = key.split('.');
//                         let current = body;
//                         for (let i = 0; i < parts.length - 1; i++) {
//                             if (!current[parts[i]]) current[parts[i]] = {};
//                             current = current[parts[i]];
//                         }
//                         current[parts[parts.length - 1]] = value;
//                     } else {
//                         body[key] = value;
//                     }
//                 } else {
//                     files[key] = value;
//                 }
//             }
            
//             // Parse JSON fields
//             ['upiIds', 'bank', 'invoiceSettings', 'support', 'social', 'theme'].forEach(field => {
//                 if (body[field] && typeof body[field] === 'string') {
//                     try {
//                         body[field] = JSON.parse(body[field]);
//                     } catch (e) {}
//                 }
//             });
            
//         } else {
//             body = await request.json();
//         }

//         // Add companyId to body
//         body.companyId = companyId;

//         // ==================== VALIDATION ====================
//         const errors = {};

//         if (!body.companyName?.trim()) {
//             errors.companyName = 'Company name is required';
//         }

//         if (!body.phone?.trim()) {
//             errors.phone = 'Phone number is required';
//         } else if (!isValidPhone(body.phone)) {
//             errors.phone = 'Please enter a valid phone number';
//         }

//         if (!body.email?.trim()) {
//             errors.email = 'Email is required';
//         } else if (!isValidEmail(body.email)) {
//             errors.email = 'Please enter a valid email address';
//         }

//         if (!body.address?.trim()) {
//             errors.address = 'Address is required';
//         }

//         if (!body.city?.trim()) {
//             errors.city = 'City is required';
//         }

//         if (body.gstin && !isValidGstin(body.gstin)) {
//             errors.gstin = 'Please enter a valid GSTIN';
//         }

//         if (body.pan && !isValidPan(body.pan)) {
//             errors.pan = 'Please enter a valid PAN';
//         }

//         if (body.bank?.ifsc && !isValidIfsc(body.bank.ifsc)) {
//             errors.bankIfsc = 'Please enter a valid IFSC code';
//         }

//         if (body.upiIds && Array.isArray(body.upiIds)) {
//             body.upiIds.forEach((upi, index) => {
//                 if (!isValidUpiId(upi.id)) {
//                     errors[`upi_${index}`] = `Invalid UPI ID format: ${upi.id}`;
//                 }
//             });
//         }

//         if (body.theme) {
//             if (!isValidColor(body.theme.primary)) {
//                 errors.themePrimary = 'Primary color must be a valid hex code';
//             }
//             if (!isValidColor(body.theme.secondary)) {
//                 errors.themeSecondary = 'Secondary color must be a valid hex code';
//             }
//             if (!isValidColor(body.theme.accent)) {
//                 errors.themeAccent = 'Accent color must be a valid hex code';
//             }
//         }

//         if (body.orderFlowMode !== undefined && !isValidOrderFlowMode(body.orderFlowMode)) {
//             errors.orderFlowMode = 'Order flow mode must be either "short" or "long"';
//         }

//         if (Object.keys(errors).length > 0) {
//             return NextResponse.json(
//                 { 
//                     success: false, 
//                     error: 'Validation failed',
//                     errors 
//                 },
//                 { status: 400 }
//             );
//         }

//         // ==================== GET EXISTING SETTINGS ====================
//         let settings = await CompanySettings.findOne({ companyId });
        
//         if (!settings) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Settings not found for this company'
//             }, { status: 404 });
//         }

//         // Verify ownership
//         if (!settings.belongsToCompany(companyId)) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Access denied'
//             }, { status: 403 });
//         }

//         // ==================== PROCESS IMAGE UPLOADS ====================
//         const imageFields = ['logo', 'favicon', 'signature', 'stamp'];
        
//         for (const field of imageFields) {
//             if (files[field]) {
//                 const file = files[field];
                
//                 if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//                     return NextResponse.json(
//                         { 
//                             success: false, 
//                             error: `Invalid file type for ${field}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
//                         },
//                         { status: 400 }
//                     );
//                 }
                
//                 try {
//                     await deleteOldImage(settings[field]);
//                     const imageUrl = await processAndSaveImage(file, field);
//                     body[field] = imageUrl;
                    
//                 } catch (uploadError) {
//                     console.error(`❌ Failed to upload ${field}:`, uploadError);
//                     return NextResponse.json(
//                         { 
//                             success: false, 
//                             error: `Failed to upload ${field}: ${uploadError.message}` 
//                         },
//                         { status: 500 }
//                     );
//                 }
//             }
//         }

//         // ==================== UPDATE FIELDS ====================
        
//         if (body.companyName !== undefined) settings.companyName = body.companyName;
//         if (body.legalName !== undefined) settings.legalName = body.legalName;
//         if (body.tagline !== undefined) settings.tagline = body.tagline;
//         if (body.phone !== undefined) settings.phone = body.phone;
//         if (body.email !== undefined) settings.email = body.email;
//         if (body.website !== undefined) settings.website = body.website;
//         if (body.address !== undefined) settings.address = body.address;
//         if (body.city !== undefined) settings.city = body.city;
        
//         if (body.gstin !== undefined) settings.gstin = body.gstin;
//         if (body.pan !== undefined) settings.pan = body.pan;
//         if (body.cin !== undefined) settings.cin = body.cin;
        
//         if (body.upiIds !== undefined) {
//             settings.upiIds = body.upiIds.map(upi => ({
//                 id: upi.id,
//                 name: upi.name || upi.id.split('@')[0],
//                 appType: upi.appType || 'other',
//                 isActive: upi.isActive !== false,
//                 description: upi.description || ''
//             }));
//         }
        
//         if (body.bank) {
//             settings.bank = {
//                 ...settings.bank,
//                 ...body.bank
//             };
//         }
        
//         if (body.invoiceSettings) {
//             settings.invoiceSettings = {
//                 ...settings.invoiceSettings,
//                 ...body.invoiceSettings
//             };
//         }
        
//         if (body.support) {
//             settings.support = {
//                 ...settings.support,
//                 ...body.support
//             };
//         }
        
//         if (body.social) {
//             settings.social = {
//                 ...settings.social,
//                 ...body.social
//             };
//         }
        
//         if (body.theme) {
//             settings.theme = {
//                 ...settings.theme,
//                 ...body.theme
//             };
//         }
        
//         if (body.orderFlowMode !== undefined) {
//             settings.orderFlowMode = body.orderFlowMode;
//         }
        
//         if (body.logo !== undefined) settings.logo = body.logo;
//         if (body.favicon !== undefined) settings.favicon = body.favicon;
//         if (body.signature !== undefined) settings.signature = body.signature;
//         if (body.stamp !== undefined) settings.stamp = body.stamp;
        
//         settings.updatedBy = session.user.id;
//         settings.updatedAt = new Date();

//         await settings.save();

//         console.log(`✅ Company settings updated for company ${companyId} by ${session.user.email}`);
//         console.log(`📋 Order flow mode: ${settings.orderFlowMode}`);

//         return NextResponse.json({
//             success: true,
//             message: 'Company settings updated successfully',
//             data: settings,
//             companyId
//         });

//     } catch (error) {
//         console.error('❌ Error updating company settings:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Failed to update company settings',
//                 details: process.env.NODE_ENV === 'development' ? error.message : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// // ==================== PATCH HANDLER ====================

// export async function PATCH(request) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return NextResponse.json(
//                 { success: false, error: 'Unauthorized' },
//                 { status: 401 }
//             );
//         }

//         const companyId = await getCompanyContext(request);
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required',
//                 error: 'Missing or invalid company ID'
//             }, { status: 400 });
//         }

//         await connectDB();
//         const body = await request.json();
//         const { action, ...data } = body;

//         let settings = await CompanySettings.findOne({ companyId });
        
//         if (!settings) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Settings not found for this company'
//             }, { status: 404 });
//         }

//         if (!settings.belongsToCompany(companyId)) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Access denied'
//             }, { status: 403 });
//         }

//         // ==================== HANDLE ACTIONS ====================
        
//         if (action === 'add-upi') {
//             const { id, name, appType, description } = data;
            
//             if (!id || !isValidUpiId(id)) {
//                 return NextResponse.json(
//                     { success: false, error: 'Invalid UPI ID format' },
//                     { status: 400 }
//                 );
//             }
            
//             const exists = settings.upiIds.some(upi => upi.id === id);
//             if (exists) {
//                 return NextResponse.json(
//                     { success: false, error: 'UPI ID already exists' },
//                     { status: 409 }
//                 );
//             }
            
//             settings.upiIds.push({
//                 id,
//                 name: name || id.split('@')[0],
//                 appType: appType || 'other',
//                 isActive: true,
//                 description: description || ''
//             });
            
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'UPI ID added successfully',
//                 data: settings
//             });
//         }
        
//         else if (action === 'toggle-upi') {
//             const { id, isActive } = data;
            
//             const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
//             if (upiIndex === -1) {
//                 return NextResponse.json(
//                     { success: false, error: 'UPI ID not found' },
//                     { status: 404 }
//                 );
//             }
            
//             settings.upiIds[upiIndex].isActive = isActive !== false;
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: `UPI ID ${isActive ? 'activated' : 'deactivated'} successfully`,
//                 data: settings
//             });
//         }
        
//         else if (action === 'delete-upi') {
//             const { id } = data;
            
//             const initialLength = settings.upiIds.length;
//             settings.upiIds = settings.upiIds.filter(upi => upi.id !== id);
            
//             if (settings.upiIds.length === initialLength) {
//                 return NextResponse.json(
//                     { success: false, error: 'UPI ID not found' },
//                     { status: 404 }
//                 );
//             }
            
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'UPI ID deleted successfully',
//                 data: settings
//             });
//         }
        
//         else if (action === 'update-bank') {
//             settings.bank = {
//                 ...settings.bank,
//                 ...data
//             };
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'Bank details updated',
//                 data: settings
//             });
//         }
        
//         else if (action === 'update-invoice-settings') {
//             settings.invoiceSettings = {
//                 ...settings.invoiceSettings,
//                 ...data
//             };
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'Invoice settings updated',
//                 data: settings
//             });
//         }
        
//         else if (action === 'update-order-flow') {
//             const { mode } = data;
            
//             if (!isValidOrderFlowMode(mode)) {
//                 return NextResponse.json(
//                     { success: false, error: 'Order flow mode must be either "short" or "long"' },
//                     { status: 400 }
//                 );
//             }
            
//             settings.orderFlowMode = mode;
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             console.log(`📋 Order flow mode updated to: ${mode} for company ${companyId}`);
            
//             return NextResponse.json({
//                 success: true,
//                 message: `Order flow mode updated to ${mode}`,
//                 data: settings
//             });
//         }
        
//         else {
//             return NextResponse.json(
//                 { success: false, error: 'Invalid action' },
//                 { status: 400 }
//             );
//         }

//     } catch (error) {
//         console.error('❌ Error in PATCH operation:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Operation failed',
//                 details: process.env.NODE_ENV === 'development' ? error.message : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// // ==================== DELETE HANDLER ====================

// export async function DELETE(request) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return NextResponse.json(
//                 { success: false, error: 'Unauthorized' },
//                 { status: 401 }
//             );
//         }

//         const companyId = await getCompanyContext(request);
//         if (!companyId) {
//             return NextResponse.json({
//                 success: false,
//                 message: 'Company context required',
//                 error: 'Missing or invalid company ID'
//             }, { status: 400 });
//         }

//         const { searchParams } = new URL(request.url);
//         const type = searchParams.get('type');
//         const id = searchParams.get('id');

//         await connectDB();
        
//         let settings = await CompanySettings.findOne({ companyId });
        
//         if (!settings) {
//             return NextResponse.json(
//                 { success: false, error: 'Settings not found' },
//                 { status: 404 }
//             );
//         }

//         if (!settings.belongsToCompany(companyId)) {
//             return NextResponse.json({
//                 success: false,
//                 error: 'Access denied'
//             }, { status: 403 });
//         }

//         // ==================== HANDLE DELETE OPERATIONS ====================
        
//         if (type === 'upi' && id) {
//             const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
//             if (upiIndex === -1) {
//                 return NextResponse.json(
//                     { success: false, error: 'UPI ID not found' },
//                     { status: 404 }
//                 );
//             }
            
//             settings.upiIds.splice(upiIndex, 1);
//             settings.updatedBy = session.user.id;
//             await settings.save();
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'UPI ID deleted successfully',
//                 data: settings
//             });
//         }
        
//         else if (type === 'image') {
//             const imageField = searchParams.get('field');
//             const validImageFields = ['logo', 'favicon', 'signature', 'stamp'];
            
//             if (!validImageFields.includes(imageField)) {
//                 return NextResponse.json(
//                     { success: false, error: 'Invalid image field' },
//                     { status: 400 }
//                 );
//             }
            
//             const imageUrl = settings[imageField];
//             if (imageUrl) {
//                 await deleteOldImage(imageUrl);
//                 settings[imageField] = null;
//                 settings.updatedBy = session.user.id;
//                 await settings.save();
//             }
            
//             return NextResponse.json({
//                 success: true,
//                 message: 'Image deleted successfully',
//                 data: settings
//             });
//         }
        
//         else {
//             return NextResponse.json(
//                 { success: false, error: 'Invalid delete operation' },
//                 { status: 400 }
//             );
//         }

//     } catch (error) {
//         console.error('❌ Error in DELETE operation:', error);
//         return NextResponse.json(
//             { 
//                 success: false, 
//                 error: 'Delete operation failed',
//                 details: process.env.NODE_ENV === 'development' ? error.message : undefined
//             },
//             { status: 500 }
//         );
//     }
// }

// // ==================== OPTIONS HANDLER ====================

// export async function OPTIONS() {
//     return NextResponse.json({
//         methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//         description: 'Multi-tenant Company Settings API',
//         features: [
//             'Company-based data isolation',
//             'GET - Fetch company settings (requires companyId)',
//             'PUT - Full update of settings (admin only)',
//             'PATCH - Partial updates with actions (admin only)',
//             'DELETE - Delete specific items (admin only)',
//             'Supports multipart/form-data for image uploads'
//         ],
//         required: ['companyId'],
//         actions: {
//             'add-upi': 'Add a new UPI ID',
//             'toggle-upi': 'Activate/deactivate UPI ID',
//             'delete-upi': 'Delete UPI ID',
//             'update-bank': 'Update bank details only',
//             'update-invoice-settings': 'Update invoice settings only',
//             'update-order-flow': 'Update order flow mode (short/long)'
//         }
//     });
// }
















































// app/api/company-settings/route.js - PROFESSIONAL MULTI-TENANT COMPANY SETTINGS API
// Industry standard: Complete company configuration with all payment methods

import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import CompanySettings from '@/models/CompanySettings';
import Company from '@/models/Company';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import mongoose from 'mongoose';

// ==================== CONFIGURATION ====================
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/company');
const QR_UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/qr-codes');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// ==================== HELPER FUNCTIONS ====================

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

/**
 * Validate UPI ID format
 */
function isValidUpiId(upiId) {
    if (!upiId || typeof upiId !== 'string') return false;
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(upiId);
}

/**
 * Validate phone number for payment apps
 */
function isValidPhoneNumber(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
}

/**
 * Validate GSTIN format
 */
function isValidGstin(gstin) {
    if (!gstin) return true;
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinPattern.test(gstin);
}

/**
 * Validate PAN format
 */
function isValidPan(pan) {
    if (!pan) return true;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
}

/**
 * Validate IFSC code format
 */
function isValidIfsc(ifsc) {
    if (!ifsc) return true;
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscPattern.test(ifsc);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    if (!email) return false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12;
}

/**
 * Validate color hex code
 */
function isValidColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate order flow mode
 */
function isValidOrderFlowMode(mode) {
    return mode === 'short' || mode === 'long';
}

/**
 * Validate payment method type
 */
function isValidPaymentMethodType(type) {
    const validTypes = ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank'];
    return validTypes.includes(type);
}

/**
 * Process and save uploaded image
 */
async function processAndSaveImage(file, type, companyId) {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        }
        
        // Create company-specific subdirectory
        const uploadDir = type === 'qr' ? QR_UPLOAD_DIR : UPLOAD_DIR;
        const companyDir = path.join(uploadDir, companyId.toString());
        await mkdir(companyDir, { recursive: true }).catch(() => {});
        
        const extension = file.name.split('.').pop() || 'png';
        const filename = `${type}-${Date.now()}-${uuidv4().slice(0, 8)}.${extension}`;
        const filepath = path.join(companyDir, filename);
        
        let processedBuffer = buffer;
        
        // Optimize images (but not for QR codes - need high quality)
        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml' && type !== 'qr') {
            try {
                processedBuffer = await sharp(buffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
            } catch (sharpError) {
                console.warn('Sharp processing failed:', sharpError.message);
            }
        }
        
        await writeFile(filepath, processedBuffer);
        
        // Return public URL
        const basePath = type === 'qr' ? '/uploads/qr-codes' : '/uploads/company';
        return `${basePath}/${companyId}/${filename}`;
        
    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
}

/**
 * Delete old image file
 */
async function deleteOldImage(imageUrl) {
    if (!imageUrl) return;
    try {
        // Extract path from URL (remove leading slash)
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        await unlink(filePath).catch(() => {});
    } catch (error) {
        console.warn('Failed to delete old image:', error.message);
    }
}

// ==================== GET HANDLER ====================

export async function GET(request) {
    try {
        // Get company context
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'Missing or invalid company ID'
            }, { status: 400 });
        }

        await connectDB();
        
        // Get settings for this specific company
        let settings = await CompanySettings.findOne({ companyId });
        
        // If no settings exist, create default settings
        if (!settings) {
            // Get session for createdBy
            const session = await getServerSession(authOptions);
            
            settings = await CompanySettings.getOrCreateSettings(
                companyId, 
                session?.user?.id || 'system',
                {}
            );
        }
        
        return NextResponse.json({
            success: true,
            data: settings,
            companyId
        });
        
    } catch (error) {
        console.error('❌ Error fetching company settings:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch company settings',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// ==================== PUT HANDLER ====================

export async function PUT(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get company context
        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'Missing or invalid company ID'
            }, { status: 400 });
        }

        await connectDB();
        
        // Parse form data
        let body = {};
        let files = {};
        
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    files[key] = value;
                } else {
                    // Handle nested objects (e.g., bank.name)
                    if (key.includes('.')) {
                        const parts = key.split('.');
                        let current = body;
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (!current[parts[i]]) current[parts[i]] = {};
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = value;
                    } else {
                        body[key] = value;
                    }
                }
            }
            
            // Parse JSON fields that might be stringified
            const jsonFields = [
                'upiIds', 'gpayNumbers', 'phonePeNumbers', 'paytmNumbers', 
                'bankAccounts', 'paymentSettings', 'bank', 'invoiceSettings', 
                'support', 'social', 'theme', 'businessHours'
            ];
            
            jsonFields.forEach(field => {
                if (body[field] && typeof body[field] === 'string') {
                    try {
                        body[field] = JSON.parse(body[field]);
                    } catch (e) {
                        // Keep as is if parsing fails
                    }
                }
            });
            
        } else {
            body = await request.json();
        }

        // Add metadata
        body.companyId = companyId;

        // ==================== VALIDATION ====================
        const errors = {};

        // Basic info validation
        if (body.companyName !== undefined && !body.companyName?.trim()) {
            errors.companyName = 'Company name cannot be empty';
        }

        if (body.phone !== undefined && !isValidPhone(body.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (body.email !== undefined && !isValidEmail(body.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Tax validation
        if (body.gstin && !isValidGstin(body.gstin)) {
            errors.gstin = 'Please enter a valid GSTIN';
        }

        if (body.pan && !isValidPan(body.pan)) {
            errors.pan = 'Please enter a valid PAN';
        }

        // Bank validation
        if (body.bank?.ifsc && !isValidIfsc(body.bank.ifsc)) {
            errors.bankIfsc = 'Please enter a valid IFSC code';
        }

        // UPI IDs validation
        if (body.upiIds && Array.isArray(body.upiIds)) {
            body.upiIds.forEach((upi, index) => {
                if (!isValidUpiId(upi.id)) {
                    errors[`upi_${index}`] = `Invalid UPI ID format: ${upi.id}`;
                }
            });
        }

        // GPay numbers validation
        if (body.gpayNumbers && Array.isArray(body.gpayNumbers)) {
            body.gpayNumbers.forEach((gpay, index) => {
                const digits = gpay.phoneNumber.replace(/\D/g, '');
                if (digits.length !== 10) {
                    errors[`gpay_${index}`] = `Invalid GPay phone number: ${gpay.phoneNumber}`;
                }
            });
        }

        // PhonePe numbers validation
        if (body.phonePeNumbers && Array.isArray(body.phonePeNumbers)) {
            body.phonePeNumbers.forEach((phonepe, index) => {
                const digits = phonepe.phoneNumber.replace(/\D/g, '');
                if (digits.length !== 10) {
                    errors[`phonepe_${index}`] = `Invalid PhonePe number: ${phonepe.phoneNumber}`;
                }
            });
        }

        // PayTM numbers validation
        if (body.paytmNumbers && Array.isArray(body.paytmNumbers)) {
            body.paytmNumbers.forEach((paytm, index) => {
                const digits = paytm.phoneNumber.replace(/\D/g, '');
                if (digits.length !== 10) {
                    errors[`paytm_${index}`] = `Invalid PayTM number: ${paytm.phoneNumber}`;
                }
            });
        }

        // Bank accounts validation
        if (body.bankAccounts && Array.isArray(body.bankAccounts)) {
            body.bankAccounts.forEach((bank, index) => {
                if (bank.ifscCode && !isValidIfsc(bank.ifscCode)) {
                    errors[`bank_ifsc_${index}`] = `Invalid IFSC code: ${bank.ifscCode}`;
                }
            });
        }

        // Theme validation
        if (body.theme) {
            if (body.theme.primary && !isValidColor(body.theme.primary)) {
                errors.themePrimary = 'Primary color must be a valid hex code';
            }
            if (body.theme.secondary && !isValidColor(body.theme.secondary)) {
                errors.themeSecondary = 'Secondary color must be a valid hex code';
            }
            if (body.theme.accent && !isValidColor(body.theme.accent)) {
                errors.themeAccent = 'Accent color must be a valid hex code';
            }
        }

        // Order flow mode validation
        if (body.orderFlowMode !== undefined && !isValidOrderFlowMode(body.orderFlowMode)) {
            errors.orderFlowMode = 'Order flow mode must be either "short" or "long"';
        }

        // Payment settings validation
        if (body.paymentSettings) {
            if (body.paymentSettings.minConfidenceForAuto && 
                (body.paymentSettings.minConfidenceForAuto < 50 || 
                 body.paymentSettings.minConfidenceForAuto > 100)) {
                errors.minConfidence = 'Confidence threshold must be between 50 and 100';
            }
            if (body.paymentSettings.paymentTimeout && 
                (body.paymentSettings.paymentTimeout < 5 || 
                 body.paymentSettings.paymentTimeout > 60)) {
                errors.paymentTimeout = 'Payment timeout must be between 5 and 60 minutes';
            }
        }

        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Validation failed',
                    errors 
                },
                { status: 400 }
            );
        }

        // ==================== GET OR CREATE SETTINGS ====================
        let settings = await CompanySettings.findOne({ companyId });
        
        if (!settings) {
            settings = await CompanySettings.create({
                companyId,
                createdBy: session.user.id,
                companyName: body.companyName || 'New Company',
                phone: body.phone || '+91 00000 00000',
                email: body.email || 'info@company.com',
                address: body.address || 'Address pending',
                city: body.city || 'City pending'
            });
        }

        // Verify ownership
        if (!settings.belongsToCompany(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Access denied'
            }, { status: 403 });
        }

        // ==================== PROCESS IMAGE UPLOADS ====================
        const imageFields = ['logo', 'favicon', 'signature', 'stamp'];
        
        for (const field of imageFields) {
            if (files[field]) {
                const file = files[field];
                
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: `Invalid file type for ${field}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
                        },
                        { status: 400 }
                    );
                }
                
                try {
                    await deleteOldImage(settings[field]);
                    const imageUrl = await processAndSaveImage(file, field, companyId);
                    body[field] = imageUrl;
                    
                } catch (uploadError) {
                    console.error(`❌ Failed to upload ${field}:`, uploadError);
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: `Failed to upload ${field}: ${uploadError.message}` 
                        },
                        { status: 500 }
                    );
                }
            }
        }

        // ==================== PROCESS QR CODE UPLOAD ====================
        if (files.qrCode) {
            const file = files.qrCode;
            
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: `Invalid file type for QR code. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
                    },
                    { status: 400 }
                );
            }
            
            try {
                // Delete old QR if exists
                if (settings.qrCode?.imageUrl) {
                    await deleteOldImage(settings.qrCode.imageUrl);
                }
                
                const imageUrl = await processAndSaveImage(file, 'qr', companyId);
                
                // Update QR code object
                body.qrCode = {
                    ...settings.qrCode,
                    imageUrl,
                    name: body.qrName || settings.qrCode?.name || 'Payment QR Code',
                    description: body.qrDescription || settings.qrCode?.description || '',
                    isActive: body.qrIsActive !== undefined ? body.qrIsActive : true,
                    updatedAt: new Date()
                };
                
            } catch (uploadError) {
                console.error('❌ Failed to upload QR code:', uploadError);
                return NextResponse.json(
                    { 
                        success: false, 
                        error: `Failed to upload QR code: ${uploadError.message}` 
                    },
                    { status: 500 }
                );
            }
        }

        // ==================== UPDATE FIELDS ====================
        
        // Basic info
        if (body.companyName !== undefined) settings.companyName = body.companyName;
        if (body.legalName !== undefined) settings.legalName = body.legalName;
        if (body.tagline !== undefined) settings.tagline = body.tagline;
        if (body.phone !== undefined) settings.phone = body.phone;
        if (body.email !== undefined) settings.email = body.email;
        if (body.website !== undefined) settings.website = body.website;
        if (body.address !== undefined) settings.address = body.address;
        if (body.city !== undefined) settings.city = body.city;
        if (body.state !== undefined) settings.state = body.state;
        if (body.country !== undefined) settings.country = body.country;
        if (body.pincode !== undefined) settings.pincode = body.pincode;
        
        // Tax info
        if (body.gstin !== undefined) settings.gstin = body.gstin;
        if (body.pan !== undefined) settings.pan = body.pan;
        if (body.cin !== undefined) settings.cin = body.cin;
        
        // ===== PAYMENT METHODS =====
        
        // UPI IDs
        if (body.upiIds !== undefined) {
            settings.upiIds = body.upiIds.map(upi => ({
                id: upi.id,
                name: upi.name || upi.id.split('@')[0],
                appType: upi.appType || 'other',
                isActive: upi.isActive !== false,
                description: upi.description || '',
                usageCount: upi.usageCount || 0
            }));
        }
        
        // GPay Numbers
        if (body.gpayNumbers !== undefined) {
            settings.gpayNumbers = body.gpayNumbers.map(gpay => ({
                phoneNumber: gpay.phoneNumber.replace(/\D/g, ''),
                name: gpay.name || `GPay ${gpay.phoneNumber.slice(-4)}`,
                upiId: gpay.upiId || `${gpay.phoneNumber.replace(/\D/g, '')}@okhdfcbank`,
                isActive: gpay.isActive !== false,
                description: gpay.description || '',
                usageCount: gpay.usageCount || 0
            }));
        }
        
        // PhonePe Numbers
        if (body.phonePeNumbers !== undefined) {
            settings.phonePeNumbers = body.phonePeNumbers.map(phonepe => ({
                phoneNumber: phonepe.phoneNumber.replace(/\D/g, ''),
                name: phonepe.name || `PhonePe ${phonepe.phoneNumber.slice(-4)}`,
                upiId: phonepe.upiId || `${phonepe.phoneNumber.replace(/\D/g, '')}@ybl`,
                isActive: phonepe.isActive !== false,
                description: phonepe.description || '',
                usageCount: phonepe.usageCount || 0
            }));
        }
        
        // PayTM Numbers
        if (body.paytmNumbers !== undefined) {
            settings.paytmNumbers = body.paytmNumbers.map(paytm => ({
                phoneNumber: paytm.phoneNumber.replace(/\D/g, ''),
                name: paytm.name || `PayTM ${paytm.phoneNumber.slice(-4)}`,
                upiId: paytm.upiId || `${paytm.phoneNumber.replace(/\D/g, '')}@paytm`,
                isActive: paytm.isActive !== false,
                description: paytm.description || '',
                usageCount: paytm.usageCount || 0
            }));
        }
        
        // QR Code
        if (body.qrCode !== undefined) {
            settings.qrCode = {
                ...settings.qrCode,
                ...body.qrCode,
                updatedAt: new Date()
            };
        }
        
        // Bank Accounts
        if (body.bankAccounts !== undefined) {
            settings.bankAccounts = body.bankAccounts.map(bank => ({
                accountName: bank.accountName,
                accountNumber: bank.accountNumber,
                bankName: bank.bankName,
                ifscCode: bank.ifscCode,
                branch: bank.branch || '',
                accountType: bank.accountType || 'Current',
                isActive: bank.isActive !== false,
                isDefault: bank.isDefault || false,
                description: bank.description || '',
                upiId: bank.upiId || ''
            }));
        }
        
        // Payment Settings
        if (body.paymentSettings !== undefined) {
            settings.paymentSettings = {
                ...settings.paymentSettings,
                ...body.paymentSettings
            };
        }
        
        // Legacy bank details
        if (body.bank) {
            settings.bank = {
                ...settings.bank,
                ...body.bank
            };
        }
        
        // Invoice settings
        if (body.invoiceSettings) {
            settings.invoiceSettings = {
                ...settings.invoiceSettings,
                ...body.invoiceSettings
            };
        }
        
        // Support settings
        if (body.support) {
            settings.support = {
                ...settings.support,
                ...body.support
            };
        }
        
        // Social media
        if (body.social) {
            settings.social = {
                ...settings.social,
                ...body.social
            };
        }
        
        // Business hours
        if (body.businessHours) {
            settings.businessHours = {
                ...settings.businessHours,
                ...body.businessHours
            };
        }
        
        // Theme
        if (body.theme) {
            settings.theme = {
                ...settings.theme,
                ...body.theme
            };
        }
        
        // Order flow mode
        if (body.orderFlowMode !== undefined) {
            settings.orderFlowMode = body.orderFlowMode;
        }
        
        // Images
        if (body.logo !== undefined) settings.logo = body.logo;
        if (body.favicon !== undefined) settings.favicon = body.favicon;
        if (body.signature !== undefined) settings.signature = body.signature;
        if (body.stamp !== undefined) settings.stamp = body.stamp;
        
        // Meta
        if (body.metaTitle !== undefined) settings.metaTitle = body.metaTitle;
        if (body.metaDescription !== undefined) settings.metaDescription = body.metaDescription;
        if (body.metaKeywords !== undefined) settings.metaKeywords = body.metaKeywords;
        
        // Update audit fields
        settings.updatedBy = session.user.id;
        settings.updatedAt = new Date();

        await settings.save();

        console.log(`✅ Company settings updated for company ${companyId} by ${session.user.email}`);
        console.log(`📱 UPI IDs: ${settings.upiIds?.length || 0}`);
        console.log(`📞 GPay: ${settings.gpayNumbers?.length || 0}`);
        console.log(`📞 PhonePe: ${settings.phonePeNumbers?.length || 0}`);
        console.log(`📞 PayTM: ${settings.paytmNumbers?.length || 0}`);
        console.log(`📱 QR Code: ${settings.qrCode?.isActive ? '✅' : '❌'}`);
        console.log(`🏦 Bank Accounts: ${settings.bankAccounts?.length || 0}`);
        console.log(`📋 Order flow mode: ${settings.orderFlowMode}`);

        return NextResponse.json({
            success: true,
            message: 'Company settings updated successfully',
            data: settings,
            companyId
        });

    } catch (error) {
        console.error('❌ Error updating company settings:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to update company settings',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// ==================== PATCH HANDLER ====================

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'Missing or invalid company ID'
            }, { status: 400 });
        }

        await connectDB();
        
        // Parse form data for file uploads in PATCH
        let body = {};
        let files = {};
        
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    files[key] = value;
                } else {
                    body[key] = value;
                }
            }
        } else {
            body = await request.json();
        }

        const { action, ...data } = body;

        let settings = await CompanySettings.findOne({ companyId });
        
        if (!settings) {
            return NextResponse.json({
                success: false,
                error: 'Settings not found for this company'
            }, { status: 404 });
        }

        if (!settings.belongsToCompany(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Access denied'
            }, { status: 403 });
        }

        // ==================== HANDLE ACTIONS ====================
        
        // ----- UPI ACTIONS -----
        if (action === 'add-upi') {
            const { id, name, appType, description } = data;
            
            if (!id || !isValidUpiId(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid UPI ID format' },
                    { status: 400 }
                );
            }
            
            const exists = settings.upiIds.some(upi => upi.id === id);
            if (exists) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID already exists' },
                    { status: 409 }
                );
            }
            
            settings.upiIds.push({
                id,
                name: name || id.split('@')[0],
                appType: appType || 'other',
                isActive: true,
                description: description || '',
                createdAt: new Date()
            });
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-upi') {
            const { id, isActive } = data;
            
            const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
            if (upiIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            settings.upiIds[upiIndex].isActive = isActive !== false;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `UPI ID ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-upi') {
            const { id } = data;
            
            const initialLength = settings.upiIds.length;
            settings.upiIds = settings.upiIds.filter(upi => upi.id !== id);
            
            if (settings.upiIds.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID deleted successfully',
                data: settings
            });
        }
        
        // ----- GPAY ACTIONS -----
        else if (action === 'add-gpay') {
            const { phoneNumber, name, description } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            if (digits.length !== 10) {
                return NextResponse.json(
                    { success: false, error: 'Invalid phone number' },
                    { status: 400 }
                );
            }
            
            const exists = settings.gpayNumbers.some(g => 
                g.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (exists) {
                return NextResponse.json(
                    { success: false, error: 'GPay number already exists' },
                    { status: 409 }
                );
            }
            
            settings.gpayNumbers.push({
                phoneNumber: digits,
                name: name || `GPay ${digits.slice(-4)}`,
                upiId: `${digits}@okhdfcbank`,
                isActive: true,
                description: description || '',
                createdAt: new Date()
            });
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'GPay number added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-gpay') {
            const { phoneNumber, isActive } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const gpayIndex = settings.gpayNumbers.findIndex(g => 
                g.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (gpayIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'GPay number not found' },
                    { status: 404 }
                );
            }
            
            settings.gpayNumbers[gpayIndex].isActive = isActive !== false;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `GPay number ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-gpay') {
            const { phoneNumber } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const initialLength = settings.gpayNumbers.length;
            settings.gpayNumbers = settings.gpayNumbers.filter(g => 
                g.phoneNumber.replace(/\D/g, '') !== digits
            );
            
            if (settings.gpayNumbers.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'GPay number not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'GPay number deleted successfully',
                data: settings
            });
        }
        
        // ----- PHONEPE ACTIONS -----
        else if (action === 'add-phonepe') {
            const { phoneNumber, name, description } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            if (digits.length !== 10) {
                return NextResponse.json(
                    { success: false, error: 'Invalid phone number' },
                    { status: 400 }
                );
            }
            
            const exists = settings.phonePeNumbers.some(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (exists) {
                return NextResponse.json(
                    { success: false, error: 'PhonePe number already exists' },
                    { status: 409 }
                );
            }
            
            settings.phonePeNumbers.push({
                phoneNumber: digits,
                name: name || `PhonePe ${digits.slice(-4)}`,
                upiId: `${digits}@ybl`,
                isActive: true,
                description: description || '',
                createdAt: new Date()
            });
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PhonePe number added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-phonepe') {
            const { phoneNumber, isActive } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const phonepeIndex = settings.phonePeNumbers.findIndex(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (phonepeIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'PhonePe number not found' },
                    { status: 404 }
                );
            }
            
            settings.phonePeNumbers[phonepeIndex].isActive = isActive !== false;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `PhonePe number ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-phonepe') {
            const { phoneNumber } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const initialLength = settings.phonePeNumbers.length;
            settings.phonePeNumbers = settings.phonePeNumbers.filter(p => 
                p.phoneNumber.replace(/\D/g, '') !== digits
            );
            
            if (settings.phonePeNumbers.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'PhonePe number not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PhonePe number deleted successfully',
                data: settings
            });
        }
        
        // ----- PAYTM ACTIONS -----
        else if (action === 'add-paytm') {
            const { phoneNumber, name, description } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            if (digits.length !== 10) {
                return NextResponse.json(
                    { success: false, error: 'Invalid phone number' },
                    { status: 400 }
                );
            }
            
            const exists = settings.paytmNumbers.some(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (exists) {
                return NextResponse.json(
                    { success: false, error: 'PayTM number already exists' },
                    { status: 409 }
                );
            }
            
            settings.paytmNumbers.push({
                phoneNumber: digits,
                name: name || `PayTM ${digits.slice(-4)}`,
                upiId: `${digits}@paytm`,
                isActive: true,
                description: description || '',
                createdAt: new Date()
            });
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PayTM number added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-paytm') {
            const { phoneNumber, isActive } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const paytmIndex = settings.paytmNumbers.findIndex(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (paytmIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'PayTM number not found' },
                    { status: 404 }
                );
            }
            
            settings.paytmNumbers[paytmIndex].isActive = isActive !== false;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `PayTM number ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-paytm') {
            const { phoneNumber } = data;
            
            const digits = phoneNumber.replace(/\D/g, '');
            const initialLength = settings.paytmNumbers.length;
            settings.paytmNumbers = settings.paytmNumbers.filter(p => 
                p.phoneNumber.replace(/\D/g, '') !== digits
            );
            
            if (settings.paytmNumbers.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'PayTM number not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PayTM number deleted successfully',
                data: settings
            });
        }
        
        // ----- QR CODE ACTIONS -----
        else if (action === 'update-qr') {
            // Handle QR code update with optional file upload
            if (files.qrCode) {
                const file = files.qrCode;
                
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid file type for QR code' },
                        { status: 400 }
                    );
                }
                
                try {
                    if (settings.qrCode?.imageUrl) {
                        await deleteOldImage(settings.qrCode.imageUrl);
                    }
                    
                    const imageUrl = await processAndSaveImage(file, 'qr', companyId);
                    
                    settings.qrCode = {
                        ...settings.qrCode,
                        imageUrl,
                        name: data.name || settings.qrCode?.name || 'Payment QR Code',
                        description: data.description || settings.qrCode?.description || '',
                        isActive: data.isActive !== undefined ? data.isActive : true,
                        updatedAt: new Date()
                    };
                    
                } catch (uploadError) {
                    return NextResponse.json(
                        { success: false, error: 'Failed to upload QR code' },
                        { status: 500 }
                    );
                }
            } else {
                // Update QR metadata only
                settings.qrCode = {
                    ...settings.qrCode,
                    ...data,
                    updatedAt: new Date()
                };
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'QR code updated successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-qr') {
            if (!settings.qrCode) {
                settings.qrCode = {
                    isActive: data.isActive !== false
                };
            } else {
                settings.qrCode.isActive = data.isActive !== false;
                settings.qrCode.updatedAt = new Date();
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `QR code ${data.isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-qr') {
            if (settings.qrCode?.imageUrl) {
                await deleteOldImage(settings.qrCode.imageUrl);
            }
            
            settings.qrCode = null;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'QR code deleted successfully',
                data: settings
            });
        }
        
        // ----- BANK ACCOUNT ACTIONS -----
        else if (action === 'add-bank-account') {
            const { accountName, accountNumber, bankName, ifscCode, branch, accountType, isDefault, description } = data;
            
            if (!accountName || !accountNumber || !bankName || !ifscCode) {
                return NextResponse.json(
                    { success: false, error: 'Missing required bank fields' },
                    { status: 400 }
                );
            }
            
            if (!isValidIfsc(ifscCode)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid IFSC code' },
                    { status: 400 }
                );
            }
            
            const newAccount = {
                accountName,
                accountNumber,
                bankName,
                ifscCode,
                branch: branch || '',
                accountType: accountType || 'Current',
                isActive: true,
                isDefault: isDefault || false,
                description: description || '',
                createdAt: new Date()
            };
            
            // If this is the default account, unset others
            if (isDefault) {
                settings.bankAccounts.forEach(acc => acc.isDefault = false);
            }
            
            settings.bankAccounts.push(newAccount);
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Bank account added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-bank-account') {
            const { id, isActive } = data;
            
            const bankIndex = settings.bankAccounts.findIndex(b => b._id.toString() === id);
            if (bankIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'Bank account not found' },
                    { status: 404 }
                );
            }
            
            settings.bankAccounts[bankIndex].isActive = isActive !== false;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: `Bank account ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'set-default-bank') {
            const { id } = data;
            
            let found = false;
            settings.bankAccounts.forEach(acc => {
                if (acc._id.toString() === id) {
                    acc.isDefault = true;
                    found = true;
                } else {
                    acc.isDefault = false;
                }
            });
            
            if (!found) {
                return NextResponse.json(
                    { success: false, error: 'Bank account not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Default bank account updated',
                data: settings
            });
        }
        
        else if (action === 'delete-bank-account') {
            const { id } = data;
            
            const bank = settings.bankAccounts.find(b => b._id.toString() === id);
            if (bank?.isDefault) {
                return NextResponse.json(
                    { success: false, error: 'Cannot delete default bank account' },
                    { status: 400 }
                );
            }
            
            const initialLength = settings.bankAccounts.length;
            settings.bankAccounts = settings.bankAccounts.filter(b => b._id.toString() !== id);
            
            if (settings.bankAccounts.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'Bank account not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Bank account deleted successfully',
                data: settings
            });
        }
        
        // ----- OTHER ACTIONS -----
        else if (action === 'update-bank') {
            settings.bank = {
                ...settings.bank,
                ...data
            };
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Bank details updated',
                data: settings
            });
        }
        
        else if (action === 'update-invoice-settings') {
            settings.invoiceSettings = {
                ...settings.invoiceSettings,
                ...data
            };
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Invoice settings updated',
                data: settings
            });
        }
        
        else if (action === 'update-payment-settings') {
            settings.paymentSettings = {
                ...settings.paymentSettings,
                ...data
            };
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Payment settings updated',
                data: settings
            });
        }
        
        else if (action === 'update-order-flow') {
            const { mode } = data;
            
            if (!isValidOrderFlowMode(mode)) {
                return NextResponse.json(
                    { success: false, error: 'Order flow mode must be either "short" or "long"' },
                    { status: 400 }
                );
            }
            
            settings.orderFlowMode = mode;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            console.log(`📋 Order flow mode updated to: ${mode} for company ${companyId}`);
            
            return NextResponse.json({
                success: true,
                message: `Order flow mode updated to ${mode}`,
                data: settings
            });
        }
        
        else {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('❌ Error in PATCH operation:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Operation failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// ==================== DELETE HANDLER ====================

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyId = await getCompanyContext(request);
        if (!companyId) {
            return NextResponse.json({
                success: false,
                message: 'Company context required',
                error: 'Missing or invalid company ID'
            }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        await connectDB();
        
        let settings = await CompanySettings.findOne({ companyId });
        
        if (!settings) {
            return NextResponse.json(
                { success: false, error: 'Settings not found' },
                { status: 404 }
            );
        }

        if (!settings.belongsToCompany(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Access denied'
            }, { status: 403 });
        }

        // ==================== HANDLE DELETE OPERATIONS ====================
        
        if (type === 'upi' && id) {
            const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
            if (upiIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            settings.upiIds.splice(upiIndex, 1);
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'gpay' && id) {
            const digits = id.replace(/\D/g, '');
            const gpayIndex = settings.gpayNumbers.findIndex(g => 
                g.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (gpayIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'GPay number not found' },
                    { status: 404 }
                );
            }
            
            settings.gpayNumbers.splice(gpayIndex, 1);
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'GPay number deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'phonepe' && id) {
            const digits = id.replace(/\D/g, '');
            const phonepeIndex = settings.phonePeNumbers.findIndex(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (phonepeIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'PhonePe number not found' },
                    { status: 404 }
                );
            }
            
            settings.phonePeNumbers.splice(phonepeIndex, 1);
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PhonePe number deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'paytm' && id) {
            const digits = id.replace(/\D/g, '');
            const paytmIndex = settings.paytmNumbers.findIndex(p => 
                p.phoneNumber.replace(/\D/g, '') === digits
            );
            
            if (paytmIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'PayTM number not found' },
                    { status: 404 }
                );
            }
            
            settings.paytmNumbers.splice(paytmIndex, 1);
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'PayTM number deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'qr') {
            if (settings.qrCode?.imageUrl) {
                await deleteOldImage(settings.qrCode.imageUrl);
            }
            
            settings.qrCode = null;
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'QR code deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'bank-account' && id) {
            const bank = settings.bankAccounts.find(b => b._id.toString() === id);
            if (bank?.isDefault) {
                return NextResponse.json(
                    { success: false, error: 'Cannot delete default bank account' },
                    { status: 400 }
                );
            }
            
            const initialLength = settings.bankAccounts.length;
            settings.bankAccounts = settings.bankAccounts.filter(b => b._id.toString() !== id);
            
            if (settings.bankAccounts.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'Bank account not found' },
                    { status: 404 }
                );
            }
            
            settings.updatedBy = session.user.id;
            await settings.save();
            
            return NextResponse.json({
                success: true,
                message: 'Bank account deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'image') {
            const imageField = searchParams.get('field');
            const validImageFields = ['logo', 'favicon', 'signature', 'stamp'];
            
            if (!validImageFields.includes(imageField)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid image field' },
                    { status: 400 }
                );
            }
            
            const imageUrl = settings[imageField];
            if (imageUrl) {
                await deleteOldImage(imageUrl);
                settings[imageField] = null;
                settings.updatedBy = session.user.id;
                await settings.save();
            }
            
            return NextResponse.json({
                success: true,
                message: 'Image deleted successfully',
                data: settings
            });
        }
        
        else {
            return NextResponse.json(
                { success: false, error: 'Invalid delete operation' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('❌ Error in DELETE operation:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Delete operation failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// ==================== OPTIONS HANDLER ====================

export async function OPTIONS() {
    return NextResponse.json({
        methods: ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        description: 'Multi-tenant Company Settings API with complete payment method support',
        features: [
            'Company-based data isolation',
            'GET - Fetch company settings (requires companyId)',
            'PUT - Full update of settings (admin only)',
            'PATCH - Partial updates with actions (admin only)',
            'DELETE - Delete specific items (admin only)',
            'Supports multipart/form-data for image uploads',
            'Complete payment method management'
        ],
        required: ['companyId'],
        actions: {
            // UPI actions
            'add-upi': 'Add a new UPI ID',
            'toggle-upi': 'Activate/deactivate UPI ID',
            'delete-upi': 'Delete UPI ID',
            
            // GPay actions
            'add-gpay': 'Add a new GPay number',
            'toggle-gpay': 'Activate/deactivate GPay number',
            'delete-gpay': 'Delete GPay number',
            
            // PhonePe actions
            'add-phonepe': 'Add a new PhonePe number',
            'toggle-phonepe': 'Activate/deactivate PhonePe number',
            'delete-phonepe': 'Delete PhonePe number',
            
            // PayTM actions
            'add-paytm': 'Add a new PayTM number',
            'toggle-paytm': 'Activate/deactivate PayTM number',
            'delete-paytm': 'Delete PayTM number',
            
            // QR Code actions
            'update-qr': 'Update QR code (with or without image)',
            'toggle-qr': 'Activate/deactivate QR code',
            'delete-qr': 'Delete QR code',
            
            // Bank Account actions
            'add-bank-account': 'Add a new bank account',
            'toggle-bank-account': 'Activate/deactivate bank account',
            'set-default-bank': 'Set default bank account',
            'delete-bank-account': 'Delete bank account',
            
            // Other actions
            'update-bank': 'Update bank details only',
            'update-invoice-settings': 'Update invoice settings only',
            'update-payment-settings': 'Update payment settings only',
            'update-order-flow': 'Update order flow mode (short/long)'
        },
        deleteTypes: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank-account', 'image']
    });
}