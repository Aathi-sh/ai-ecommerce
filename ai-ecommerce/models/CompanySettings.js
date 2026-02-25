import mongoose from 'mongoose';

// ==================== SCHEMA DEFINITIONS ====================

/**
 * UPI ID Schema - For payment verification
 */
const UpiIdSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'UPI ID is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                // UPI format: username@provider (e.g., name@oksbi, business@paytm)
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(v);
            },
            message: props => `${props.value} is not a valid UPI ID! Must be in format: username@provider`
        }
    },
    name: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        default: function() {
            // Default name from UPI ID
            return this.id.split('@')[0];
        }
    },
    appType: {
        type: String,
        enum: {
            values: ['gpay', 'phonepe', 'paytm', 'bhim', 'other'],
            message: '{VALUE} is not a valid app type'
        },
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastUsed: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { 
    _id: true,
    timestamps: false 
});

/**
 * Bank Details Schema
 */
const BankDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: 'State Bank of India'
    },
    account: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // Basic account number validation (at least 9 digits)
                return /^\d{9,18}$/.test(v.replace(/\s/g, ''));
            },
            message: 'Account number must be between 9-18 digits'
        }
    },
    ifsc: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // IFSC format: 4 letters, 0, then 6 alphanumeric
                return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
            },
            message: 'IFSC code must be in format: ABCD0123456'
        }
    },
    branch: {
        type: String,
        trim: true
    },
    accountType: {
        type: String,
        enum: ['Current Account', 'Savings Account', 'Business Account'],
        default: 'Current Account'
    },
    upiId: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(v);
            },
            message: 'Invalid UPI ID format'
        }
    }
}, { 
    _id: false,
    timestamps: false 
});

/**
 * Invoice Settings Schema
 */
const InvoiceSettingsSchema = new mongoose.Schema({
    prefix: {
        type: String,
        default: 'INV',
        trim: true,
        uppercase: true,
        maxlength: [10, 'Prefix cannot exceed 10 characters']
    },
    separator: {
        type: String,
        default: '-',
        maxlength: [2, 'Separator cannot exceed 2 characters']
    },
    dateFormat: {
        type: String,
        enum: ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'],
        default: 'dd/mm/yyyy'
    },
    currency: {
        type: String,
        default: '₹',
        maxlength: [5, 'Currency symbol too long']
    },
    currencyCode: {
        type: String,
        default: 'INR',
        uppercase: true,
        maxlength: [3, 'Currency code must be 3 characters']
    },
    taxSystem: {
        type: String,
        enum: ['GST', 'VAT', 'None'],
        default: 'GST'
    },
    gstBreakdown: {
        type: Boolean,
        default: true
    },
    showCGSTSGST: {
        type: Boolean,
        default: true
    },
    roundAmount: {
        type: Boolean,
        default: true
    },
    paymentTerms: {
        type: String,
        default: 'Due on receipt',
        maxlength: [500, 'Payment terms cannot exceed 500 characters']
    },
    deliveryTerms: {
        type: String,
        default: '3-5 business days after payment confirmation',
        maxlength: [500, 'Delivery terms cannot exceed 500 characters']
    },
    warrantyTerms: {
        type: String,
        default: '7 days replacement for manufacturing defects',
        maxlength: [500, 'Warranty terms cannot exceed 500 characters']
    },
    refundPolicy: {
        type: String,
        default: 'No refunds after order processing',
        maxlength: [500, 'Refund policy cannot exceed 500 characters']
    },
    footerNote: {
        type: String,
        default: 'This is a computer generated invoice, no signature required.',
        maxlength: [500, 'Footer note cannot exceed 500 characters']
    },
    showBankDetails: {
        type: Boolean,
        default: true
    },
    showQRCode: {
        type: Boolean,
        default: false
    },
    qrCodeUrl: {
        type: String,
        trim: true
    }
}, { 
    _id: false,
    timestamps: false 
});

/**
 * Support Settings Schema
 */
const SupportSettingsSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // Allow +91, spaces, etc.
                const digits = v.replace(/\D/g, '');
                return digits.length >= 10 && digits.length <= 12;
            },
            message: 'Please enter a valid phone number'
        }
    },
    hours: {
        type: String,
        default: 'Mon-Sat, 10:00 AM - 7:00 PM',
        maxlength: [100, 'Support hours cannot exceed 100 characters']
    },
    whatsapp: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                const digits = v.replace(/\D/g, '');
                return digits.length >= 10 && digits.length <= 12;
            },
            message: 'Please enter a valid WhatsApp number'
        }
    },
    responseTime: {
        type: String,
        default: 'Within 30 minutes',
        maxlength: [50, 'Response time cannot exceed 50 characters']
    }
}, { 
    _id: false,
    timestamps: false 
});

/**
 * Social Media Links Schema
 */
const SocialLinksSchema = new mongoose.Schema({
    facebook: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('https://') || v.startsWith('http://');
            },
            message: 'Facebook URL must start with http:// or https://'
        }
    },
    instagram: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('https://') || v.startsWith('http://');
            },
            message: 'Instagram URL must start with http:// or https://'
        }
    },
    twitter: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('https://') || v.startsWith('http://');
            },
            message: 'Twitter URL must start with http:// or https://'
        }
    },
    youtube: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('https://') || v.startsWith('http://');
            },
            message: 'YouTube URL must start with http:// or https://'
        }
    },
    linkedin: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('https://') || v.startsWith('http://');
            },
            message: 'LinkedIn URL must start with http:// or https://'
        }
    }
}, { 
    _id: false,
    timestamps: false 
});

/**
 * Theme Settings Schema
 */
const ThemeSchema = new mongoose.Schema({
    primary: {
        type: String,
        default: '#2c3e50',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Primary color must be a valid hex code (e.g., #2c3e50)'
        }
    },
    secondary: {
        type: String,
        default: '#34495e',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Secondary color must be a valid hex code (e.g., #34495e)'
        }
    },
    accent: {
        type: String,
        default: '#27ae60',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Accent color must be a valid hex code (e.g., #27ae60)'
        }
    },
    danger: {
        type: String,
        default: '#e74c3c',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Danger color must be a valid hex code'
        }
    },
    warning: {
        type: String,
        default: '#f39c12',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Warning color must be a valid hex code'
        }
    },
    info: {
        type: String,
        default: '#3498db',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Info color must be a valid hex code'
        }
    },
    success: {
        type: String,
        default: '#27ae60',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Success color must be a valid hex code'
        }
    },
    textPrimary: {
        type: String,
        default: '#2c3e50',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Text primary color must be a valid hex code'
        }
    },
    textSecondary: {
        type: String,
        default: '#7f8c8d',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Text secondary color must be a valid hex code'
        }
    },
    background: {
        type: String,
        default: '#ecf0f1',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Background color must be a valid hex code'
        }
    },
    surface: {
        type: String,
        default: '#ffffff',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Surface color must be a valid hex code'
        }
    },
    border: {
        type: String,
        default: '#bdc3c7',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Border color must be a valid hex code'
        }
    }
}, { 
    _id: false,
    timestamps: false 
});

/**
 * Business Hours Schema
 */
const BusinessHoursSchema = new mongoose.Schema({
    monday: { type: String, default: '9:00 AM - 8:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 8:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 8:00 PM' },
    thursday: { type: String, default: '9:00 AM - 8:00 PM' },
    friday: { type: String, default: '9:00 AM - 8:00 PM' },
    saturday: { type: String, default: '9:00 AM - 6:00 PM' },
    sunday: { type: String, default: 'Closed' },
    holidays: [{
        date: Date,
        description: String
    }]
}, { 
    _id: false,
    timestamps: false 
});

// ==================== MAIN COMPANY SETTINGS SCHEMA ====================

const CompanySettingsSchema = new mongoose.Schema({
    // ========== BASIC INFO ==========
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        index: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    legalName: {
        type: String,
        trim: true,
        maxlength: [200, 'Legal name cannot exceed 200 characters']
    },
    tagline: {
        type: String,
        trim: true,
        maxlength: [200, 'Tagline cannot exceed 200 characters']
    },
    
    // ========== CONTACT INFO ==========
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                const digits = v.replace(/\D/g, '');
                return digits.length >= 10 && digits.length <= 12;
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(v);
            },
            message: 'Please enter a valid website URL'
        }
    },
    
    // ========== ADDRESS ==========
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
        type: String,
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
        type: String,
        default: 'India',
        trim: true,
        maxlength: [100, 'Country cannot exceed 100 characters']
    },
    pincode: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^\d{6}$/.test(v);
            },
            message: 'Pincode must be 6 digits'
        }
    },
    
    // ========== TAX & LEGAL ==========
    gstin: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // GSTIN format: 2 digits state code, 10 PAN, 1 entity number, 1 Z, 1 check digit
                return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
            },
            message: 'Please enter a valid GSTIN (e.g., 27ABCDE1234F1Z5)'
        }
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // PAN format: 5 letters, 4 digits, 1 letter
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
            },
            message: 'Please enter a valid PAN (e.g., ABCDE1234F)'
        }
    },
    cin: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // CIN format: L or U, 5 digits, 2 letters, 4 digits, 3 letters, 6 digits
                return /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v);
            },
            message: 'Please enter a valid CIN'
        }
    },
    
    // ========== PAYMENT SETTINGS ==========
    upiIds: [UpiIdSchema],
    
    bank: {
        type: BankDetailsSchema,
        default: () => ({})
    },
    
    // ========== INVOICE SETTINGS ==========
    invoiceSettings: {
        type: InvoiceSettingsSchema,
        default: () => ({})
    },
    
    // ========== SUPPORT SETTINGS ==========
    support: {
        type: SupportSettingsSchema,
        default: () => ({})
    },
    
    // ========== SOCIAL MEDIA ==========
    social: {
        type: SocialLinksSchema,
        default: () => ({})
    },
    
    // ========== BUSINESS HOURS ==========
    businessHours: {
        type: BusinessHoursSchema,
        default: () => ({})
    },
    
    // ========== BRANDING ==========
    logo: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'Logo must be a valid URL or upload path'
        }
    },
    favicon: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'Favicon must be a valid URL or upload path'
        }
    },
    signature: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'Signature must be a valid URL or upload path'
        }
    },
    stamp: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'Stamp must be a valid URL or upload path'
        }
    },
    
    // ========== THEME ==========
    theme: {
        type: ThemeSchema,
        default: () => ({})
    },
    
    // ========== META ==========
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Meta title cannot exceed 100 characters']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [300, 'Meta description cannot exceed 300 characters']
    },
    metaKeywords: [String],
    
    // ========== TRACKING ==========
    createdBy: {
        type: String,
        ref: 'User'
    },
    updatedBy: {
        type: String,
        ref: 'User'
    },
    
    // ========== SYSTEM FIELDS ==========
    version: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== INDEXES ====================

// Ensure only one settings document exists
CompanySettingsSchema.index({ createdAt: 1 });
CompanySettingsSchema.index({ updatedAt: -1 });
CompanySettingsSchema.index({ 'upiIds.id': 1 });
CompanySettingsSchema.index({ 'upiIds.isActive': 1 });

// ==================== VIRTUALS ====================

// Virtual for formatted address
CompanySettingsSchema.virtual('fullAddress').get(function() {
    const parts = [];
    if (this.address) parts.push(this.address);
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.pincode) parts.push(this.pincode);
    if (this.country) parts.push(this.country);
    return parts.join(', ');
});

// Virtual for active UPI IDs
CompanySettingsSchema.virtual('activeUpiIds').get(function() {
    return this.upiIds?.filter(upi => upi.isActive) || [];
});

// Virtual for formatted bank details
CompanySettingsSchema.virtual('formattedBankDetails').get(function() {
    if (!this.bank) return '';
    return `${this.bank.name}\nA/C: ${this.bank.account}\nIFSC: ${this.bank.ifsc}\n${this.bank.branch}`;
});

// ==================== METHODS ====================

/**
 * Get active UPI IDs as array of strings
 */
CompanySettingsSchema.methods.getActiveUpiIdStrings = function() {
    return this.upiIds
        .filter(upi => upi.isActive)
        .map(upi => upi.id);
};

/**
 * Check if UPI ID exists and is active
 */
CompanySettingsSchema.methods.isValidUpiId = function(upiId) {
    return this.upiIds.some(upi => 
        upi.isActive && upi.id.toLowerCase() === upiId.toLowerCase()
    );
};

/**
 * Increment usage count for a UPI ID
 */
CompanySettingsSchema.methods.incrementUpiUsage = async function(upiId) {
    const upi = this.upiIds.find(u => u.id === upiId);
    if (upi) {
        upi.usageCount = (upi.usageCount || 0) + 1;
        upi.lastUsed = new Date();
        return this.save();
    }
    return this;
};

/**
 * Add a new UPI ID
 */
CompanySettingsSchema.methods.addUpiId = function(upiData) {
    this.upiIds.push({
        id: upiData.id,
        name: upiData.name || upiData.id.split('@')[0],
        appType: upiData.appType || 'other',
        isActive: upiData.isActive !== false,
        description: upiData.description || ''
    });
    return this.save();
};

/**
 * Remove a UPI ID
 */
CompanySettingsSchema.methods.removeUpiId = function(upiId) {
    this.upiIds = this.upiIds.filter(upi => upi.id !== upiId);
    return this.save();
};

/**
 * Toggle UPI ID active status
 */
CompanySettingsSchema.methods.toggleUpiStatus = function(upiId) {
    const upi = this.upiIds.find(u => u.id === upiId);
    if (upi) {
        upi.isActive = !upi.isActive;
        return this.save();
    }
    return this;
};

/**
 * Update bank details
 */
CompanySettingsSchema.methods.updateBankDetails = function(bankData) {
    this.bank = {
        ...this.bank,
        ...bankData
    };
    return this.save();
};

/**
 * Update invoice settings
 */
CompanySettingsSchema.methods.updateInvoiceSettings = function(invoiceData) {
    this.invoiceSettings = {
        ...this.invoiceSettings,
        ...invoiceData
    };
    return this.save();
};

// ==================== STATICS ====================

/**
 * Get or create singleton settings
 */
CompanySettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    
    if (!settings) {
        settings = await this.create({
            companyName: 'PosterPro Store',
            legalName: 'PosterPro Entertainment Private Limited',
            tagline: 'Premium Posters & Art Prints',
            phone: '+91 98765 43210',
            email: 'support@posterpro.store',
            address: '123 Business Street, Andheri East',
            city: 'Mumbai, Maharashtra 400001',
            gstin: '27ABCDE1234F1Z5',
            pan: 'ABCDE1234F',
            upiIds: [
                {
                    id: 'subaask21@oksbi',
                    name: 'Primary UPI',
                    appType: 'other',
                    isActive: true
                },
                {
                    id: 'posterpro.store@okaxis',
                    name: 'PhonePe UPI',
                    appType: 'phonepe',
                    isActive: true
                },
                {
                    id: 'posterpro.store@paytm',
                    name: 'Paytm UPI',
                    appType: 'paytm',
                    isActive: true
                }
            ]
        });
    }
    
    return settings;
};

/**
 * Get active UPI IDs for payment verification
 */
CompanySettingsSchema.statics.getActiveUpiIds = async function() {
    const settings = await this.getSettings();
    return settings.getActiveUpiIdStrings();
};

/**
 * Validate a payment screenshot UPI ID
 */
CompanySettingsSchema.statics.validateUpiId = async function(upiId) {
    const settings = await this.getSettings();
    return settings.isValidUpiId(upiId);
};

/**
 * Get company info for invoice
 */
CompanySettingsSchema.statics.getInvoiceInfo = async function() {
    const settings = await this.getSettings();
    
    return {
        companyName: settings.companyName,
        legalName: settings.legalName,
        address: settings.fullAddress,
        gstin: settings.gstin,
        pan: settings.pan,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        bank: settings.bank,
        invoiceSettings: settings.invoiceSettings,
        logo: settings.logo,
        signature: settings.signature,
        stamp: settings.stamp
    };
};

/**
 * Get support information
 */
CompanySettingsSchema.statics.getSupportInfo = async function() {
    const settings = await this.getSettings();
    
    return {
        email: settings.support?.email || settings.email,
        phone: settings.support?.phone || settings.phone,
        hours: settings.support?.hours || 'Mon-Sat, 10:00 AM - 7:00 PM',
        whatsapp: settings.support?.whatsapp,
        responseTime: settings.support?.responseTime || 'Within 30 minutes',
        address: settings.fullAddress,
        businessHours: settings.businessHours,
        social: settings.social
    };
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware to ensure only one document
 */
CompanySettingsSchema.pre('save', async function(next) {
    // Ensure this is the only document
    if (this.isNew) {
        const count = await mongoose.model('CompanySettings').countDocuments();
        if (count > 0) {
            const error = new Error('Company settings already exist. Use find and update instead.');
            return next(error);
        }
    }
    
    // Increment version
    this.version = (this.version || 0) + 1;
    
    next();
});

/**
 * Post-save middleware to log changes
 */
CompanySettingsSchema.post('save', function(doc) {
    console.log(`🏢 Company settings updated (v${doc.version}) by ${doc.updatedBy || 'system'}`);
});

// ==================== EXPORT ====================

// Check if model already exists to prevent overwrite
const CompanySettings = mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);

export default CompanySettings;