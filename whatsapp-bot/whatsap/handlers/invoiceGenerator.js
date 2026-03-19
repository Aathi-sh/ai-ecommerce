

// // handlers/invoiceGenerator.js - ENHANCED PROFESSIONAL VERSION WITH API INTEGRATION
// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import CompanyConfig from '../../shared/companyConfig.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class InvoiceGenerator {
//   constructor() {
//     // Initialize with empty data - will be populated from API
//     this.companyInfo = {};
//     this.invoiceSettings = {};
//     this.colors = {
//       primary: '#2c3e50',
//       secondary: '#34495e',
//       accent: '#27ae60',
//       highlight: '#3498db',
//       success: '#27ae60',
//       warning: '#f39c12',
//       danger: '#e74c3c',
//       text: '#2c3e50',
//       textLight: '#7f8c8d',
//       border: '#bdc3c7',
//       background: '#ecf0f1',
//       white: '#ffffff',
//       black: '#000000'
//     };
    
//     // Initialize by fetching settings
//     this.initializeSettings();
//   }

//   /**
//    * Initialize settings from API
//    */
//   async initializeSettings() {
//     try {
//       const settings = await CompanyConfig.getSettings();
//       const invoiceInfo = await CompanyConfig.getInvoiceInfo();
      
//       this.companyInfo = {
//         name: settings.companyName || 'PosterPro Store',
//         legalName: settings.legalName || 'PosterPro Entertainment Private Limited',
//         tagline: settings.tagline || 'Premium Posters & Art Prints',
//         address: settings.address || '123 Business Street, Andheri East',
//         city: settings.city || 'Mumbai, Maharashtra 400001',
//         phone: settings.phone || '+91 98765 43210',
//         email: settings.email || 'support@posterpro.store',
//         website: settings.website || 'www.posterpro.store',
//         gstin: settings.gstin || '27ABCDE1234F1Z5',
//         pan: settings.pan || 'ABCDE1234F',
//         cin: settings.cin || 'U12345MH2023PTC123456',
//         bank: settings.bank || {
//           name: 'State Bank of India',
//           account: '12345678901',
//           ifsc: 'SBIN0001234',
//           branch: 'Andheri East Branch',
//           accountType: 'Current Account'
//         },
//         support: settings.support || {
//           email: 'care@posterpro.store',
//           phone: '+91 98765 43210',
//           hours: 'Mon-Sat, 10:00 AM - 7:00 PM'
//         },
//         logo: settings.logo || null,
//         signature: settings.signature || null,
//         stamp: settings.stamp || null
//       };

//       this.invoiceSettings = settings.invoiceSettings || {
//         prefix: 'INV',
//         separator: '-',
//         dateFormat: 'dd/mm/yyyy',
//         currency: '₹',
//         taxSystem: 'GST',
//         gstBreakdown: true,
//         showCGSTSGST: true,
//         roundAmount: true,
//         paymentTerms: 'Due on receipt',
//         deliveryTerms: '3-5 business days after payment confirmation',
//         warrantyTerms: '7 days replacement for manufacturing defects',
//         refundPolicy: 'No refunds after order processing'
//       };

//       console.log('✅ [InvoiceGenerator] Settings initialized from API');
//     } catch (error) {
//       console.error('❌ [InvoiceGenerator] Failed to initialize settings:', error);
//       this.setDefaultSettings();
//     }
//   }

//   /**
//    * Set default settings (fallback)
//    */
//   setDefaultSettings() {
//     this.companyInfo = {
//       name: 'PosterPro Store',
//       legalName: 'PosterPro Entertainment Private Limited',
//       tagline: 'Premium Posters & Art Prints',
//       address: '123 Business Street, Andheri East',
//       city: 'Mumbai, Maharashtra 400001',
//       phone: '+91 98765 43210',
//       email: 'support@posterpro.store',
//       website: 'www.posterpro.store',
//       gstin: '27ABCDE1234F1Z5',
//       pan: 'ABCDE1234F',
//       cin: 'U12345MH2023PTC123456',
//       bank: {
//         name: 'State Bank of India',
//         account: '12345678901',
//         ifsc: 'SBIN0001234',
//         branch: 'Andheri East Branch',
//         accountType: 'Current Account'
//       },
//       support: {
//         email: 'care@posterpro.store',
//         phone: '+91 98765 43210',
//         hours: 'Mon-Sat, 10:00 AM - 7:00 PM'
//       },
//       logo: null,
//       signature: null,
//       stamp: null
//     };

//     this.invoiceSettings = {
//       prefix: 'INV',
//       separator: '-',
//       dateFormat: 'dd/mm/yyyy',
//       currency: '₹',
//       taxSystem: 'GST',
//       gstBreakdown: true,
//       showCGSTSGST: true,
//       roundAmount: true,
//       paymentTerms: 'Due on receipt',
//       deliveryTerms: '3-5 business days after payment confirmation',
//       warrantyTerms: '7 days replacement for manufacturing defects',
//       refundPolicy: 'No refunds after order processing'
//     };
//   }

//   /**
//    * Refresh settings from API
//    */
//   async refreshSettings() {
//     try {
//       await CompanyConfig.forceRefresh();
//       await this.initializeSettings();
//       console.log('✅ [InvoiceGenerator] Settings refreshed');
//     } catch (error) {
//       console.error('❌ [InvoiceGenerator] Failed to refresh settings:', error);
//     }
//   }

//   async generateInvoicePDF(order, paymentVerification = null) {
//     // Ensure settings are loaded
//     if (!this.companyInfo.name) {
//       await this.initializeSettings();
//     }

//     return new Promise((resolve, reject) => {
//       try {
//         const doc = new PDFDocument({ 
//           margin: 50,
//           size: 'A4',
//           bufferPages: true,
//           info: {
//             Title: `Invoice ${order.orderNumber}`,
//             Author: this.companyInfo.name,
//             Subject: `Tax Invoice for Order ${order.orderNumber}`,
//             Keywords: 'invoice, tax, gst, order',
//             Creator: `${this.companyInfo.name} Invoice System`,
//             Producer: `${this.companyInfo.name} v1.0`
//           }
//         });
        
//         const buffers = [];
        
//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', () => {
//           const pdfData = Buffer.concat(buffers);
//           resolve(pdfData);
//         });

//         // Add decorative border
//         this.addBorder(doc);
        
//         // Header Section
//         this.addHeader(doc);
        
//         // Invoice Title
//         this.addInvoiceTitle(doc, order, paymentVerification);
        
//         // Invoice & Order Details
//         this.addInvoiceDetails(doc, order, paymentVerification);
        
//         // Customer & Shipping Info
//         this.addCustomerInfo(doc, order);
        
//         // Order Items Table
//         const yPosition = this.addOrderItemsTable(doc, order);
        
//         // Payment & GST Summary
//         this.addPaymentSummary(doc, order, paymentVerification, yPosition);
        
//         // Terms & Conditions
//         this.addTermsAndConditions(doc);
        
//         // Bank Details
//         this.addBankDetails(doc);
        
//         // Footer
//         this.addFooter(doc);

//         doc.end();
//       } catch (error) {
//         console.error('❌ Invoice generation error:', error);
//         reject(error);
//       }
//     });
//   }

//   addBorder(doc) {
//     // Add decorative border
//     doc
//       .lineWidth(1)
//       .strokeColor(this.colors.border)
//       .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
//       .stroke();
//   }

//   addHeader(doc) {
//     const pageWidth = doc.page.width - 100;
    
//     // Company Logo Placeholder (if you have a logo)
//     if (this.companyInfo.logo) {
//       try {
//         doc.image(this.companyInfo.logo, 50, 45, { width: 60 });
//       } catch (error) {
//         // Fallback to text if logo not found
//         doc
//           .fillColor(this.colors.primary)
//           .fontSize(28)
//           .font('Helvetica-Bold')
//           .text(this.companyInfo.name, 50, 45);
//       }
//     } else {
//       // Company Name with Styling
//       doc
//         .fillColor(this.colors.primary)
//         .fontSize(28)
//         .font('Helvetica-Bold')
//         .text(this.companyInfo.name, 50, 45);
      
//       doc
//         .fontSize(10)
//         .font('Helvetica')
//         .fillColor(this.colors.textLight)
//         .text(this.companyInfo.tagline, 50, 75);
//     }

//     // Company Details - Right Side
//     doc
//       .fontSize(8)
//       .font('Helvetica')
//       .fillColor(this.colors.text)
//       .text(this.companyInfo.address, 350, 45, { align: 'right', width: 200 })
//       .text(this.companyInfo.city, 350, 60, { align: 'right' })
//       .text(`GSTIN: ${this.companyInfo.gstin}`, 350, 80, { align: 'right' })
//       .text(`PAN: ${this.companyInfo.pan}`, 350, 95, { align: 'right' })
//       .text(`CIN: ${this.companyInfo.cin}`, 350, 110, { align: 'right' })
//       .text(`Phone: ${this.companyInfo.phone}`, 350, 130, { align: 'right' })
//       .text(`Email: ${this.companyInfo.email}`, 350, 145, { align: 'right' })
//       .text(`Website: ${this.companyInfo.website}`, 350, 160, { align: 'right' });

//     // Separator Line
//     doc
//       .moveTo(50, 180)
//       .lineTo(550, 180)
//       .lineWidth(2)
//       .strokeColor(this.colors.primary)
//       .stroke();
//   } //https://jbfq57km-3000.inc1.devtunnels.ms/

//   addInvoiceTitle(doc, order, paymentVerification) {
//     const invoiceNumber = paymentVerification?.invoiceNumber || 
//                          this.generateInvoiceNumber(order.orderNumber);
//     const isGst = order.gstType === 'intra-state' || order.gstType === 'inter-state';
    
//     doc
//       .fontSize(20)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.accent)
//       .text(isGst ? 'TAX INVOICE' : 'COMMERCIAL INVOICE', 50, 200);

//     // Invoice Status Badge
//     doc
//       .fontSize(10)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.white)
//       .rect(450, 195, 100, 20)
//       .fill(this.colors.success)
//       .fillColor(this.colors.white)
//       .text('PAID ✓', 475, 200, { align: 'center', width: 50 });
//   }

//   addInvoiceDetails(doc, order, paymentVerification) {
//     const invoiceNumber = paymentVerification?.invoiceNumber || 
//                          this.generateInvoiceNumber(order.orderNumber);
//     const invoiceDate = new Date().toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//     const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });

//     // Invoice Details Box
//     const startY = 225;
//     const boxWidth = 200;
    
//     // Background for invoice details
//     doc
//       .fillColor(this.colors.background)
//       .rect(350, startY - 5, boxWidth, 80)
//       .fill();

//     doc
//       .fontSize(9)
//       .font('Helvetica')
//       .fillColor(this.colors.textLight)
//       .text('Invoice Number:', 360, startY, { continued: true })
//       .fillColor(this.colors.text)
//       .text(` ${invoiceNumber}`, { align: 'right', width: 160 })
      
//       .fillColor(this.colors.textLight)
//       .text('Invoice Date:', 360, startY + 15, { continued: true })
//       .fillColor(this.colors.text)
//       .text(` ${invoiceDate}`, { align: 'right', width: 160 })
      
//       .fillColor(this.colors.textLight)
//       .text('Order Number:', 360, startY + 30, { continued: true })
//       .fillColor(this.colors.text)
//       .text(` ${order.orderNumber}`, { align: 'right', width: 160 })
      
//       .fillColor(this.colors.textLight)
//       .text('Order Date:', 360, startY + 45, { continued: true })
//       .fillColor(this.colors.text)
//       .text(` ${orderDate}`, { align: 'right', width: 160 })
      
//       .fillColor(this.colors.textLight)
//       .text('Payment Method:', 360, startY + 60, { continued: true })
//       .fillColor(this.colors.text)
//       .text(` ${order.paymentMethod?.toUpperCase() || 'UPI'}`, { align: 'right', width: 160 });
//   }

//   addCustomerInfo(doc, order) {
//     const startY = 320;

//     // Customer Info Box
//     doc
//       .fillColor(this.colors.primary)
//       .fontSize(11)
//       .font('Helvetica-Bold')
//       .text('BILL TO / SHIP TO:', 50, startY);

//     // Customer Details
//     const customerName = order.customerName || 'Valued Customer';
//     const shippingAddress = order.shippingAddress || {};
//     const addressStr = typeof shippingAddress === 'string' 
//       ? shippingAddress 
//       : `${shippingAddress.street || ''}, ${shippingAddress.areaLocality || ''}, ${shippingAddress.cityDistrict || shippingAddress.city || ''}, ${shippingAddress.state || ''}`;
    
//     doc
//       .fontSize(9)
//       .font('Helvetica')
//       .fillColor(this.colors.text)
//       .text(customerName, 50, startY + 20)
//       .text(addressStr, 50, startY + 35, { width: 250 })
//       .text(`Pincode: ${shippingAddress.pincode || order.pincode || 'N/A'}`, 50, startY + 65)
//       .text(`Phone: ${this.formatPhoneNumber(order.phoneNumber)}`, 50, startY + 80)
//       .text(`Email: ${order.customerEmail || order.shippingAddress?.customerEmail || 'N/A'}`, 50, startY + 95);

//     // GST Info if applicable
//     if (order.gstType) {
//       doc
//         .fillColor(this.colors.textLight)
//         .text(`GST Type: ${order.gstType === 'intra-state' ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}`, 50, startY + 115);
//     }
//   }

//   addOrderItemsTable(doc, order) {
//     const startY = 450;
//     let yPosition = startY;

//     // Table Header
//     const columns = [
//       { label: '#', x: 60, width: 30 },
//       { label: 'Description', x: 90, width: 200 },
//       { label: 'HSN/SAC', x: 290, width: 60 },
//       { label: 'Qty', x: 350, width: 40 },
//       { label: 'Unit Price', x: 390, width: 60 },
//       { label: 'Discount', x: 450, width: 40 },
//       { label: 'Amount', x: 490, width: 60 }
//     ];

//     // Table Header Background
//     doc
//       .fillColor(this.colors.primary)
//       .rect(50, yPosition - 5, 500, 25)
//       .fill();

//     // Header Text
//     doc.fontSize(8).font('Helvetica-Bold').fillColor(this.colors.white);
//     columns.forEach(col => {
//       doc.text(col.label, col.x, yPosition, { width: col.width });
//     });

//     yPosition += 25;

//     // Table Rows
//     doc.fontSize(8).font('Helvetica').fillColor(this.colors.text);
    
//     let totalAmount = 0;
//     order.items.forEach((item, index) => {
//       if (yPosition > 700) {
//         doc.addPage();
//         yPosition = 50;
//       }

//       const rowColor = index % 2 === 0 ? this.colors.white : this.colors.background;
//       doc.fillColor(rowColor)
//          .rect(50, yPosition - 3, 500, 20)
//          .fill();

//       const itemName = item.productName || 'Product';
//       const hsnCode = item.hsnCode || order.items?.[0]?.hsnCode || 'NA';
//       const quantity = item.quantity || 1;
//       const unitPrice = item.price || 0;
//       const discount = item.discountPrice && item.mrp ? 
//                       (item.mrp - item.discountPrice) * quantity : 0;
//       const amount = quantity * unitPrice;

//       doc
//         .fillColor(this.colors.text)
//         .text((index + 1).toString(), 60, yPosition)
//         .text(itemName, 90, yPosition, { width: 190 })
//         .text(hsnCode, 290, yPosition)
//         .text(quantity.toString(), 350, yPosition)
//         .text(`${this.invoiceSettings.currency}${unitPrice.toFixed(2)}`, 390, yPosition)
//         .text(discount > 0 ? `-${this.invoiceSettings.currency}${discount.toFixed(0)}` : '-', 450, yPosition)
//         .text(`${this.invoiceSettings.currency}${amount.toFixed(2)}`, 490, yPosition, { align: 'right' });

//       yPosition += 20;
//       totalAmount += amount;
//     });

//     // Table Footer - Summary Line
//     yPosition += 5;
//     doc
//       .moveTo(50, yPosition)
//       .lineTo(550, yPosition)
//       .lineWidth(1)
//       .strokeColor(this.colors.border)
//       .stroke();

//     return yPosition + 10;
//   }

//   addPaymentSummary(doc, order, paymentVerification, yPosition) {
//     const startY = yPosition;

//     // Calculate amounts
//     const subtotal = order.subtotal || order.totalPrice || 0;
//     const shippingCharge = order.shippingCharge || 0;
//     const totalGst = order.totalGst || 0;
//     const totalDiscount = order.totalDiscount || 0;
//     const paidAmount = order.paidAmount || subtotal + shippingCharge + totalGst;
//     const balanceAmount = order.balanceAmount || 0;
//     const total = subtotal + shippingCharge + totalGst;

//     // Payment Summary Box
//     doc
//       .fillColor(this.colors.background)
//       .rect(350, startY, 200, totalGst > 0 ? 140 : 100)
//       .fill();

//     let currentY = startY + 10;

//     // Summary Items
//     doc.fontSize(8).font('Helvetica');
    
//     this.addSummaryRow(doc, 'Subtotal:', `${this.invoiceSettings.currency}${subtotal.toFixed(2)}`, 360, currentY);
//     currentY += 15;

//     if (totalDiscount > 0) {
//       this.addSummaryRow(doc, 'Discount:', `-${this.invoiceSettings.currency}${totalDiscount.toFixed(2)}`, 360, currentY, this.colors.success);
//       currentY += 15;
//     }

//     if (shippingCharge > 0) {
//       this.addSummaryRow(doc, 'Shipping:', `${this.invoiceSettings.currency}${shippingCharge.toFixed(2)}`, 360, currentY);
//       currentY += 15;
//     }

//     // GST Breakdown
//     if (totalGst > 0) {
//       this.addSummaryRow(doc, 'GST Total:', `${this.invoiceSettings.currency}${totalGst.toFixed(2)}`, 360, currentY, this.colors.highlight);
//       currentY += 15;

//       if (order.gstType === 'intra-state' && this.invoiceSettings.showCGSTSGST) {
//         const cgst = totalGst / 2;
//         const sgst = totalGst / 2;
//         doc
//           .fillColor(this.colors.textLight)
//           .text('  CGST (9%):', 370, currentY)
//           .text(`${this.invoiceSettings.currency}${cgst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
//         currentY += 12;
//         doc
//           .text('  SGST (9%):', 370, currentY)
//           .text(`${this.invoiceSettings.currency}${sgst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
//         currentY += 12;
//       } else if (order.gstType === 'inter-state') {
//         doc
//           .fillColor(this.colors.textLight)
//           .text('  IGST (18%):', 370, currentY)
//           .text(`${this.invoiceSettings.currency}${totalGst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
//         currentY += 12;
//       }
//     }

//     // Separator
//     doc
//       .moveTo(360, currentY - 2)
//       .lineTo(530, currentY - 2)
//       .strokeColor(this.colors.border)
//       .stroke();

//     // Grand Total
//     doc
//       .fontSize(10)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.accent)
//       .text('GRAND TOTAL:', 360, currentY + 5)
//       .text(`${this.invoiceSettings.currency}${total.toFixed(2)}`, 500, currentY + 5, { align: 'right' });

//     currentY += 20;

//     // Payment Status
//     if (paidAmount >= total) {
//       doc
//         .fontSize(8)
//         .font('Helvetica')
//         .fillColor(this.colors.success)
//         .text('✓ Fully Paid', 360, currentY);
//     } else if (paidAmount > 0) {
//       doc
//         .fontSize(8)
//         .font('Helvetica')
//         .fillColor(this.colors.warning)
//         .text(`⏳ Partial Paid: ${this.invoiceSettings.currency}${paidAmount.toFixed(2)}`, 360, currentY)
//         .text(`Balance Due: ${this.invoiceSettings.currency}${balanceAmount.toFixed(2)}`, 360, currentY + 12);
//     }

//     // Payment Verification Details
//     if (paymentVerification) {
//       currentY += 25;
//       doc
//         .fontSize(7)
//         .font('Helvetica')
//         .fillColor(this.colors.textLight)
//         .text(`Transaction ID: ${paymentVerification.detectedPayment?.transactionId || 'N/A'}`, 360, currentY)
//         .text(`Payment Time: ${new Date(paymentVerification.detectedPayment?.transactionTime || Date.now()).toLocaleString('en-IN')}`, 360, currentY + 10);
//     }

//     return currentY + 30;
//   }

//   addSummaryRow(doc, label, value, x, y, color = this.colors.text) {
//     doc
//       .fontSize(8)
//       .font('Helvetica')
//       .fillColor(this.colors.textLight)
//       .text(label, x, y)
//       .fillColor(color)
//       .text(value, x + 140, y, { align: 'right', width: 40 });
//   }

//   addTermsAndConditions(doc) {
//     const startY = 580;

//     doc
//       .fontSize(9)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.primary)
//       .text('Terms & Conditions:', 50, startY);

//     doc
//       .fontSize(7)
//       .font('Helvetica')
//       .fillColor(this.colors.textLight)
//       .text(`1. ${this.invoiceSettings.deliveryTerms}`, 50, startY + 15, { width: 250 })
//       .text(`2. ${this.invoiceSettings.warrantyTerms}`, 50, startY + 27, { width: 250 })
//       .text(`3. ${this.invoiceSettings.refundPolicy}`, 50, startY + 39, { width: 250 })
//       .text('4. This is a computer generated invoice, no signature required.', 50, startY + 51, { width: 250 })
//       .text(`5. All disputes are subject to ${this.companyInfo.city.split(',')[0] || 'Mumbai'} jurisdiction only.`, 50, startY + 63, { width: 250 });

//     // Support Information
//     doc
//       .fontSize(8)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.primary)
//       .text('Customer Support:', 350, startY);

//     doc
//       .fontSize(7)
//       .font('Helvetica')
//       .fillColor(this.colors.textLight)
//       .text(`Email: ${this.companyInfo.support.email}`, 350, startY + 15)
//       .text(`Phone: ${this.companyInfo.support.phone}`, 350, startY + 27)
//       .text(`Hours: ${this.companyInfo.support.hours}`, 350, startY + 39);
//   }

//   addBankDetails(doc) {
//     const startY = 660;

//     // Bank Details Section
//     doc
//       .fontSize(9)
//       .font('Helvetica-Bold')
//       .fillColor(this.colors.primary)
//       .text('Bank Details:', 50, startY);

//     doc
//       .fontSize(7)
//       .font('Helvetica')
//       .fillColor(this.colors.textLight)
//       .text(`Bank: ${this.companyInfo.bank.name}`, 50, startY + 15)
//       .text(`Account No: ${this.companyInfo.bank.account}`, 50, startY + 27)
//       .text(`IFSC Code: ${this.companyInfo.bank.ifsc}`, 50, startY + 39)
//       .text(`Branch: ${this.companyInfo.bank.branch}`, 50, startY + 51)
//       .text(`Account Type: ${this.companyInfo.bank.accountType}`, 50, startY + 63);

//     // Digital Signature Placeholder
//     if (this.companyInfo.signature) {
//       try {
//         doc.image(this.companyInfo.signature, 400, startY + 15, { width: 100 });
//       } catch (error) {
//         doc
//           .fontSize(8)
//           .font('Helvetica')
//           .fillColor(this.colors.primary)
//           .text(`For ${this.companyInfo.name}`, 400, startY + 15)
//           .text('(Authorized Signatory)', 400, startY + 30);
//       }
//     } else {
//       doc
//         .fontSize(8)
//         .font('Helvetica')
//         .fillColor(this.colors.primary)
//         .text(`For ${this.companyInfo.name}`, 400, startY + 15)
//         .text('(Authorized Signatory)', 400, startY + 30);
//     }

//     // Company Stamp Placeholder
//     if (this.companyInfo.stamp) {
//       try {
//         doc.image(this.companyInfo.stamp, 450, startY + 40, { width: 50 });
//       } catch (error) {
//         // Skip stamp
//       }
//     }
//   }

//   addFooter(doc) {
//     const pageCount = doc.bufferedPageRange().count;
    
//     for (let i = 0; i < pageCount; i++) {
//       doc.switchToPage(i);

//       // Footer Line
//       doc
//         .moveTo(50, doc.page.height - 50)
//         .lineTo(550, doc.page.height - 50)
//         .lineWidth(1)
//         .strokeColor(this.colors.border)
//         .stroke();

//       // Footer Text
//       doc
//         .fontSize(7)
//         .font('Helvetica')
//         .fillColor(this.colors.textLight)
//         .text(
//           `Invoice generated on ${new Date().toLocaleString('en-IN')} | ${this.companyInfo.website} | Page ${i + 1} of ${pageCount}`,
//           50,
//           doc.page.height - 40,
//           { align: 'center', width: 500 }
//         );

//       // QR Code Placeholder (optional)
//       doc
//         .fontSize(6)
//         .text('Scan to verify', 480, doc.page.height - 60, { width: 100, align: 'center' });
//     }
//   }

//   generateInvoiceNumber(orderNumber) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
//     return `${this.invoiceSettings.prefix}${this.invoiceSettings.separator}${year}${month}${day}${this.invoiceSettings.separator}${orderNumber.slice(-6)}${this.invoiceSettings.separator}${random}`;
//   }

//   formatPhoneNumber(phone) {
//     if (!phone) return 'N/A';
//     const cleaned = phone.replace(/\D/g, '');
//     if (cleaned.length === 10) {
//       return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
//     }
//     return phone;
//   }

//   async saveInvoiceToFile(pdfBuffer, orderNumber) {
//     try {
//       const invoicesDir = path.join(process.cwd(), 'invoices');
      
//       if (!fs.existsSync(invoicesDir)) {
//         fs.mkdirSync(invoicesDir, { recursive: true });
//       }

//       const fileName = `invoice-${orderNumber}-${Date.now()}.pdf`;
//       const filePath = path.join(invoicesDir, fileName);

//       await fs.promises.writeFile(filePath, pdfBuffer);
      
//       console.log(`✅ Invoice saved: ${filePath}`);
//       return {
//         path: filePath,
//         fileName: fileName,
//         url: `/invoices/${fileName}` // If serving static files
//       };
//     } catch (error) {
//       console.error('❌ Error saving invoice:', error);
//       throw error;
//     }
//   }

//   // Generate invoice HTML for email (optional)
//   generateInvoiceHTML(order, paymentVerification) {
//     const invoiceNumber = paymentVerification?.invoiceNumber || 
//                          this.generateInvoiceNumber(order.orderNumber);
//     const total = order.totalPrice || 0;

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; }
//           .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
//           .header { text-align: center; margin-bottom: 20px; }
//           .company-name { color: #2c3e50; font-size: 24px; font-weight: bold; }
//           .invoice-title { color: #27ae60; font-size: 20px; margin: 20px 0; }
//           table { width: 100%; border-collapse: collapse; }
//           th { background: #2c3e50; color: white; padding: 10px; }
//           td { padding: 10px; border-bottom: 1px solid #ddd; }
//           .total { font-weight: bold; color: #27ae60; }
//           .footer { margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 12px; }
//         </style>
//       </head>
//       <body>
//         <div class="invoice-box">
//           <div class="header">
//             <div class="company-name">${this.companyInfo.name}</div>
//             <div>${this.companyInfo.address}, ${this.companyInfo.city}</div>
//             <div>GST: ${this.companyInfo.gstin}</div>
//           </div>
//           <div class="invoice-title">INVOICE #${invoiceNumber}</div>
//           <p><strong>Order Number:</strong> ${order.orderNumber}</p>
//           <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
//           <p><strong>Customer:</strong> ${order.customerName}</p>
//           <h3>Order Items</h3>
//           <table>
//             <tr>
//               <th>Product</th>
//               <th>Qty</th>
//               <th>Price</th>
//               <th>Total</th>
//             </tr>
//             ${order.items.map(item => `
//               <tr>
//                 <td>${item.productName}</td>
//                 <td>${item.quantity}</td>
//                 <td>${this.invoiceSettings.currency}${item.price}</td>
//                 <td>${this.invoiceSettings.currency}${item.quantity * item.price}</td>
//               </tr>
//             `).join('')}
//           </table>
//           <h3 class="total">Total: ${this.invoiceSettings.currency}${total}</h3>
//           <div class="footer">
//             <p>Thank you for shopping with us!</p>
//             <p>For any queries, contact: ${this.companyInfo.support.email}</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   /**
//    * Get current settings status
//    */
//   getStatus() {
//     return {
//       companyName: this.companyInfo.name,
//       hasLogo: !!this.companyInfo.logo,
//       hasSignature: !!this.companyInfo.signature,
//       hasStamp: !!this.companyInfo.stamp,
//       invoicePrefix: this.invoiceSettings.prefix,
//       currency: this.invoiceSettings.currency
//     };
//   }
// }

// // Create and export a single instance
// const invoiceGenerator = new InvoiceGenerator();

// // Initialize on creation
// invoiceGenerator.initializeSettings().catch(console.error);

// export default invoiceGenerator;




































// handlers/invoiceGenerator.js - PROFESSIONAL MULTI-TENANT VERSION
// Generates PDF and text invoices with company-specific branding

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CompanyConfig from '../../shared/companyConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceGenerator {
  constructor() {
    // Initialize with empty data - will be populated from API per company
    this.companyInfo = {};
    this.invoiceSettings = {};
    this.colors = {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#27ae60',
      highlight: '#3498db',
      success: '#27ae60',
      warning: '#f39c12',
      danger: '#e74c3c',
      text: '#2c3e50',
      textLight: '#7f8c8d',
      border: '#bdc3c7',
      background: '#ecf0f1',
      white: '#ffffff',
      black: '#000000'
    };
    
    // Company-specific cache
    this.companyCache = new Map();
  }

  /**
   * Initialize settings from API for a specific company
   * @param {string} companyId - Company ID for multi-tenant isolation
   */
  async initializeSettings(companyId) {
    try {
      // Check cache first
      if (this.companyCache.has(companyId)) {
        const cached = this.companyCache.get(companyId);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          this.companyInfo = cached.companyInfo;
          this.invoiceSettings = cached.invoiceSettings;
          console.log(`📦 [InvoiceGenerator] Using cached settings for company: ${companyId}`);
          return;
        }
      }

      console.log(`🔄 [InvoiceGenerator] Fetching settings for company: ${companyId}`);
      
      const settings = await CompanyConfig.getSettings(companyId);
      const invoiceInfo = await CompanyConfig.getInvoiceInfo(companyId);
      
      this.companyInfo = {
        name: settings.companyName || 'PosterPro Store',
        legalName: settings.legalName || 'PosterPro Entertainment Private Limited',
        tagline: settings.tagline || 'Premium Posters & Art Prints',
        address: settings.address || '123 Business Street, Andheri East',
        city: settings.city || 'Mumbai, Maharashtra 400001',
        phone: settings.phone || '+91 98765 43210',
        email: settings.email || 'support@posterpro.store',
        website: settings.website || 'www.posterpro.store',
        gstin: settings.gstin || '27ABCDE1234F1Z5',
        pan: settings.pan || 'ABCDE1234F',
        cin: settings.cin || 'U12345MH2023PTC123456',
        bank: settings.bank || {
          name: 'State Bank of India',
          account: '12345678901',
          ifsc: 'SBIN0001234',
          branch: 'Andheri East Branch',
          accountType: 'Current Account'
        },
        support: settings.support || {
          email: 'care@posterpro.store',
          phone: '+91 98765 43210',
          hours: 'Mon-Sat, 10:00 AM - 7:00 PM'
        },
        logo: settings.logo || null,
        signature: settings.signature || null,
        stamp: settings.stamp || null
      };

      this.invoiceSettings = settings.invoiceSettings || {
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
      };

      // Cache the settings
      this.companyCache.set(companyId, {
        companyInfo: { ...this.companyInfo },
        invoiceSettings: { ...this.invoiceSettings },
        timestamp: Date.now()
      });

      console.log(`✅ [InvoiceGenerator] Settings initialized for company: ${companyId}`);
    } catch (error) {
      console.error(`❌ [InvoiceGenerator] Failed to initialize settings for company ${companyId}:`, error);
      this.setDefaultSettings(companyId);
    }
  }

  /**
   * Set default settings (fallback) for a company
   * @param {string} companyId - Company ID
   */
  setDefaultSettings(companyId) {
    this.companyInfo = {
      name: 'PosterPro Store',
      legalName: 'PosterPro Entertainment Private Limited',
      tagline: 'Premium Posters & Art Prints',
      address: '123 Business Street, Andheri East',
      city: 'Mumbai, Maharashtra 400001',
      phone: '+91 98765 43210',
      email: 'support@posterpro.store',
      website: 'www.posterpro.store',
      gstin: '27ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      cin: 'U12345MH2023PTC123456',
      bank: {
        name: 'State Bank of India',
        account: '12345678901',
        ifsc: 'SBIN0001234',
        branch: 'Andheri East Branch',
        accountType: 'Current Account'
      },
      support: {
        email: 'care@posterpro.store',
        phone: '+91 98765 43210',
        hours: 'Mon-Sat, 10:00 AM - 7:00 PM'
      },
      logo: null,
      signature: null,
      stamp: null
    };

    this.invoiceSettings = {
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
    };

    // Cache the default settings
    this.companyCache.set(companyId, {
      companyInfo: { ...this.companyInfo },
      invoiceSettings: { ...this.invoiceSettings },
      timestamp: Date.now()
    });
  }

  /**
   * Refresh settings for a company
   * @param {string} companyId - Company ID
   */
  async refreshSettings(companyId) {
    try {
      // Clear cache for this company
      this.companyCache.delete(companyId);
      await this.initializeSettings(companyId);
      console.log(`✅ [InvoiceGenerator] Settings refreshed for company: ${companyId}`);
    } catch (error) {
      console.error(`❌ [InvoiceGenerator] Failed to refresh settings for company ${companyId}:`, error);
    }
  }

  /**
   * Generate PDF invoice for an order
   * @param {Object} order - Order object
   * @param {Object} paymentVerification - Payment verification object (optional)
   * @param {string} companyId - Company ID for multi-tenant isolation
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateInvoicePDF(order, paymentVerification = null, companyId = null) {
    // Ensure settings are loaded for this company
    await this.initializeSettings(companyId);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          bufferPages: true,
          info: {
            Title: `Invoice ${order.orderNumber}`,
            Author: this.companyInfo.name,
            Subject: `Tax Invoice for Order ${order.orderNumber}`,
            Keywords: 'invoice, tax, gst, order',
            Creator: `${this.companyInfo.name} Invoice System`,
            Producer: `${this.companyInfo.name} v1.0`
          }
        });
        
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add decorative border
        this.addBorder(doc);
        
        // Header Section
        this.addHeader(doc);
        
        // Invoice Title
        this.addInvoiceTitle(doc, order, paymentVerification);
        
        // Invoice & Order Details
        this.addInvoiceDetails(doc, order, paymentVerification);
        
        // Customer & Shipping Info
        this.addCustomerInfo(doc, order);
        
        // Order Items Table
        const yPosition = this.addOrderItemsTable(doc, order);
        
        // Payment & GST Summary
        this.addPaymentSummary(doc, order, paymentVerification, yPosition);
        
        // Terms & Conditions
        this.addTermsAndConditions(doc);
        
        // Bank Details
        this.addBankDetails(doc);
        
        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        console.error('❌ Invoice generation error:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate text invoice (for WhatsApp fallback) - FIXED to be well-formatted
   * @param {Object} order - Order object
   * @param {string} companyId - Company ID for multi-tenant isolation
   * @returns {string} Formatted text invoice
   */
  async generateTextInvoice(order, companyId = null) {
    // Ensure settings are loaded for this company
    await this.initializeSettings(companyId);

    try {
      const items = order.items?.map(item => ({
        name: item.productName || 'Product',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      })) || [];

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const gst = order.totalGst || 0;
      const shipping = order.shippingCharge || 0;
      const total = order.totalPrice || subtotal + gst + shipping;

      const invoiceNumber = this.generateInvoiceNumber(order.orderNumber);
      const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // FIXED: Properly formatted text invoice with boxes and alignment
      let invoiceText = 
        `╔════════════════════════════════════════════════════════════╗\n` +
        `║                    ${this.companyInfo.name.padEnd(42)} ║\n` +
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ INVOICE #${invoiceNumber.padEnd(44)} ║\n` +
        `║ Date: ${date.padEnd(49)} ║\n` +
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ Customer: ${order.customerName?.padEnd(46) || 'Valued Customer'.padEnd(46)} ║\n` +
        `║ Phone: ${this.formatPhoneNumber(order.phoneNumber)?.padEnd(48) || 'N/A'.padEnd(48)} ║\n` +
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ ITEMS:                                                    ║\n`;

      // Add each item
      items.forEach((item, index) => {
        const itemLine = `${index + 1}. ${item.name}`;
        invoiceText += `║ ${itemLine.padEnd(57)} ║\n`;
        invoiceText += `║    Qty: ${item.quantity} x ${this.invoiceSettings.currency}${item.price.toFixed(2)} = ${this.invoiceSettings.currency}${item.total.toFixed(2)}${''.padEnd(22)} ║\n`;
      });

      invoiceText += 
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ SUBTOTAL:${''.padEnd(20)} ${this.invoiceSettings.currency}${subtotal.toFixed(2).padStart(12)} ║\n`;

      if (gst > 0) {
        invoiceText += `║ GST:${''.padEnd(25)} ${this.invoiceSettings.currency}${gst.toFixed(2).padStart(12)} ║\n`;
      }

      if (shipping > 0) {
        invoiceText += `║ SHIPPING:${''.padEnd(20)} ${this.invoiceSettings.currency}${shipping.toFixed(2).padStart(12)} ║\n`;
      }

      invoiceText += 
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ TOTAL:${''.padEnd(23)} ${this.invoiceSettings.currency}${total.toFixed(2).padStart(12)} ║\n` +
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ PAYMENT STATUS: PAID ✓                                     ║\n`;

      if (order.transactionId) {
        invoiceText += `║ Transaction ID: ${order.transactionId.padEnd(40)} ║\n`;
      }

      invoiceText += 
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ DELIVERY ADDRESS:                                          ║\n`;

      // Format address
      let addressStr = '';
      if (order.shippingAddress) {
        if (typeof order.shippingAddress === 'string') {
          addressStr = order.shippingAddress;
        } else {
          const addr = order.shippingAddress;
          addressStr = `${addr.street || ''}, ${addr.areaLocality || ''}, ${addr.cityDistrict || addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.replace(/^, |, $/g, '');
        }
      }

      // Split address into multiple lines if needed
      const addressLines = this.wrapText(addressStr, 50);
      addressLines.forEach(line => {
        invoiceText += `║ ${line.padEnd(57)} ║\n`;
      });

      invoiceText += 
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ TERMS & CONDITIONS:                                        ║\n` +
        `║ • ${this.invoiceSettings.deliveryTerms.substring(0, 50).padEnd(52)} ║\n` +
        `║ • ${this.invoiceSettings.warrantyTerms.substring(0, 50).padEnd(52)} ║\n` +
        `║ • ${this.invoiceSettings.refundPolicy.substring(0, 50).padEnd(52)} ║\n` +
        `╠════════════════════════════════════════════════════════════╣\n` +
        `║ Thank you for shopping with us!                            ║\n` +
        `║ For queries: ${this.companyInfo.support.email.padEnd(36)} ║\n` +
        `╚════════════════════════════════════════════════════════════╝`;

      return invoiceText;

    } catch (error) {
      console.error('❌ Text invoice generation error:', error);
      
      // Fallback simple invoice
      const total = order.totalPrice || 0;
      return `🧾 *INVOICE - Order #${order.orderNumber}*\n\n` +
             `Thank you for your purchase!\n` +
             `Total Amount: ${this.invoiceSettings.currency}${total.toFixed(2)}\n\n` +
             `For any queries, please contact support.`;
    }
  }

  /**
   * Helper function to wrap text into lines
   * @param {string} text - Text to wrap
   * @param {number} maxLength - Maximum line length
   * @returns {Array} Array of lines
   */
  wrapText(text, maxLength) {
    if (!text) return [''];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return lines;
  }

  addBorder(doc) {
    // Add decorative border
    doc
      .lineWidth(1)
      .strokeColor(this.colors.border)
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .stroke();
  }

  addHeader(doc) {
    const pageWidth = doc.page.width - 100;
    
    // Company Logo Placeholder (if you have a logo)
    if (this.companyInfo.logo) {
      try {
        doc.image(this.companyInfo.logo, 50, 45, { width: 60 });
      } catch (error) {
        // Fallback to text if logo not found
        doc
          .fillColor(this.colors.primary)
          .fontSize(28)
          .font('Helvetica-Bold')
          .text(this.companyInfo.name, 50, 45);
      }
    } else {
      // Company Name with Styling
      doc
        .fillColor(this.colors.primary)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text(this.companyInfo.name, 50, 45);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(this.colors.textLight)
        .text(this.companyInfo.tagline, 50, 75);
    }

    // Company Details - Right Side
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.text)
      .text(this.companyInfo.address, 350, 45, { align: 'right', width: 200 })
      .text(this.companyInfo.city, 350, 60, { align: 'right' })
      .text(`GSTIN: ${this.companyInfo.gstin}`, 350, 80, { align: 'right' })
      .text(`PAN: ${this.companyInfo.pan}`, 350, 95, { align: 'right' })
      .text(`CIN: ${this.companyInfo.cin}`, 350, 110, { align: 'right' })
      .text(`Phone: ${this.companyInfo.phone}`, 350, 130, { align: 'right' })
      .text(`Email: ${this.companyInfo.email}`, 350, 145, { align: 'right' })
      .text(`Website: ${this.companyInfo.website}`, 350, 160, { align: 'right' });

    // Separator Line
    doc
      .moveTo(50, 180)
      .lineTo(550, 180)
      .lineWidth(2)
      .strokeColor(this.colors.primary)
      .stroke();
  }

  addInvoiceTitle(doc, order, paymentVerification) {
    const invoiceNumber = paymentVerification?.invoiceNumber || 
                         this.generateInvoiceNumber(order.orderNumber);
    const isGst = order.gstType === 'intra-state' || order.gstType === 'inter-state';
    
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(this.colors.accent)
      .text(isGst ? 'TAX INVOICE' : 'COMMERCIAL INVOICE', 50, 200);

    // Invoice Status Badge
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.colors.white)
      .rect(450, 195, 100, 20)
      .fill(this.colors.success)
      .fillColor(this.colors.white)
      .text('PAID ✓', 475, 200, { align: 'center', width: 50 });
  }

  addInvoiceDetails(doc, order, paymentVerification) {
    const invoiceNumber = paymentVerification?.invoiceNumber || 
                         this.generateInvoiceNumber(order.orderNumber);
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Invoice Details Box
    const startY = 225;
    const boxWidth = 200;
    
    // Background for invoice details
    doc
      .fillColor(this.colors.background)
      .rect(350, startY - 5, boxWidth, 80)
      .fill();

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text('Invoice Number:', 360, startY, { continued: true })
      .fillColor(this.colors.text)
      .text(` ${invoiceNumber}`, { align: 'right', width: 160 })
      
      .fillColor(this.colors.textLight)
      .text('Invoice Date:', 360, startY + 15, { continued: true })
      .fillColor(this.colors.text)
      .text(` ${invoiceDate}`, { align: 'right', width: 160 })
      
      .fillColor(this.colors.textLight)
      .text('Order Number:', 360, startY + 30, { continued: true })
      .fillColor(this.colors.text)
      .text(` ${order.orderNumber}`, { align: 'right', width: 160 })
      
      .fillColor(this.colors.textLight)
      .text('Order Date:', 360, startY + 45, { continued: true })
      .fillColor(this.colors.text)
      .text(` ${orderDate}`, { align: 'right', width: 160 })
      
      .fillColor(this.colors.textLight)
      .text('Payment Method:', 360, startY + 60, { continued: true })
      .fillColor(this.colors.text)
      .text(` ${order.paymentMethod?.toUpperCase() || 'UPI'}`, { align: 'right', width: 160 });
  }

  addCustomerInfo(doc, order) {
    const startY = 320;

    // Customer Info Box
    doc
      .fillColor(this.colors.primary)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('BILL TO / SHIP TO:', 50, startY);

    // Customer Details
    const customerName = order.customerName || 'Valued Customer';
    const shippingAddress = order.shippingAddress || {};
    const addressStr = typeof shippingAddress === 'string' 
      ? shippingAddress 
      : `${shippingAddress.street || ''}, ${shippingAddress.areaLocality || ''}, ${shippingAddress.cityDistrict || shippingAddress.city || ''}, ${shippingAddress.state || ''}`;
    
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.colors.text)
      .text(customerName, 50, startY + 20)
      .text(addressStr, 50, startY + 35, { width: 250 })
      .text(`Pincode: ${shippingAddress.pincode || order.pincode || 'N/A'}`, 50, startY + 65)
      .text(`Phone: ${this.formatPhoneNumber(order.phoneNumber)}`, 50, startY + 80)
      .text(`Email: ${order.customerEmail || order.shippingAddress?.customerEmail || 'N/A'}`, 50, startY + 95);

    // GST Info if applicable
    if (order.gstType) {
      doc
        .fillColor(this.colors.textLight)
        .text(`GST Type: ${order.gstType === 'intra-state' ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}`, 50, startY + 115);
    }
  }

  addOrderItemsTable(doc, order) {
    const startY = 450;
    let yPosition = startY;

    // Table Header
    const columns = [
      { label: '#', x: 60, width: 30 },
      { label: 'Description', x: 90, width: 200 },
      { label: 'HSN/SAC', x: 290, width: 60 },
      { label: 'Qty', x: 350, width: 40 },
      { label: 'Unit Price', x: 390, width: 60 },
      { label: 'Discount', x: 450, width: 40 },
      { label: 'Amount', x: 490, width: 60 }
    ];

    // Table Header Background
    doc
      .fillColor(this.colors.primary)
      .rect(50, yPosition - 5, 500, 25)
      .fill();

    // Header Text
    doc.fontSize(8).font('Helvetica-Bold').fillColor(this.colors.white);
    columns.forEach(col => {
      doc.text(col.label, col.x, yPosition, { width: col.width });
    });

    yPosition += 25;

    // Table Rows
    doc.fontSize(8).font('Helvetica').fillColor(this.colors.text);
    
    let totalAmount = 0;
    order.items.forEach((item, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const rowColor = index % 2 === 0 ? this.colors.white : this.colors.background;
      doc.fillColor(rowColor)
         .rect(50, yPosition - 3, 500, 20)
         .fill();

      const itemName = item.productName || 'Product';
      const hsnCode = item.hsnCode || order.items?.[0]?.hsnCode || 'NA';
      const quantity = item.quantity || 1;
      const unitPrice = item.price || 0;
      const discount = item.discountPrice && item.mrp ? 
                      (item.mrp - item.discountPrice) * quantity : 0;
      const amount = quantity * unitPrice;

      doc
        .fillColor(this.colors.text)
        .text((index + 1).toString(), 60, yPosition)
        .text(itemName, 90, yPosition, { width: 190 })
        .text(hsnCode, 290, yPosition)
        .text(quantity.toString(), 350, yPosition)
        .text(`${this.invoiceSettings.currency}${unitPrice.toFixed(2)}`, 390, yPosition)
        .text(discount > 0 ? `-${this.invoiceSettings.currency}${discount.toFixed(0)}` : '-', 450, yPosition)
        .text(`${this.invoiceSettings.currency}${amount.toFixed(2)}`, 490, yPosition, { align: 'right' });

      yPosition += 20;
      totalAmount += amount;
    });

    // Table Footer - Summary Line
    yPosition += 5;
    doc
      .moveTo(50, yPosition)
      .lineTo(550, yPosition)
      .lineWidth(1)
      .strokeColor(this.colors.border)
      .stroke();

    return yPosition + 10;
  }

  addPaymentSummary(doc, order, paymentVerification, yPosition) {
    const startY = yPosition;

    // Calculate amounts
    const subtotal = order.subtotal || order.totalPrice || 0;
    const shippingCharge = order.shippingCharge || 0;
    const totalGst = order.totalGst || 0;
    const totalDiscount = order.totalDiscount || 0;
    const paidAmount = order.paidAmount || subtotal + shippingCharge + totalGst;
    const balanceAmount = order.balanceAmount || 0;
    const total = subtotal + shippingCharge + totalGst;

    // Payment Summary Box
    doc
      .fillColor(this.colors.background)
      .rect(350, startY, 200, totalGst > 0 ? 140 : 100)
      .fill();

    let currentY = startY + 10;

    // Summary Items
    doc.fontSize(8).font('Helvetica');
    
    this.addSummaryRow(doc, 'Subtotal:', `${this.invoiceSettings.currency}${subtotal.toFixed(2)}`, 360, currentY);
    currentY += 15;

    if (totalDiscount > 0) {
      this.addSummaryRow(doc, 'Discount:', `-${this.invoiceSettings.currency}${totalDiscount.toFixed(2)}`, 360, currentY, this.colors.success);
      currentY += 15;
    }

    if (shippingCharge > 0) {
      this.addSummaryRow(doc, 'Shipping:', `${this.invoiceSettings.currency}${shippingCharge.toFixed(2)}`, 360, currentY);
      currentY += 15;
    }

    // GST Breakdown
    if (totalGst > 0) {
      this.addSummaryRow(doc, 'GST Total:', `${this.invoiceSettings.currency}${totalGst.toFixed(2)}`, 360, currentY, this.colors.highlight);
      currentY += 15;

      if (order.gstType === 'intra-state' && this.invoiceSettings.showCGSTSGST) {
        const cgst = totalGst / 2;
        const sgst = totalGst / 2;
        doc
          .fillColor(this.colors.textLight)
          .text('  CGST (9%):', 370, currentY)
          .text(`${this.invoiceSettings.currency}${cgst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
        currentY += 12;
        doc
          .text('  SGST (9%):', 370, currentY)
          .text(`${this.invoiceSettings.currency}${sgst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
        currentY += 12;
      } else if (order.gstType === 'inter-state') {
        doc
          .fillColor(this.colors.textLight)
          .text('  IGST (18%):', 370, currentY)
          .text(`${this.invoiceSettings.currency}${totalGst.toFixed(2)}`, 500, currentY, { align: 'right', width: 40 });
        currentY += 12;
      }
    }

    // Separator
    doc
      .moveTo(360, currentY - 2)
      .lineTo(530, currentY - 2)
      .strokeColor(this.colors.border)
      .stroke();

    // Grand Total
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.colors.accent)
      .text('GRAND TOTAL:', 360, currentY + 5)
      .text(`${this.invoiceSettings.currency}${total.toFixed(2)}`, 500, currentY + 5, { align: 'right' });

    currentY += 20;

    // Payment Status
    if (paidAmount >= total) {
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(this.colors.success)
        .text('✓ Fully Paid', 360, currentY);
    } else if (paidAmount > 0) {
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(this.colors.warning)
        .text(`⏳ Partial Paid: ${this.invoiceSettings.currency}${paidAmount.toFixed(2)}`, 360, currentY)
        .text(`Balance Due: ${this.invoiceSettings.currency}${balanceAmount.toFixed(2)}`, 360, currentY + 12);
    }

    // Payment Verification Details
    if (paymentVerification) {
      currentY += 25;
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(this.colors.textLight)
        .text(`Transaction ID: ${paymentVerification.detectedPayment?.transactionId || 'N/A'}`, 360, currentY)
        .text(`Payment Time: ${new Date(paymentVerification.detectedPayment?.transactionTime || Date.now()).toLocaleString('en-IN')}`, 360, currentY + 10);
    }

    return currentY + 30;
  }

  addSummaryRow(doc, label, value, x, y, color = this.colors.text) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(label, x, y)
      .fillColor(color)
      .text(value, x + 140, y, { align: 'right', width: 40 });
  }

  addTermsAndConditions(doc) {
    const startY = 580;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Terms & Conditions:', 50, startY);

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(`1. ${this.invoiceSettings.deliveryTerms}`, 50, startY + 15, { width: 250 })
      .text(`2. ${this.invoiceSettings.warrantyTerms}`, 50, startY + 27, { width: 250 })
      .text(`3. ${this.invoiceSettings.refundPolicy}`, 50, startY + 39, { width: 250 })
      .text('4. This is a computer generated invoice, no signature required.', 50, startY + 51, { width: 250 })
      .text(`5. All disputes are subject to ${this.companyInfo.city.split(',')[0] || 'Mumbai'} jurisdiction only.`, 50, startY + 63, { width: 250 });

    // Support Information
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Customer Support:', 350, startY);

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(`Email: ${this.companyInfo.support.email}`, 350, startY + 15)
      .text(`Phone: ${this.companyInfo.support.phone}`, 350, startY + 27)
      .text(`Hours: ${this.companyInfo.support.hours}`, 350, startY + 39);
  }

  addBankDetails(doc) {
    const startY = 660;

    // Bank Details Section
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Bank Details:', 50, startY);

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(`Bank: ${this.companyInfo.bank.name}`, 50, startY + 15)
      .text(`Account No: ${this.companyInfo.bank.account}`, 50, startY + 27)
      .text(`IFSC Code: ${this.companyInfo.bank.ifsc}`, 50, startY + 39)
      .text(`Branch: ${this.companyInfo.bank.branch}`, 50, startY + 51)
      .text(`Account Type: ${this.companyInfo.bank.accountType}`, 50, startY + 63);

    // Digital Signature Placeholder
    if (this.companyInfo.signature) {
      try {
        doc.image(this.companyInfo.signature, 400, startY + 15, { width: 100 });
      } catch (error) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(this.colors.primary)
          .text(`For ${this.companyInfo.name}`, 400, startY + 15)
          .text('(Authorized Signatory)', 400, startY + 30);
      }
    } else {
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(this.colors.primary)
        .text(`For ${this.companyInfo.name}`, 400, startY + 15)
        .text('(Authorized Signatory)', 400, startY + 30);
    }

    // Company Stamp Placeholder
    if (this.companyInfo.stamp) {
      try {
        doc.image(this.companyInfo.stamp, 450, startY + 40, { width: 50 });
      } catch (error) {
        // Skip stamp
      }
    }
  }

  addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Footer Line
      doc
        .moveTo(50, doc.page.height - 50)
        .lineTo(550, doc.page.height - 50)
        .lineWidth(1)
        .strokeColor(this.colors.border)
        .stroke();

      // Footer Text
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(this.colors.textLight)
        .text(
          `Invoice generated on ${new Date().toLocaleString('en-IN')} | ${this.companyInfo.website} | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: 500 }
        );

      // QR Code Placeholder (optional)
      doc
        .fontSize(6)
        .text('Scan to verify', 480, doc.page.height - 60, { width: 100, align: 'center' });
    }
  }

  generateInvoiceNumber(orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `${this.invoiceSettings.prefix}${this.invoiceSettings.separator}${year}${month}${day}${this.invoiceSettings.separator}${orderNumber.slice(-6)}${this.invoiceSettings.separator}${random}`;
  }

  formatPhoneNumber(phone) {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  }

  async saveInvoiceToFile(pdfBuffer, orderNumber, companyId = null) {
    try {
      const invoicesDir = path.join(process.cwd(), 'invoices', companyId || 'default');
      
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${orderNumber}-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      await fs.promises.writeFile(filePath, pdfBuffer);
      
      console.log(`✅ Invoice saved: ${filePath}`);
      return {
        path: filePath,
        fileName: fileName,
        url: `/invoices/${companyId || 'default'}/${fileName}` // If serving static files
      };
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      throw error;
    }
  }

  /**
   * Generate invoice HTML for email (optional)
   * @param {Object} order - Order object
   * @param {Object} paymentVerification - Payment verification object
   * @param {string} companyId - Company ID
   * @returns {string} HTML invoice
   */
  async generateInvoiceHTML(order, paymentVerification = null, companyId = null) {
    await this.initializeSettings(companyId);
    
    const invoiceNumber = paymentVerification?.invoiceNumber || 
                         this.generateInvoiceNumber(order.orderNumber);
    const total = order.totalPrice || 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { color: ${this.colors.primary}; font-size: 24px; font-weight: bold; }
          .invoice-title { color: ${this.colors.accent}; font-size: 20px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: ${this.colors.primary}; color: white; padding: 10px; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total { font-weight: bold; color: ${this.colors.accent}; }
          .footer { margin-top: 30px; text-align: center; color: ${this.colors.textLight}; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="company-name">${this.companyInfo.name}</div>
            <div>${this.companyInfo.address}, ${this.companyInfo.city}</div>
            <div>GST: ${this.companyInfo.gstin}</div>
          </div>
          <div class="invoice-title">INVOICE #${invoiceNumber}</div>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <h3>Order Items</h3>
          <table>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${order.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${this.invoiceSettings.currency}${item.price}</td>
                <td>${this.invoiceSettings.currency}${item.quantity * item.price}</td>
              </tr>
            `).join('')}
          </table>
          <h3 class="total">Total: ${this.invoiceSettings.currency}${total.toFixed(2)}</h3>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>For any queries, contact: ${this.companyInfo.support.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get current settings status for a company
   * @param {string} companyId - Company ID
   * @returns {Object} Status object
   */
  async getStatus(companyId = null) {
    await this.initializeSettings(companyId);
    
    return {
      companyName: this.companyInfo.name,
      hasLogo: !!this.companyInfo.logo,
      hasSignature: !!this.companyInfo.signature,
      hasStamp: !!this.companyInfo.stamp,
      invoicePrefix: this.invoiceSettings.prefix,
      currency: this.invoiceSettings.currency,
      companyId: companyId
    };
  }

  /**
   * Clear cache for a company
   * @param {string} companyId - Company ID
   */
  clearCache(companyId) {
    if (companyId) {
      this.companyCache.delete(companyId);
      console.log(`🗑️ [InvoiceGenerator] Cleared cache for company: ${companyId}`);
    } else {
      this.companyCache.clear();
      console.log(`🗑️ [InvoiceGenerator] Cleared all company caches`);
    }
  }
}

// Create and export a single instance
const invoiceGenerator = new InvoiceGenerator();

export default invoiceGenerator;
