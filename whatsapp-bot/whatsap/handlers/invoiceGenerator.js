// handlers/invoiceGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class InvoiceGenerator {
  constructor() {
    this.companyInfo = {
      name: "PosterPro Store",
      address: "123 Business Street, Mumbai",
      city: "Mumbai, Maharashtra 400001",
      phone: "+91 98765 43210",
      email: "support@posterpro.store",
      website: "www.posterpro.store",
      gstin: "29ABCDE1234F1Z5",
      pan: "ABCDE1234F",
      bank: {
        name: "State Bank of India",
        account: "12345678901",
        ifsc: "SBIN0001234",
        branch: "Mumbai Main Branch"
      }
    };
  }

  async generateInvoicePDF(order, paymentVerification = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        this.addHeader(doc);
        
        // Invoice Info
        this.addInvoiceInfo(doc, order, paymentVerification);
        
        // Customer Info
        this.addCustomerInfo(doc, order);
        
        // Order Items
        this.addOrderItems(doc, order);
        
        // Payment Summary
        this.addPaymentSummary(doc, order, paymentVerification);
        
        // Terms and Conditions
        this.addTermsAndConditions(doc);
        
        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(doc) {
    // Company Logo and Name
    doc
      .fillColor('#2c5530')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(this.companyInfo.name, 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .text(this.companyInfo.address, 50, 80)
      .text(this.companyInfo.city, 50, 95)
      .text(`Phone: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`, 50, 110)
      .text(`GSTIN: ${this.companyInfo.gstin} | PAN: ${this.companyInfo.pan}`, 50, 125);

    // Invoice Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('TAX INVOICE', 400, 50, { align: 'right' })
      .moveDown();
  }

  addInvoiceInfo(doc, order, paymentVerification) {
    const invoiceNumber = paymentVerification?.invoiceNumber || `INV-${order.orderNumber}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN');
    
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Invoice Number:', 400, 100, { continued: true })
      .fillColor('#000000')
      .text(invoiceNumber, { align: 'right' })
      
      .fillColor('#666666')
      .text('Invoice Date:', 400, 115, { continued: true })
      .fillColor('#000000')
      .text(invoiceDate, { align: 'right' })
      
      .fillColor('#666666')
      .text('Order Number:', 400, 130, { continued: true })
      .fillColor('#000000')
      .text(order.orderNumber, { align: 'right' })
      
      .fillColor('#666666')
      .text('Order Date:', 400, 145, { continued: true })
      .fillColor('#000000')
      .text(new Date(order.createdAt).toLocaleDateString('en-IN'), { align: 'right' });

    // Line separator
    doc
      .moveTo(50, 170)
      .lineTo(550, 170)
      .strokeColor('#cccccc')
      .lineWidth(1)
      .stroke();
  }

  addCustomerInfo(doc, order) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c5530')
      .text('Bill To:', 50, 190)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(order.shippingAddress?.fullName || 'Customer', 50, 210)
      .text(order.shippingAddress?.address || 'N/A', 50, 225)
      .text(`${order.shippingAddress?.city || ''} ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`, 50, 240)
      .text(`Phone: ${this.formatPhoneNumber(order.phoneNumber)}`, 50, 255)
      .text(`Email: ${order.shippingAddress?.customerEmail || 'N/A'}`, 50, 270);
  }

  addOrderItems(doc, order) {
    let yPosition = 320;

    // Table Header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .rect(50, yPosition, 500, 20)
      .fill('#2c5530')
      .text('Description', 60, yPosition + 5)
      .text('Quantity', 350, yPosition + 5)
      .text('Unit Price', 400, yPosition + 5)
      .text('Amount', 480, yPosition + 5, { align: 'right' });

    yPosition += 25;

    // Items
    doc.font('Helvetica').fillColor('#000000');
    
    order.items.forEach((item, index) => {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      const itemName = item.productName || 'Product';
      const quantity = item.quantity || 1;
      const unitPrice = item.price || 0;
      const total = quantity * unitPrice;

      doc
        .text(itemName, 60, yPosition, { width: 280 })
        .text(quantity.toString(), 350, yPosition)
        .text(`₹${unitPrice.toFixed(2)}`, 400, yPosition)
        .text(`₹${total.toFixed(2)}`, 480, yPosition, { align: 'right' });

      yPosition += 20;
    });

    // Line after items
    doc
      .moveTo(50, yPosition + 5)
      .lineTo(550, yPosition + 5)
      .strokeColor('#cccccc')
      .lineWidth(1)
      .stroke();

    return yPosition + 15;
  }

  addPaymentSummary(doc, order, paymentVerification) {
    let yPosition = 450;

    if (paymentVerification) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Payment Method:', 350, yPosition, { continued: true })
        .fillColor('#000000')
        .text('UPI Payment', { align: 'right' })
        
        .fillColor('#666666')
        .text('Transaction ID:', 350, yPosition + 15, { continued: true })
        .fillColor('#000000')
        .text(paymentVerification.detectedPayment?.transactionId || 'N/A', { align: 'right' })
        
        .fillColor('#666666')
        .text('Payment Date:', 350, yPosition + 30, { continued: true })
        .fillColor('#000000')
        .text(new Date(paymentVerification.detectedPayment?.transactionTime || Date.now()).toLocaleDateString('en-IN'), { align: 'right' });

      yPosition += 50;
    }

    // Amount breakdown
    const subtotal = order.totalPrice || 0;
    const shipping = order.shippingCharge || 0;
    const tax = order.taxAmount || 0;
    const total = subtotal + shipping + tax;

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Subtotal:', 350, yPosition, { continued: true })
      .fillColor('#000000')
      .text(`₹${subtotal.toFixed(2)}`, { align: 'right' })
      
      .fillColor('#666666')
      .text('Shipping:', 350, yPosition + 15, { continued: true })
      .fillColor('#000000')
      .text(`₹${shipping.toFixed(2)}`, { align: 'right' })
      
      .fillColor('#666666')
      .text('Tax (GST):', 350, yPosition + 30, { continued: true })
      .fillColor('#000000')
      .text(`₹${tax.toFixed(2)}`, { align: 'right' });

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c5530')
      .text('Total Amount:', 350, yPosition + 50, { continued: true })
      .text(`₹${total.toFixed(2)}`, { align: 'right' });
  }

  addTermsAndConditions(doc) {
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Terms & Conditions:', 50, 550, { width: 500 })
      .text('• Goods once sold will not be taken back or exchanged.', 60, 565, { width: 480 })
      .text('• All disputes are subject to Mumbai jurisdiction only.', 60, 580, { width: 480 })
      .text('• This is a computer generated invoice.', 60, 595, { width: 480 });
  }

  addFooter(doc) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#999999')
      .text(`Generated on ${new Date().toLocaleString('en-IN')} | ${this.companyInfo.website}`, 50, 750, { align: 'center' });
  }

  formatPhoneNumber(phone) {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phone;
  }

  // Generate invoice number
  generateInvoiceNumber(orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${orderNumber}-${timestamp}`;
  }

  // Save invoice to file (optional)
  async saveInvoiceToFile(pdfBuffer, orderNumber) {
    const invoicesDir = path.join(process.cwd(), 'invoices');
    
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `invoice-${orderNumber}-${Date.now()}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    await fs.promises.writeFile(filePath, pdfBuffer);
    return filePath;
  }
}

export default new InvoiceGenerator();