


// import mongoose from 'mongoose';

// // ==================== SCHEMA DEFINITIONS ====================

// /**
//  * UPI ID Schema - For payment verification
//  */
// const UpiIdSchema = new mongoose.Schema({
//     id: {
//         type: String,
//         required: [true, 'UPI ID is required'],
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: function(v) {
//                 // UPI format: username@provider (e.g., name@oksbi, business@paytm)
//                 return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(v);
//             },
//             message: props => `${props.value} is not a valid UPI ID! Must be in format: username@provider`
//         }
//     },
//     name: {
//         type: String,
//         required: [true, 'Display name is required'],
//         trim: true,
//         default: function() {
//             // Default name from UPI ID
//             return this.id.split('@')[0];
//         }
//     },
//     appType: {
//         type: String,
//         enum: {
//             values: ['gpay', 'phonepe', 'paytm', 'bhim', 'other'],
//             message: '{VALUE} is not a valid app type'
//         },
//         default: 'other'
//     },
//     isActive: {
//         type: Boolean,
//         default: true,
//         index: true
//     },
//     description: {
//         type: String,
//         trim: true,
//         maxlength: [200, 'Description cannot exceed 200 characters']
//     },
//     usageCount: {
//         type: Number,
//         default: 0,
//         min: 0
//     },
//     lastUsed: {
//         type: Date
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// }, { 
//     _id: true,
//     timestamps: false 
// });

// /**
//  * Bank Details Schema
//  */
// const BankDetailsSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         trim: true,
//         default: 'State Bank of India'
//     },
//     account: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // Basic account number validation (at least 9 digits)
//                 return /^\d{9,18}$/.test(v.replace(/\s/g, ''));
//             },
//             message: 'Account number must be between 9-18 digits'
//         }
//     },
//     ifsc: {
//         type: String,
//         trim: true,
//         uppercase: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // IFSC format: 4 letters, 0, then 6 alphanumeric
//                 return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
//             },
//             message: 'IFSC code must be in format: ABCD0123456'
//         }
//     },
//     branch: {
//         type: String,
//         trim: true
//     },
//     accountType: {
//         type: String,
//         enum: ['Current Account', 'Savings Account', 'Business Account'],
//         default: 'Current Account'
//     },
//     upiId: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(v);
//             },
//             message: 'Invalid UPI ID format'
//         }
//     }
// }, { 
//     _id: false,
//     timestamps: false 
// });

// /**
//  * Invoice Settings Schema
//  */
// const InvoiceSettingsSchema = new mongoose.Schema({
//     prefix: {
//         type: String,
//         default: 'INV',
//         trim: true,
//         uppercase: true,
//         maxlength: [10, 'Prefix cannot exceed 10 characters']
//     },
//     separator: {
//         type: String,
//         default: '-',
//         maxlength: [2, 'Separator cannot exceed 2 characters']
//     },
//     dateFormat: {
//         type: String,
//         enum: ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'],
//         default: 'dd/mm/yyyy'
//     },
//     currency: {
//         type: String,
//         default: '₹',
//         maxlength: [5, 'Currency symbol too long']
//     },
//     currencyCode: {
//         type: String,
//         default: 'INR',
//         uppercase: true,
//         maxlength: [3, 'Currency code must be 3 characters']
//     },
//     taxSystem: {
//         type: String,
//         enum: ['GST', 'VAT', 'None'],
//         default: 'GST'
//     },
//     gstBreakdown: {
//         type: Boolean,
//         default: true
//     },
//     showCGSTSGST: {
//         type: Boolean,
//         default: true
//     },
//     roundAmount: {
//         type: Boolean,
//         default: true
//     },
//     paymentTerms: {
//         type: String,
//         default: 'Due on receipt',
//         maxlength: [500, 'Payment terms cannot exceed 500 characters']
//     },
//     deliveryTerms: {
//         type: String,
//         default: '3-5 business days after payment confirmation',
//         maxlength: [500, 'Delivery terms cannot exceed 500 characters']
//     },
//     warrantyTerms: {
//         type: String,
//         default: '7 days replacement for manufacturing defects',
//         maxlength: [500, 'Warranty terms cannot exceed 500 characters']
//     },
//     refundPolicy: {
//         type: String,
//         default: 'No refunds after order processing',
//         maxlength: [500, 'Refund policy cannot exceed 500 characters']
//     },
//     footerNote: {
//         type: String,
//         default: 'This is a computer generated invoice, no signature required.',
//         maxlength: [500, 'Footer note cannot exceed 500 characters']
//     },
//     showBankDetails: {
//         type: Boolean,
//         default: true
//     },
//     showQRCode: {
//         type: Boolean,
//         default: false
//     },
//     qrCodeUrl: {
//         type: String,
//         trim: true
//     }
// }, { 
//     _id: false,
//     timestamps: false 
// });

// /**
//  * Support Settings Schema
//  */
// const SupportSettingsSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//             },
//             message: 'Please enter a valid email address'
//         }
//     },
//     phone: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // Allow +91, spaces, etc.
//                 const digits = v.replace(/\D/g, '');
//                 return digits.length >= 10 && digits.length <= 12;
//             },
//             message: 'Please enter a valid phone number'
//         }
//     },
//     hours: {
//         type: String,
//         default: 'Mon-Sat, 10:00 AM - 7:00 PM',
//         maxlength: [100, 'Support hours cannot exceed 100 characters']
//     },
//     whatsapp: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 const digits = v.replace(/\D/g, '');
//                 return digits.length >= 10 && digits.length <= 12;
//             },
//             message: 'Please enter a valid WhatsApp number'
//         }
//     },
//     responseTime: {
//         type: String,
//         default: 'Within 30 minutes',
//         maxlength: [50, 'Response time cannot exceed 50 characters']
//     }
// }, { 
//     _id: false,
//     timestamps: false 
// });

// /**
//  * Social Media Links Schema
//  */
// const SocialLinksSchema = new mongoose.Schema({
//     facebook: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('https://') || v.startsWith('http://');
//             },
//             message: 'Facebook URL must start with http:// or https://'
//         }
//     },
//     instagram: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('https://') || v.startsWith('http://');
//             },
//             message: 'Instagram URL must start with http:// or https://'
//         }
//     },
//     twitter: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('https://') || v.startsWith('http://');
//             },
//             message: 'Twitter URL must start with http:// or https://'
//         }
//     },
//     youtube: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('https://') || v.startsWith('http://');
//             },
//             message: 'YouTube URL must start with http:// or https://'
//         }
//     },
//     linkedin: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('https://') || v.startsWith('http://');
//             },
//             message: 'LinkedIn URL must start with http:// or https://'
//         }
//     }
// }, { 
//     _id: false,
//     timestamps: false 
// });

// /**
//  * Theme Settings Schema
//  */
// const ThemeSchema = new mongoose.Schema({
//     primary: {
//         type: String,
//         default: '#2c3e50',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Primary color must be a valid hex code (e.g., #2c3e50)'
//         }
//     },
//     secondary: {
//         type: String,
//         default: '#34495e',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Secondary color must be a valid hex code (e.g., #34495e)'
//         }
//     },
//     accent: {
//         type: String,
//         default: '#27ae60',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Accent color must be a valid hex code (e.g., #27ae60)'
//         }
//     },
//     danger: {
//         type: String,
//         default: '#e74c3c',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Danger color must be a valid hex code'
//         }
//     },
//     warning: {
//         type: String,
//         default: '#f39c12',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Warning color must be a valid hex code'
//         }
//     },
//     info: {
//         type: String,
//         default: '#3498db',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Info color must be a valid hex code'
//         }
//     },
//     success: {
//         type: String,
//         default: '#27ae60',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Success color must be a valid hex code'
//         }
//     },
//     textPrimary: {
//         type: String,
//         default: '#2c3e50',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Text primary color must be a valid hex code'
//         }
//     },
//     textSecondary: {
//         type: String,
//         default: '#7f8c8d',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Text secondary color must be a valid hex code'
//         }
//     },
//     background: {
//         type: String,
//         default: '#ecf0f1',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Background color must be a valid hex code'
//         }
//     },
//     surface: {
//         type: String,
//         default: '#ffffff',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Surface color must be a valid hex code'
//         }
//     },
//     border: {
//         type: String,
//         default: '#bdc3c7',
//         validate: {
//             validator: function(v) {
//                 return /^#[0-9A-F]{6}$/i.test(v);
//             },
//             message: 'Border color must be a valid hex code'
//         }
//     }
// }, { 
//     _id: false,
//     timestamps: false 
// });

// /**
//  * Business Hours Schema
//  */
// const BusinessHoursSchema = new mongoose.Schema({
//     monday: { type: String, default: '9:00 AM - 8:00 PM' },
//     tuesday: { type: String, default: '9:00 AM - 8:00 PM' },
//     wednesday: { type: String, default: '9:00 AM - 8:00 PM' },
//     thursday: { type: String, default: '9:00 AM - 8:00 PM' },
//     friday: { type: String, default: '9:00 AM - 8:00 PM' },
//     saturday: { type: String, default: '9:00 AM - 6:00 PM' },
//     sunday: { type: String, default: 'Closed' },
//     holidays: [{
//         date: Date,
//         description: String
//     }]
// }, { 
//     _id: false,
//     timestamps: false 
// });

// // ==================== MAIN COMPANY SETTINGS SCHEMA ====================

// const CompanySettingsSchema = new mongoose.Schema({
//     // ========== BASIC INFO ==========
//     companyName: {
//         type: String,
//         required: [true, 'Company name is required'],
//         trim: true,
//         index: true,
//         maxlength: [100, 'Company name cannot exceed 100 characters']
//     },
//     legalName: {
//         type: String,
//         trim: true,
//         maxlength: [200, 'Legal name cannot exceed 200 characters']
//     },
//     tagline: {
//         type: String,
//         trim: true,
//         maxlength: [200, 'Tagline cannot exceed 200 characters']
//     },
    
//     // ========== CONTACT INFO ==========
//     phone: {
//         type: String,
//         required: [true, 'Phone number is required'],
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 const digits = v.replace(/\D/g, '');
//                 return digits.length >= 10 && digits.length <= 12;
//             },
//             message: 'Please enter a valid phone number'
//         }
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         trim: true,
//         lowercase: true,
//         validate: {
//             validator: function(v) {
//                 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//             },
//             message: 'Please enter a valid email address'
//         }
//     },
//     website: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(v);
//             },
//             message: 'Please enter a valid website URL'
//         }
//     },
    
//     // ========== ADDRESS ==========
//     address: {
//         type: String,
//         required: [true, 'Address is required'],
//         trim: true,
//         maxlength: [500, 'Address cannot exceed 500 characters']
//     },
//     city: {
//         type: String,
//         required: [true, 'City is required'],
//         trim: true,
//         maxlength: [100, 'City cannot exceed 100 characters']
//     },
//     state: {
//         type: String,
//         trim: true,
//         maxlength: [100, 'State cannot exceed 100 characters']
//     },
//     country: {
//         type: String,
//         default: 'India',
//         trim: true,
//         maxlength: [100, 'Country cannot exceed 100 characters']
//     },
//     pincode: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return /^\d{6}$/.test(v);
//             },
//             message: 'Pincode must be 6 digits'
//         }
//     },
    
//     // ========== TAX & LEGAL ==========
//     gstin: {
//         type: String,
//         trim: true,
//         uppercase: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // GSTIN format: 2 digits state code, 10 PAN, 1 entity number, 1 Z, 1 check digit
//                 return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
//             },
//             message: 'Please enter a valid GSTIN (e.g., 27ABCDE1234F1Z5)'
//         }
//     },
//     pan: {
//         type: String,
//         trim: true,
//         uppercase: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // PAN format: 5 letters, 4 digits, 1 letter
//                 return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
//             },
//             message: 'Please enter a valid PAN (e.g., ABCDE1234F)'
//         }
//     },
//     cin: {
//         type: String,
//         trim: true,
//         uppercase: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 // CIN format: L or U, 5 digits, 2 letters, 4 digits, 3 letters, 6 digits
//                 return /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v);
//             },
//             message: 'Please enter a valid CIN'
//         }
//     },
    
//     // ========== PAYMENT SETTINGS ==========
//     upiIds: [UpiIdSchema],
    
//     bank: {
//         type: BankDetailsSchema,
//         default: () => ({})
//     },
    
//     // ========== INVOICE SETTINGS ==========
//     invoiceSettings: {
//         type: InvoiceSettingsSchema,
//         default: () => ({})
//     },
    
//     // ========== SUPPORT SETTINGS ==========
//     support: {
//         type: SupportSettingsSchema,
//         default: () => ({})
//     },
    
//     // ========== SOCIAL MEDIA ==========
//     social: {
//         type: SocialLinksSchema,
//         default: () => ({})
//     },
    
//     // ========== BUSINESS HOURS ==========
//     businessHours: {
//         type: BusinessHoursSchema,
//         default: () => ({})
//     },
    
//     // ========== BRANDING ==========
//     logo: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('/uploads/') || v.startsWith('http');
//             },
//             message: 'Logo must be a valid URL or upload path'
//         }
//     },
//     favicon: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('/uploads/') || v.startsWith('http');
//             },
//             message: 'Favicon must be a valid URL or upload path'
//         }
//     },
//     signature: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('/uploads/') || v.startsWith('http');
//             },
//             message: 'Signature must be a valid URL or upload path'
//         }
//     },
//     stamp: {
//         type: String,
//         trim: true,
//         validate: {
//             validator: function(v) {
//                 if (!v) return true;
//                 return v.startsWith('/uploads/') || v.startsWith('http');
//             },
//             message: 'Stamp must be a valid URL or upload path'
//         }
//     },
    
//     // ========== THEME ==========
//     theme: {
//         type: ThemeSchema,
//         default: () => ({})
//     },
    
//     // ========== META ==========
//     metaTitle: {
//         type: String,
//         trim: true,
//         maxlength: [100, 'Meta title cannot exceed 100 characters']
//     },
//     metaDescription: {
//         type: String,
//         trim: true,
//         maxlength: [300, 'Meta description cannot exceed 300 characters']
//     },
//     metaKeywords: [String],
    
//     // ========== TRACKING ==========
//     createdBy: {
//         type: String,
//         ref: 'User'
//     },
//     updatedBy: {
//         type: String,
//         ref: 'User'
//     },
    
//     // ========== SYSTEM FIELDS ==========
//     version: {
//         type: Number,
//         default: 1
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
    
//     // ✅ ADDED: Order flow mode for WhatsApp bot
//     // Values: 'short' (combined address) or 'long' (step by step)
//     // Default: 'short' for new installations
//     orderFlowMode: {
//         type: String,
//         enum: ['short', 'long'],
//         default: 'short',
//         description: 'Order flow mode for WhatsApp bot: short (combined address) or long (step by step)'
//     }
// }, {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// // ==================== INDEXES ====================

// // Ensure only one settings document exists
// CompanySettingsSchema.index({ createdAt: 1 });
// CompanySettingsSchema.index({ updatedAt: -1 });
// CompanySettingsSchema.index({ 'upiIds.id': 1 });
// CompanySettingsSchema.index({ 'upiIds.isActive': 1 });

// // ==================== VIRTUALS ====================

// // Virtual for formatted address
// CompanySettingsSchema.virtual('fullAddress').get(function() {
//     const parts = [];
//     if (this.address) parts.push(this.address);
//     if (this.city) parts.push(this.city);
//     if (this.state) parts.push(this.state);
//     if (this.pincode) parts.push(this.pincode);
//     if (this.country) parts.push(this.country);
//     return parts.join(', ');
// });

// // Virtual for active UPI IDs
// CompanySettingsSchema.virtual('activeUpiIds').get(function() {
//     return this.upiIds?.filter(upi => upi.isActive) || [];
// });

// // Virtual for formatted bank details
// CompanySettingsSchema.virtual('formattedBankDetails').get(function() {
//     if (!this.bank) return '';
//     return `${this.bank.name}\nA/C: ${this.bank.account}\nIFSC: ${this.bank.ifsc}\n${this.bank.branch}`;
// });

// // ==================== METHODS ====================

// /**
//  * Get active UPI IDs as array of strings
//  */
// CompanySettingsSchema.methods.getActiveUpiIdStrings = function() {
//     return this.upiIds
//         .filter(upi => upi.isActive)
//         .map(upi => upi.id);
// };

// /**
//  * Check if UPI ID exists and is active
//  */
// CompanySettingsSchema.methods.isValidUpiId = function(upiId) {
//     return this.upiIds.some(upi => 
//         upi.isActive && upi.id.toLowerCase() === upiId.toLowerCase()
//     );
// };

// /**
//  * Increment usage count for a UPI ID
//  */
// CompanySettingsSchema.methods.incrementUpiUsage = async function(upiId) {
//     const upi = this.upiIds.find(u => u.id === upiId);
//     if (upi) {
//         upi.usageCount = (upi.usageCount || 0) + 1;
//         upi.lastUsed = new Date();
//         return this.save();
//     }
//     return this;
// };

// /**
//  * Add a new UPI ID
//  */
// CompanySettingsSchema.methods.addUpiId = function(upiData) {
//     this.upiIds.push({
//         id: upiData.id,
//         name: upiData.name || upiData.id.split('@')[0],
//         appType: upiData.appType || 'other',
//         isActive: upiData.isActive !== false,
//         description: upiData.description || ''
//     });
//     return this.save();
// };

// /**
//  * Remove a UPI ID
//  */
// CompanySettingsSchema.methods.removeUpiId = function(upiId) {
//     this.upiIds = this.upiIds.filter(upi => upi.id !== upiId);
//     return this.save();
// };

// /**
//  * Toggle UPI ID active status
//  */
// CompanySettingsSchema.methods.toggleUpiStatus = function(upiId) {
//     const upi = this.upiIds.find(u => u.id === upiId);
//     if (upi) {
//         upi.isActive = !upi.isActive;
//         return this.save();
//     }
//     return this;
// };

// /**
//  * Update bank details
//  */
// CompanySettingsSchema.methods.updateBankDetails = function(bankData) {
//     this.bank = {
//         ...this.bank,
//         ...bankData
//     };
//     return this.save();
// };

// /**
//  * Update invoice settings
//  */
// CompanySettingsSchema.methods.updateInvoiceSettings = function(invoiceData) {
//     this.invoiceSettings = {
//         ...this.invoiceSettings,
//         ...invoiceData
//     };
//     return this.save();
// };

// // ==================== STATICS ====================

// /**
//  * Get or create singleton settings
//  */
// CompanySettingsSchema.statics.getSettings = async function() {
//     let settings = await this.findOne();
    
//     if (!settings) {
//         settings = await this.create({
//             companyName: 'PosterPro Store',
//             legalName: 'PosterPro Entertainment Private Limited',
//             tagline: 'Premium Posters & Art Prints',
//             phone: '+91 98765 43210',
//             email: 'support@posterpro.store',
//             address: '123 Business Street, Andheri East',
//             city: 'Mumbai, Maharashtra 400001',
//             gstin: '27ABCDE1234F1Z5',
//             pan: 'ABCDE1234F',
//             upiIds: [
//                 {
//                     id: 'subaask21@oksbi',
//                     name: 'Primary UPI',
//                     appType: 'other',
//                     isActive: true
//                 },
//                 {
//                     id: 'posterpro.store@okaxis',
//                     name: 'PhonePe UPI',
//                     appType: 'phonepe',
//                     isActive: true
//                 },
//                 {
//                     id: 'posterpro.store@paytm',
//                     name: 'Paytm UPI',
//                     appType: 'paytm',
//                     isActive: true
//                 }
//             ],
//             // ✅ ADDED: Default order flow mode for new installations
//             orderFlowMode: 'short'
//         });
//     }
    
//     return settings;
// };

// /**
//  * Get active UPI IDs for payment verification
//  */
// CompanySettingsSchema.statics.getActiveUpiIds = async function() {
//     const settings = await this.getSettings();
//     return settings.getActiveUpiIdStrings();
// };

// /**
//  * Validate a payment screenshot UPI ID
//  */
// CompanySettingsSchema.statics.validateUpiId = async function(upiId) {
//     const settings = await this.getSettings();
//     return settings.isValidUpiId(upiId);
// };

// /**
//  * Get company info for invoice
//  */
// CompanySettingsSchema.statics.getInvoiceInfo = async function() {
//     const settings = await this.getSettings();
    
//     return {
//         companyName: settings.companyName,
//         legalName: settings.legalName,
//         address: settings.fullAddress,
//         gstin: settings.gstin,
//         pan: settings.pan,
//         phone: settings.phone,
//         email: settings.email,
//         website: settings.website,
//         bank: settings.bank,
//         invoiceSettings: settings.invoiceSettings,
//         logo: settings.logo,
//         signature: settings.signature,
//         stamp: settings.stamp
//     };
// };

// /**
//  * Get support information
//  */
// CompanySettingsSchema.statics.getSupportInfo = async function() {
//     const settings = await this.getSettings();
    
//     return {
//         email: settings.support?.email || settings.email,
//         phone: settings.support?.phone || settings.phone,
//         hours: settings.support?.hours || 'Mon-Sat, 10:00 AM - 7:00 PM',
//         whatsapp: settings.support?.whatsapp,
//         responseTime: settings.support?.responseTime || 'Within 30 minutes',
//         address: settings.fullAddress,
//         businessHours: settings.businessHours,
//         social: settings.social
//     };
// };

// // ==================== MIDDLEWARE ====================

// /**
//  * Pre-save middleware to ensure only one document
//  */
// CompanySettingsSchema.pre('save', async function(next) {
//     // Ensure this is the only document
//     if (this.isNew) {
//         const count = await mongoose.model('CompanySettings').countDocuments();
//         if (count > 0) {
//             const error = new Error('Company settings already exist. Use find and update instead.');
//             return next(error);
//         }
//     }
    
//     // Increment version
//     this.version = (this.version || 0) + 1;
    
//     next();
// });

// /**
//  * Post-save middleware to log changes
//  */
// CompanySettingsSchema.post('save', function(doc) {
//     console.log(`🏢 Company settings updated (v${doc.version}) by ${doc.updatedBy || 'system'}`);
//     // ✅ ADDED: Log order flow mode
//     console.log(`📋 Order flow mode: ${doc.orderFlowMode || 'short'}`);
// });

// // ==================== EXPORT ====================

// // Check if model already exists to prevent overwrite
// const CompanySettings = mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);

// export default CompanySettings;







// above code is without saas \












// models/CompanySettings.js - PROFESSIONAL 3-OCR MULTI-TENANT VERSION
// Industry standard: Complete payment method configuration for each company

import mongoose from 'mongoose';

// ==================== PAYMENT METHOD SCHEMAS ====================

/**
 * UPI ID Schema - Standard UPI format (name@bank)
 */
const UpiIdSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'UPI ID is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
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
            return this.id.split('@')[0];
        }
    },
    appType: {
        type: String,
        enum: {
            values: ['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay', 'other'],
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
}, { _id: true });

/**
 * GPay Number Schema - Phone-based payments
 */
const GpayNumberSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'GPay phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                const digits = v.replace(/\D/g, '');
                return digits.length === 10;
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    name: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    upiId: {
        type: String,
        trim: true,
        lowercase: true,
        default: function() {
            const digits = this.phoneNumber.replace(/\D/g, '');
            return `${digits}@okhdfcbank`;
        }
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
        default: 0
    },
    lastUsed: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

/**
 * PhonePe Number Schema
 */
const PhonePeNumberSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'PhonePe phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                const digits = v.replace(/\D/g, '');
                return digits.length === 10;
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    name: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    upiId: {
        type: String,
        trim: true,
        lowercase: true,
        default: function() {
            const digits = this.phoneNumber.replace(/\D/g, '');
            return `${digits}@ybl`;
        }
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
        default: 0
    },
    lastUsed: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

/**
 * PayTM Number Schema
 */
const PaytmNumberSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, 'PayTM phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                const digits = v.replace(/\D/g, '');
                return digits.length === 10;
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    name: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    upiId: {
        type: String,
        trim: true,
        lowercase: true,
        default: function() {
            const digits = this.phoneNumber.replace(/\D/g, '');
            return `${digits}@paytm`;
        }
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
        default: 0
    },
    lastUsed: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

/**
 * QR Code Schema
 */
const QrCodeSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'QR code must be a valid URL or upload path'
        }
    },
    imageData: {
        type: String,
        select: false // Don't return by default (large)
    },
    name: {
        type: String,
        default: 'Payment QR Code'
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    scanCount: {
        type: Number,
        default: 0
    },
    lastScanned: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

/**
 * Bank Account Schema
 */
const BankAccountSchema = new mongoose.Schema({
    accountName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{9,18}$/.test(v.replace(/\s/g, ''));
            },
            message: 'Account number must be between 9-18 digits'
        }
    },
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true
    },
    ifscCode: {
        type: String,
        required: [true, 'IFSC code is required'],
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
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
        enum: ['Current', 'Savings', 'Business'],
        default: 'Current'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    upiId: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(v);
            },
            message: 'Invalid UPI ID format'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

/**
 * Payment Settings Schema - Global payment configuration
 */
const PaymentSettingsSchema = new mongoose.Schema({
    preferredMethod: {
        type: String,
        enum: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank', 'any'],
        default: 'any'
    },
    allowPartialPayments: {
        type: Boolean,
        default: false
    },
    autoVerifyEnabled: {
        type: Boolean,
        default: true
    },
    minConfidenceForAuto: {
        type: Number,
        min: 50,
        max: 100,
        default: 85
    },
    paymentTimeout: {
        type: Number,
        min: 5,
        max: 60,
        default: 30,
        description: 'Minutes before payment expires'
    },
    requireTransactionId: {
        type: Boolean,
        default: true
    },
    allowMultiplePaymentMethods: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: [String],
        default: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank']
    },
    autoVerifyThresholds: {
        amountTolerance: {
            type: Number,
            default: 2,
            description: '₹ tolerance for amount matching'
        },
        timeWindow: {
            type: Number,
            default: 15,
            description: 'Minutes window for recent payments'
        },
        minConfidencePerField: {
            amount: { type: Number, default: 80 },
            upi: { type: Number, default: 80 },
            transactionId: { type: Number, default: 70 }
        }
    }
}, { _id: false });

// ==================== BANK DETAILS SCHEMA (Legacy Support) ====================

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
}, { _id: false });

// ==================== INVOICE SETTINGS SCHEMA ====================

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
}, { _id: false });

// ==================== SUPPORT SETTINGS SCHEMA ====================

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
}, { _id: false });

// ==================== SOCIAL MEDIA SCHEMA ====================

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
}, { _id: false });

// ==================== BUSINESS HOURS SCHEMA ====================

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
}, { _id: false });

// ==================== THEME SCHEMA ====================

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
}, { _id: false });

// ==================== MAIN COMPANY SETTINGS SCHEMA ====================

const CompanySettingsSchema = new mongoose.Schema({
    // ===== SAAS MULTI-TENANCY =====
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company ID is required'],
        unique: true,
        index: true
    },
    
    // ===== AUDIT FIELDS =====
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by user is required']
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // ===== BASIC INFO =====
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
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
    
    // ===== CONTACT INFO =====
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
    
    // ===== ADDRESS =====
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
    
    // ===== TAX & LEGAL =====
    gstin: {
        type: String,
        trim: true,
        uppercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
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
                return /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v);
            },
            message: 'Please enter a valid CIN'
        }
    },
    
    // ===== PAYMENT METHODS - CRITICAL FOR 3-OCR SYSTEM =====
    upiIds: [UpiIdSchema],
    gpayNumbers: [GpayNumberSchema],
    phonePeNumbers: [PhonePeNumberSchema],
    paytmNumbers: [PaytmNumberSchema],
    qrCode: QrCodeSchema,
    bankAccounts: [BankAccountSchema],
    
    // ===== PAYMENT SETTINGS =====
    paymentSettings: {
        type: PaymentSettingsSchema,
        default: () => ({})
    },
    
    // ===== LEGACY BANK DETAILS (for backward compatibility) =====
    bank: {
        type: BankDetailsSchema,
        default: () => ({})
    },
    
    // ===== INVOICE SETTINGS =====
    invoiceSettings: {
        type: InvoiceSettingsSchema,
        default: () => ({})
    },
    
    // ===== SUPPORT SETTINGS =====
    support: {
        type: SupportSettingsSchema,
        default: () => ({})
    },
    
    // ===== SOCIAL MEDIA =====
    social: {
        type: SocialLinksSchema,
        default: () => ({})
    },
    
    // ===== BUSINESS HOURS =====
    businessHours: {
        type: BusinessHoursSchema,
        default: () => ({})
    },
    
    // ===== BRANDING =====
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
    
    // ===== THEME =====
    theme: {
        type: ThemeSchema,
        default: () => ({})
    },
    
    // ===== META =====
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
    
    // ===== WHATSAPP BOT SETTINGS =====
    orderFlowMode: {
        type: String,
        enum: ['short', 'long'],
        default: 'short',
        description: 'Order flow mode for WhatsApp bot: short (combined address) or long (step by step)'
    },
    
    // ===== SYSTEM FIELDS =====
    version: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== INDEXES ====================

CompanySettingsSchema.index({ companyId: 1, isActive: 1 });
CompanySettingsSchema.index({ 'upiIds.id': 1 });
CompanySettingsSchema.index({ 'gpayNumbers.phoneNumber': 1 });
CompanySettingsSchema.index({ 'phonePeNumbers.phoneNumber': 1 });
CompanySettingsSchema.index({ 'paytmNumbers.phoneNumber': 1 });
CompanySettingsSchema.index({ createdAt: -1 });
CompanySettingsSchema.index({ updatedAt: -1 });

// ==================== VIRTUALS ====================

CompanySettingsSchema.virtual('fullAddress').get(function() {
    const parts = [];
    if (this.address) parts.push(this.address);
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.pincode) parts.push(this.pincode);
    if (this.country) parts.push(this.country);
    return parts.join(', ');
});

CompanySettingsSchema.virtual('activeUpiIds').get(function() {
    return this.upiIds?.filter(upi => upi.isActive) || [];
});

CompanySettingsSchema.virtual('activeGpayNumbers').get(function() {
    return this.gpayNumbers?.filter(g => g.isActive) || [];
});

CompanySettingsSchema.virtual('activePhonePeNumbers').get(function() {
    return this.phonePeNumbers?.filter(p => p.isActive) || [];
});

CompanySettingsSchema.virtual('activePaytmNumbers').get(function() {
    return this.paytmNumbers?.filter(p => p.isActive) || [];
});

CompanySettingsSchema.virtual('activeBankAccounts').get(function() {
    return this.bankAccounts?.filter(b => b.isActive) || [];
});

CompanySettingsSchema.virtual('hasActiveQrCode').get(function() {
    return !!(this.qrCode && this.qrCode.isActive && (this.qrCode.imageUrl || this.qrCode.imageData));
});

CompanySettingsSchema.virtual('allPaymentMethods').get(function() {
    const methods = [];
    
    // Add UPI IDs
    this.activeUpiIds.forEach(upi => {
        methods.push({
            type: 'upi',
            id: upi.id,
            name: upi.name,
            appType: upi.appType,
            displayValue: upi.id
        });
    });
    
    // Add GPay numbers
    this.activeGpayNumbers.forEach(gpay => {
        methods.push({
            type: 'gpay',
            phoneNumber: gpay.phoneNumber,
            upiId: gpay.upiId,
            name: gpay.name,
            displayValue: gpay.phoneNumber
        });
    });
    
    // Add PhonePe numbers
    this.activePhonePeNumbers.forEach(phonepe => {
        methods.push({
            type: 'phonepe',
            phoneNumber: phonepe.phoneNumber,
            upiId: phonepe.upiId,
            name: phonepe.name,
            displayValue: phonepe.phoneNumber
        });
    });
    
    // Add PayTM numbers
    this.activePaytmNumbers.forEach(paytm => {
        methods.push({
            type: 'paytm',
            phoneNumber: paytm.phoneNumber,
            upiId: paytm.upiId,
            name: paytm.name,
            displayValue: paytm.phoneNumber
        });
    });
    
    // Add QR code
    if (this.hasActiveQrCode) {
        methods.push({
            type: 'qr',
            imageUrl: this.qrCode.imageUrl,
            name: this.qrCode.name,
            description: this.qrCode.description,
            displayValue: 'QR Code'
        });
    }
    
    // Add bank accounts
    this.activeBankAccounts.forEach(bank => {
        methods.push({
            type: 'bank',
            accountName: bank.accountName,
            bankName: bank.bankName,
            accountNumber: bank.accountNumber.slice(-4),
            ifscCode: bank.ifscCode,
            displayValue: `${bank.bankName} (${bank.accountNumber.slice(-4)})`
        });
    });
    
    return methods;
});

CompanySettingsSchema.virtual('auditInfo').get(function() {
    return {
        created: {
            at: this.createdAt,
            by: this.createdBy
        },
        updated: {
            at: this.updatedAt,
            by: this.updatedBy
        }
    };
});

// ==================== METHODS ====================

CompanySettingsSchema.methods.belongsToCompany = function(companyId) {
    return this.companyId && this.companyId.toString() === companyId.toString();
};

/**
 * Get all active payment identifiers (UPI IDs, phone numbers)
 */
CompanySettingsSchema.methods.getActivePaymentIdentifiers = function() {
    const identifiers = [];
    
    // Add UPI IDs
    this.activeUpiIds.forEach(upi => {
        identifiers.push({
            type: 'upi',
            value: upi.id,
            name: upi.name
        });
    });
    
    // Add GPay numbers
    this.activeGpayNumbers.forEach(gpay => {
        identifiers.push({
            type: 'gpay',
            value: gpay.phoneNumber,
            upiValue: gpay.upiId,
            name: gpay.name
        });
    });
    
    // Add PhonePe numbers
    this.activePhonePeNumbers.forEach(phonepe => {
        identifiers.push({
            type: 'phonepe',
            value: phonepe.phoneNumber,
            upiValue: phonepe.upiId,
            name: phonepe.name
        });
    });
    
    // Add PayTM numbers
    this.activePaytmNumbers.forEach(paytm => {
        identifiers.push({
            type: 'paytm',
            value: paytm.phoneNumber,
            upiValue: paytm.upiId,
            name: paytm.name
        });
    });
    
    return identifiers;
};

/**
 * Validate a payment identifier against company settings
 */
CompanySettingsSchema.methods.validatePaymentIdentifier = function(type, value) {
    const cleanValue = value.toString().toLowerCase().trim();
    
    switch(type) {
        case 'upi':
            return this.upiIds.some(u => 
                u.isActive && u.id.toLowerCase() === cleanValue
            );
        
        case 'gpay':
            const gpayDigits = cleanValue.replace(/\D/g, '');
            return this.gpayNumbers.some(g => 
                g.isActive && g.phoneNumber.replace(/\D/g, '') === gpayDigits
            );
        
        case 'phonepe':
            const phonepeDigits = cleanValue.replace(/\D/g, '');
            return this.phonePeNumbers.some(p => 
                p.isActive && p.phoneNumber.replace(/\D/g, '') === phonepeDigits
            );
        
        case 'paytm':
            const paytmDigits = cleanValue.replace(/\D/g, '');
            return this.paytmNumbers.some(p => 
                p.isActive && p.phoneNumber.replace(/\D/g, '') === paytmDigits
            );
        
        default:
            return false;
    }
};

/**
 * Increment usage count for a payment method
 */
CompanySettingsSchema.methods.incrementUsage = async function(type, identifier) {
    switch(type) {
        case 'upi':
            const upi = this.upiIds.find(u => u.id === identifier);
            if (upi) {
                upi.usageCount = (upi.usageCount || 0) + 1;
                upi.lastUsed = new Date();
            }
            break;
        
        case 'gpay':
            const gpay = this.gpayNumbers.find(g => g.phoneNumber === identifier);
            if (gpay) {
                gpay.usageCount = (gpay.usageCount || 0) + 1;
                gpay.lastUsed = new Date();
            }
            break;
        
        case 'phonepe':
            const phonepe = this.phonePeNumbers.find(p => p.phoneNumber === identifier);
            if (phonepe) {
                phonepe.usageCount = (phonepe.usageCount || 0) + 1;
                phonepe.lastUsed = new Date();
            }
            break;
        
        case 'paytm':
            const paytm = this.paytmNumbers.find(p => p.phoneNumber === identifier);
            if (paytm) {
                paytm.usageCount = (paytm.usageCount || 0) + 1;
                paytm.lastUsed = new Date();
            }
            break;
    }
    
    return this.save();
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
 * Add a new GPay number
 */
CompanySettingsSchema.methods.addGpayNumber = function(gpayData) {
    const digits = gpayData.phoneNumber.replace(/\D/g, '');
    this.gpayNumbers.push({
        phoneNumber: digits,
        name: gpayData.name || `GPay ${digits.slice(-4)}`,
        upiId: gpayData.upiId || `${digits}@okhdfcbank`,
        isActive: gpayData.isActive !== false,
        description: gpayData.description || ''
    });
    return this.save();
};

/**
 * Add a new PhonePe number
 */
CompanySettingsSchema.methods.addPhonePeNumber = function(phonepeData) {
    const digits = phonepeData.phoneNumber.replace(/\D/g, '');
    this.phonePeNumbers.push({
        phoneNumber: digits,
        name: phonepeData.name || `PhonePe ${digits.slice(-4)}`,
        upiId: phonepeData.upiId || `${digits}@ybl`,
        isActive: phonepeData.isActive !== false,
        description: phonepeData.description || ''
    });
    return this.save();
};

/**
 * Add a new PayTM number
 */
CompanySettingsSchema.methods.addPaytmNumber = function(paytmData) {
    const digits = paytmData.phoneNumber.replace(/\D/g, '');
    this.paytmNumbers.push({
        phoneNumber: digits,
        name: paytmData.name || `PayTM ${digits.slice(-4)}`,
        upiId: paytmData.upiId || `${digits}@paytm`,
        isActive: paytmData.isActive !== false,
        description: paytmData.description || ''
    });
    return this.save();
};

/**
 * Update QR code
 */
CompanySettingsSchema.methods.updateQrCode = function(qrData) {
    this.qrCode = {
        ...this.qrCode,
        ...qrData,
        updatedAt: new Date()
    };
    return this.save();
};

/**
 * Remove a payment method
 */
CompanySettingsSchema.methods.removePaymentMethod = function(type, id) {
    switch(type) {
        case 'upi':
            this.upiIds = this.upiIds.filter(u => u.id !== id);
            break;
        case 'gpay':
            this.gpayNumbers = this.gpayNumbers.filter(g => g.phoneNumber !== id);
            break;
        case 'phonepe':
            this.phonePeNumbers = this.phonePeNumbers.filter(p => p.phoneNumber !== id);
            break;
        case 'paytm':
            this.paytmNumbers = this.paytmNumbers.filter(p => p.phoneNumber !== id);
            break;
        case 'bank':
            this.bankAccounts = this.bankAccounts.filter(b => b._id.toString() !== id);
            break;
    }
    return this.save();
};

/**
 * Toggle payment method active status
 */
CompanySettingsSchema.methods.togglePaymentMethodStatus = function(type, id) {
    switch(type) {
        case 'upi':
            const upi = this.upiIds.find(u => u.id === id);
            if (upi) upi.isActive = !upi.isActive;
            break;
        case 'gpay':
            const gpay = this.gpayNumbers.find(g => g.phoneNumber === id);
            if (gpay) gpay.isActive = !gpay.isActive;
            break;
        case 'phonepe':
            const phonepe = this.phonePeNumbers.find(p => p.phoneNumber === id);
            if (phonepe) phonepe.isActive = !phonepe.isActive;
            break;
        case 'paytm':
            const paytm = this.paytmNumbers.find(p => p.phoneNumber === id);
            if (paytm) paytm.isActive = !paytm.isActive;
            break;
        case 'qr':
            if (this.qrCode) this.qrCode.isActive = !this.qrCode.isActive;
            break;
        case 'bank':
            const bank = this.bankAccounts.find(b => b._id.toString() === id);
            if (bank) bank.isActive = !bank.isActive;
            break;
    }
    return this.save();
};

// ==================== STATICS ====================

CompanySettingsSchema.statics.getSettings = async function(companyId) {
    const settings = await this.findOne({ companyId });
    
    if (!settings) {
        throw new Error(`Settings not found for company ${companyId}`);
    }
    
    return settings;
};

CompanySettingsSchema.statics.getOrCreateSettings = async function(companyId, createdBy, companyData = {}) {
    let settings = await this.findOne({ companyId });
    
    if (!settings) {
        settings = await this.create({
            companyId,
            createdBy,
            companyName: companyData.companyName || 'New Company',
            phone: companyData.phone || '+91 00000 00000',
            email: companyData.email || 'info@company.com',
            address: companyData.address || 'Address pending',
            city: companyData.city || 'City pending',
            upiIds: [],
            gpayNumbers: [],
            phonePeNumbers: [],
            paytmNumbers: [],
            bankAccounts: [],
            orderFlowMode: 'short'
        });
    }
    
    return settings;
};

/**
 * Get all active payment methods for a company
 */
CompanySettingsSchema.statics.getActivePaymentMethods = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.allPaymentMethods;
};

/**
 * Get active UPI IDs for payment verification
 */
CompanySettingsSchema.statics.getActiveUpiIds = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.activeUpiIds.map(upi => upi.id);
};

/**
 * Get active GPay numbers
 */
CompanySettingsSchema.statics.getActiveGpayNumbers = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.activeGpayNumbers;
};

/**
 * Get active PhonePe numbers
 */
CompanySettingsSchema.statics.getActivePhonePeNumbers = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.activePhonePeNumbers;
};

/**
 * Get active PayTM numbers
 */
CompanySettingsSchema.statics.getActivePaytmNumbers = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.activePaytmNumbers;
};

/**
 * Get active QR code
 */
CompanySettingsSchema.statics.getActiveQrCode = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.hasActiveQrCode ? settings.qrCode : null;
};

/**
 * Validate a payment method for a company
 */
CompanySettingsSchema.statics.validatePaymentMethod = async function(companyId, type, value) {
    const settings = await this.getSettings(companyId);
    return settings.validatePaymentIdentifier(type, value);
};

/**
 * Get payment settings for a company
 */
CompanySettingsSchema.statics.getPaymentSettings = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.paymentSettings || {};
};

/**
 * Get order flow mode for WhatsApp bot
 */
CompanySettingsSchema.statics.getOrderFlowMode = async function(companyId) {
    const settings = await this.getSettings(companyId);
    return settings.orderFlowMode || 'short';
};

/**
 * Get company info for invoice
 */
CompanySettingsSchema.statics.getInvoiceInfo = async function(companyId) {
    const settings = await this.getSettings(companyId);
    
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
 * Get support information for a company
 */
CompanySettingsSchema.statics.getSupportInfo = async function(companyId) {
    const settings = await this.getSettings(companyId);
    
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

CompanySettingsSchema.pre('save', async function(next) {
    // Ensure companyId exists
    if (!this.companyId) {
        return next(new Error('Company ID is required'));
    }
    
    // Increment version
    this.version = (this.version || 0) + 1;
    
    // Auto-generate UPI IDs for phone numbers if not provided
    if (this.gpayNumbers) {
        this.gpayNumbers.forEach(gpay => {
            if (!gpay.upiId) {
                const digits = gpay.phoneNumber.replace(/\D/g, '');
                gpay.upiId = `${digits}@okhdfcbank`;
            }
        });
    }
    
    if (this.phonePeNumbers) {
        this.phonePeNumbers.forEach(phonepe => {
            if (!phonepe.upiId) {
                const digits = phonepe.phoneNumber.replace(/\D/g, '');
                phonepe.upiId = `${digits}@ybl`;
            }
        });
    }
    
    if (this.paytmNumbers) {
        this.paytmNumbers.forEach(paytm => {
            if (!paytm.upiId) {
                const digits = paytm.phoneNumber.replace(/\D/g, '');
                paytm.upiId = `${digits}@paytm`;
            }
        });
    }
    
    next();
});

CompanySettingsSchema.post('save', function(doc) {
    console.log(`🏢 Company settings updated for company ${doc.companyId} (v${doc.version})`);
    console.log(`📱 Active UPI IDs: ${doc.activeUpiIds.length}`);
    console.log(`📞 Active GPay: ${doc.activeGpayNumbers.length}`);
    console.log(`📞 Active PhonePe: ${doc.activePhonePeNumbers.length}`);
    console.log(`📞 Active PayTM: ${doc.activePaytmNumbers.length}`);
    console.log(`📱 QR Code: ${doc.hasActiveQrCode ? '✅' : '❌'}`);
    console.log(`🏦 Active Bank Accounts: ${doc.activeBankAccounts.length}`);
    console.log(`📋 Order flow mode: ${doc.orderFlowMode || 'short'}`);
});

// ==================== EXPORT ====================

const CompanySettings = mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);

export default CompanySettings;