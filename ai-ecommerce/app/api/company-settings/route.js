import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import CompanySettings from '@/models/CompanySettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// ==================== CONFIGURATION ====================
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/company');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// ==================== CACHE MANAGEMENT ====================
let settingsCache = {
    data: null,
    timestamp: null
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate UPI ID format
 */
function isValidUpiId(upiId) {
    if (!upiId || typeof upiId !== 'string') return false;
    
    // Basic UPI format: username@provider
    const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiPattern.test(upiId);
}

/**
 * Validate GSTIN format
 */
function isValidGstin(gstin) {
    if (!gstin) return true; // Optional
    // GSTIN: 15 characters, first 2 digits state code, next 10 PAN, last 3 alphanumeric
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinPattern.test(gstin);
}

/**
 * Validate PAN format
 */
function isValidPan(pan) {
    if (!pan) return true; // Optional
    // PAN: 5 letters, 4 digits, 1 letter
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
}

/**
 * Validate IFSC code format
 */
function isValidIfsc(ifsc) {
    if (!ifsc) return true; // Optional
    // IFSC: 4 letters, 0 or 7, then 6 digits/letters
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
 * Validate phone number (basic)
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
 * Process and save uploaded image
 */
async function processAndSaveImage(file, type) {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        }
        
        // Ensure upload directory exists
        try {
            await mkdir(UPLOAD_DIR, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }
        
        // Generate unique filename
        const extension = file.name.split('.').pop() || 'png';
        const filename = `${type}-${uuidv4()}.${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        
        // Process image with sharp (optimize)
        let processedBuffer = buffer;
        
        // Only process raster images with sharp
        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
            try {
                processedBuffer = await sharp(buffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .toBuffer();
            } catch (sharpError) {
                console.warn('Sharp processing failed, using original:', sharpError.message);
                // Fall back to original buffer
            }
        }
        
        // Save file
        await writeFile(filepath, processedBuffer);
        
        // Return public URL
        return `/uploads/company/${filename}`;
        
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
        const filename = path.basename(imageUrl);
        const filepath = path.join(UPLOAD_DIR, filename);
        await unlink(filepath);
    } catch (error) {
        // Ignore errors if file doesn't exist
        console.warn('Failed to delete old image:', error.message);
    }
}

/**
 * Invalidate cache
 */
function invalidateCache() {
    settingsCache = {
        data: null,
        timestamp: null
    };
}

// ==================== GET HANDLER ====================

export async function GET() {
    try {
        // Check cache first
        if (settingsCache.data && settingsCache.timestamp) {
            const age = Date.now() - settingsCache.timestamp;
            if (age < CACHE_TTL) {
                console.log('📦 Serving company settings from cache');
                return NextResponse.json({
                    success: true,
                    data: settingsCache.data,
                    cached: true
                });
            }
        }

        await connectDB();
        
        // Get settings (singleton pattern)
        let settings = await CompanySettings.findOne();
        
        // If no settings exist, create default
        if (!settings) {
            console.log('🏢 Creating default company settings');
            settings = await CompanySettings.create({
                companyName: 'PosterPro Store',
                legalName: 'PosterPro Entertainment Private Limited',
                tagline: 'Premium Posters & Art Prints',
                phone: '+91 98765 43210',
                email: 'support@posterpro.store',
                website: 'www.posterpro.store',
                address: '123 Business Street, Andheri East',
                city: 'Mumbai, Maharashtra 400001',
                gstin: '27ABCDE1234F1Z5',
                pan: 'ABCDE1234F',
                cin: 'U12345MH2023PTC123456',
                upiIds: [
                    {
                        id: 'subaask21@oksbi',
                        name: 'Primary UPI',
                        appType: 'other',
                        isActive: true,
                        description: 'Main business UPI ID'
                    },
                    {
                        id: 'posterpro.store@okaxis',
                        name: 'PhonePe UPI',
                        appType: 'phonepe',
                        isActive: true,
                        description: 'PhonePe business account'
                    },
                    {
                        id: 'posterpro.store@paytm',
                        name: 'Paytm UPI',
                        appType: 'paytm',
                        isActive: true,
                        description: 'Paytm business account'
                    }
                ],
                bank: {
                    name: 'State Bank of India',
                    account: '12345678901',
                    ifsc: 'SBIN0001234',
                    branch: 'Andheri East Branch',
                    accountType: 'Current Account'
                },
                invoiceSettings: {
                    prefix: 'INV',
                    separator: '-',
                    dateFormat: 'dd/mm/yyyy',
                    currency: '₹',
                    taxSystem: 'GST',
                    gstBreakdown: true,
                    showCGSTSGST: true,
                    roundAmount: true,
                    paymentTerms: 'Due on receipt',
                    deliveryTerms: '3-5 business days after payment confirmation',
                    warrantyTerms: '7 days replacement for manufacturing defects',
                    refundPolicy: 'No refunds after order processing'
                },
                support: {
                    email: 'care@posterpro.store',
                    phone: '+91 98765 43210',
                    hours: 'Mon-Sat, 10:00 AM - 7:00 PM'
                },
                social: {
                    facebook: '',
                    instagram: '',
                    twitter: '',
                    youtube: ''
                },
                theme: {
                    primary: '#2c3e50',
                    secondary: '#34495e',
                    accent: '#27ae60'
                }
            });
        }
        
        // Update cache
        settingsCache = {
            data: settings,
            timestamp: Date.now()
        };
        
        return NextResponse.json({
            success: true,
            data: settings
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

        // Check admin role
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        await connectDB();
        
        // Parse form data (supports both JSON and FormData)
        let body;
        let files = {};
        
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            // Parse text fields
            body = {};
            for (const [key, value] of formData.entries()) {
                if (!(value instanceof File)) {
                    // Handle nested objects with dot notation
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
                } else {
                    files[key] = value;
                }
            }
            
            // Parse JSON fields that might be stringified
            if (body.upiIds && typeof body.upiIds === 'string') {
                try {
                    body.upiIds = JSON.parse(body.upiIds);
                } catch (e) {
                    // Keep as is
                }
            }
            
            if (body.bank && typeof body.bank === 'string') {
                try {
                    body.bank = JSON.parse(body.bank);
                } catch (e) {
                    // Keep as is
                }
            }
            
            if (body.invoiceSettings && typeof body.invoiceSettings === 'string') {
                try {
                    body.invoiceSettings = JSON.parse(body.invoiceSettings);
                } catch (e) {
                    // Keep as is
                }
            }
            
            if (body.support && typeof body.support === 'string') {
                try {
                    body.support = JSON.parse(body.support);
                } catch (e) {
                    // Keep as is
                }
            }
            
            if (body.social && typeof body.social === 'string') {
                try {
                    body.social = JSON.parse(body.social);
                } catch (e) {
                    // Keep as is
                }
            }
            
            if (body.theme && typeof body.theme === 'string') {
                try {
                    body.theme = JSON.parse(body.theme);
                } catch (e) {
                    // Keep as is
                }
            }
            
        } else {
            body = await request.json();
        }

        // ==================== VALIDATION ====================
        const errors = {};

        // Basic Info Validation
        if (!body.companyName?.trim()) {
            errors.companyName = 'Company name is required';
        }

        if (!body.phone?.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!isValidPhone(body.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (!body.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!isValidEmail(body.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!body.address?.trim()) {
            errors.address = 'Address is required';
        }

        if (!body.city?.trim()) {
            errors.city = 'City is required';
        }

        // Tax validation
        if (body.gstin && !isValidGstin(body.gstin)) {
            errors.gstin = 'Please enter a valid GSTIN (15 characters)';
        }

        if (body.pan && !isValidPan(body.pan)) {
            errors.pan = 'Please enter a valid PAN (e.g., ABCDE1234F)';
        }

        // Bank validation
        if (body.bank?.ifsc && !isValidIfsc(body.bank.ifsc)) {
            errors.bankIfsc = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
        }

        // UPI validation
        if (body.upiIds && Array.isArray(body.upiIds)) {
            body.upiIds.forEach((upi, index) => {
                if (!isValidUpiId(upi.id)) {
                    errors[`upi_${index}`] = `Invalid UPI ID format: ${upi.id}`;
                }
            });
        }

        // Theme validation
        if (body.theme) {
            if (!isValidColor(body.theme.primary)) {
                errors.themePrimary = 'Primary color must be a valid hex code';
            }
            if (!isValidColor(body.theme.secondary)) {
                errors.themeSecondary = 'Secondary color must be a valid hex code';
            }
            if (!isValidColor(body.theme.accent)) {
                errors.themeAccent = 'Accent color must be a valid hex code';
            }
        }

        // If validation errors, return 400
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

        // ==================== GET EXISTING SETTINGS ====================
        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            settings = new CompanySettings();
        }

        // ==================== PROCESS IMAGE UPLOADS ====================
        const imageFields = ['logo', 'favicon', 'signature', 'stamp'];
        
        for (const field of imageFields) {
            if (files[field]) {
                const file = files[field];
                
                // Validate file type
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
                    // Delete old image
                    await deleteOldImage(settings[field]);
                    
                    // Upload new image
                    const imageUrl = await processAndSaveImage(file, field);
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

        // ==================== UPDATE FIELDS ====================
        
        // Basic Info
        if (body.companyName !== undefined) settings.companyName = body.companyName;
        if (body.legalName !== undefined) settings.legalName = body.legalName;
        if (body.tagline !== undefined) settings.tagline = body.tagline;
        if (body.phone !== undefined) settings.phone = body.phone;
        if (body.email !== undefined) settings.email = body.email;
        if (body.website !== undefined) settings.website = body.website;
        if (body.address !== undefined) settings.address = body.address;
        if (body.city !== undefined) settings.city = body.city;
        
        // Tax & Legal
        if (body.gstin !== undefined) settings.gstin = body.gstin;
        if (body.pan !== undefined) settings.pan = body.pan;
        if (body.cin !== undefined) settings.cin = body.cin;
        
        // UPI IDs
        if (body.upiIds !== undefined) {
            // Ensure each UPI has required fields
            settings.upiIds = body.upiIds.map(upi => ({
                id: upi.id,
                name: upi.name || upi.id.split('@')[0],
                appType: upi.appType || 'other',
                isActive: upi.isActive !== false,
                description: upi.description || ''
            }));
        }
        
        // Bank Details
        if (body.bank) {
            settings.bank = {
                ...settings.bank,
                ...body.bank
            };
        }
        
        // Invoice Settings
        if (body.invoiceSettings) {
            settings.invoiceSettings = {
                ...settings.invoiceSettings,
                ...body.invoiceSettings
            };
        }
        
        // Support
        if (body.support) {
            settings.support = {
                ...settings.support,
                ...body.support
            };
        }
        
        // Social Media
        if (body.social) {
            settings.social = {
                ...settings.social,
                ...body.social
            };
        }
        
        // Theme
        if (body.theme) {
            settings.theme = {
                ...settings.theme,
                ...body.theme
            };
        }
        
        // Images (if uploaded)
        if (body.logo !== undefined) settings.logo = body.logo;
        if (body.favicon !== undefined) settings.favicon = body.favicon;
        if (body.signature !== undefined) settings.signature = body.signature;
        if (body.stamp !== undefined) settings.stamp = body.stamp;
        
        // Update metadata
        settings.updatedBy = session.user.email;
        settings.updatedAt = new Date();

        // ==================== SAVE TO DATABASE ====================
        await settings.save();

        // ==================== INVALIDATE CACHE ====================
        invalidateCache();

        console.log(`✅ Company settings updated by ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Company settings updated successfully',
            data: settings
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

// ==================== PATCH HANDLER (Partial Update) ====================

export async function PATCH(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        await connectDB();
        const body = await request.json();
        const { action, ...data } = body;

        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            settings = new CompanySettings();
        }

        // ==================== HANDLE SPECIFIC ACTIONS ====================
        
        if (action === 'add-upi') {
            // Add a single UPI ID
            const { id, name, appType, description } = data;
            
            if (!id || !isValidUpiId(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid UPI ID format' },
                    { status: 400 }
                );
            }
            
            // Check for duplicate
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
                description: description || ''
            });
            
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID added successfully',
                data: settings
            });
        }
        
        else if (action === 'toggle-upi') {
            // Toggle UPI active status
            const { id, isActive } = data;
            
            const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
            if (upiIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            settings.upiIds[upiIndex].isActive = isActive !== false;
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: `UPI ID ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: settings
            });
        }
        
        else if (action === 'delete-upi') {
            // Delete a UPI ID
            const { id } = data;
            
            const initialLength = settings.upiIds.length;
            settings.upiIds = settings.upiIds.filter(upi => upi.id !== id);
            
            if (settings.upiIds.length === initialLength) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID deleted successfully',
                data: settings
            });
        }
        
        else if (action === 'update-bank') {
            // Update only bank details
            settings.bank = {
                ...settings.bank,
                ...data
            };
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: 'Bank details updated',
                data: settings
            });
        }
        
        else if (action === 'update-invoice-settings') {
            // Update only invoice settings
            settings.invoiceSettings = {
                ...settings.invoiceSettings,
                ...data
            };
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: 'Invoice settings updated',
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
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');

        await connectDB();
        
        let settings = await CompanySettings.findOne();
        
        if (!settings) {
            return NextResponse.json(
                { success: false, error: 'Settings not found' },
                { status: 404 }
            );
        }

        // ==================== HANDLE DIFFERENT DELETE OPERATIONS ====================
        
        if (type === 'upi' && id) {
            // Delete specific UPI ID
            const upiIndex = settings.upiIds.findIndex(upi => upi.id === id);
            if (upiIndex === -1) {
                return NextResponse.json(
                    { success: false, error: 'UPI ID not found' },
                    { status: 404 }
                );
            }
            
            settings.upiIds.splice(upiIndex, 1);
            await settings.save();
            invalidateCache();
            
            return NextResponse.json({
                success: true,
                message: 'UPI ID deleted successfully',
                data: settings
            });
        }
        
        else if (type === 'image') {
            // Delete uploaded image
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
                await settings.save();
                invalidateCache();
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
        description: 'Company Settings API',
        features: [
            'GET - Fetch company settings (public)',
            'PUT - Full update of settings (admin only)',
            'PATCH - Partial updates with actions (admin only)',
            'DELETE - Delete specific items (admin only)',
            'Supports multipart/form-data for image uploads',
            'Cache invalidation on updates'
        ],
        actions: {
            'add-upi': 'Add a new UPI ID',
            'toggle-upi': 'Activate/deactivate UPI ID',
            'delete-upi': 'Delete UPI ID',
            'update-bank': 'Update bank details only',
            'update-invoice-settings': 'Update invoice settings only'
        }
    });
}