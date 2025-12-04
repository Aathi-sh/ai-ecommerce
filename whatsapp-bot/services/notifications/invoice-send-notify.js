// services/notifications/invoice-send-notify.js

class InvoiceSendNotification {
  constructor() {
    // Define categories locally to avoid circular dependency
    this.categories = {
      ORDER: 'order',
      PAYMENT: 'payment',
      STOCK: 'stock',
      INVOICE: 'invoice',
      SYSTEM: 'system'
    };

    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    };

    this.category = this.categories.INVOICE;
    console.log('🧾 Invoice Send Notification service initialized');
  }

  /**
   * Lazy load notification service to avoid circular dependency
   */
  async getNotificationService() {
    if (!this.notificationService) {
      // Dynamic import to break circular dependency
      const { default: notificationService } = await import('./notification-service.js');
      this.notificationService = notificationService;
    }
    return this.notificationService;
  }

  /**
   * Send notification when invoice is generated
   */
  async sendInvoiceGeneratedNotification(invoiceData) {
    try {
      console.log('🧾 Invoice generated notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        orderNumber: invoiceData.orderNumber
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '🧾 Invoice Generated',
        body: `Invoice #${invoiceData.invoiceNumber} has been generated for Order #${invoiceData.orderNumber}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: invoiceData.invoiceNumber || invoiceData.orderNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber || invoiceData.orderNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerName: invoiceData.customerName || 'Customer',
          amount: invoiceData.totalAmount,
          generatedAt: new Date().toISOString(),
          status: 'generated',
          downloadUrl: invoiceData.downloadUrl || '',
          viewUrl: invoiceData.viewUrl || ''
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_generated',
        recipientPhone: invoiceData.customerPhone,
        orderNumber: invoiceData.orderNumber
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending invoice generated notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when invoice is sent to customer
   */
  async sendInvoiceSentToCustomerNotification(invoiceData, sentVia = 'whatsapp') {
    try {
      console.log('📤 Invoice sent to customer notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        customerPhone: invoiceData.customerPhone,
        sentVia
      });

      const notificationService = await this.getNotificationService();

      const channelEmoji = {
        'whatsapp': '📱',
        'email': '📧',
        'sms': '💬',
        'app': '📲'
      };

      const channelText = {
        'whatsapp': 'WhatsApp',
        'email': 'Email',
        'sms': 'SMS',
        'app': 'Mobile App'
      };

      const emoji = channelEmoji[sentVia] || '📄';
      const channel = channelText[sentVia] || sentVia;

      // Send to admin
      const adminNotification = await notificationService.sendAdminNotification(
        `${emoji} Invoice Sent via ${channel}`,
        `Invoice #${invoiceData.invoiceNumber} sent to customer. Order #${invoiceData.orderNumber}`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: invoiceData.invoiceNumber || invoiceData.orderNumber,
          actionUrl: `/admin/invoices/${invoiceData.invoiceNumber || invoiceData.orderNumber}`,
          extraData: {
            invoiceNumber: invoiceData.invoiceNumber,
            orderNumber: invoiceData.orderNumber,
            customerPhone: invoiceData.customerPhone,
            sentVia,
            sentAt: new Date().toISOString(),
            amount: invoiceData.totalAmount,
            deliveryStatus: 'sent'
          }
        }
      );

      // Send to customer (if they have the app)
      const customerNotification = await notificationService.sendCustomerNotification(
        invoiceData.customerPhone,
        '📄 Your Invoice is Ready!',
        `Invoice #${invoiceData.invoiceNumber} for your order has been generated. Amount: ₹${invoiceData.totalAmount}`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: invoiceData.orderNumber,
          actionUrl: `/invoices/${invoiceData.invoiceNumber || invoiceData.orderNumber}`,
          extraData: {
            invoiceNumber: invoiceData.invoiceNumber,
            orderNumber: invoiceData.orderNumber,
            amount: invoiceData.totalAmount,
            date: invoiceData.date || new Date().toISOString().split('T')[0],
            downloadUrl: invoiceData.downloadUrl || '',
            paymentStatus: invoiceData.paymentStatus || 'paid',
            itemsCount: invoiceData.items?.length || 0
          }
        }
      );

      // Log notification
      await this.logNotification({
        title: `Invoice Sent via ${channel}`,
        body: `Invoice #${invoiceData.invoiceNumber} for Order #${invoiceData.orderNumber}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        recipientPhone: invoiceData.customerPhone,
        orderNumber: invoiceData.orderNumber,
        notificationType: 'invoice_sent',
        sentVia,
        adminNotified: adminNotification.success,
        customerNotified: customerNotification.success
      });

      return {
        success: adminNotification.success || customerNotification.success,
        adminNotification,
        customerNotification,
        invoiceNumber: invoiceData.invoiceNumber
      };

    } catch (error) {
      console.error('❌ Error sending invoice sent notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for payment reminder with invoice
   */
  async sendPaymentReminderNotification(orderData, isFirstReminder = true) {
    try {
      console.log('⏰ Payment reminder notification:', {
        orderNumber: orderData.orderNumber,
        customerPhone: orderData.phoneNumber,
        isFirstReminder
      });

      const notificationService = await this.getNotificationService();

      const reminderType = isFirstReminder ? 'First' : 'Final';
      const urgency = isFirstReminder ? 'Please complete payment' : 'URGENT: Payment required';

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        orderData.phoneNumber,
        `⏰ ${reminderType} Payment Reminder`,
        `${urgency} for Order #${orderData.orderNumber}. Amount: ₹${orderData.totalPrice}`,
        {
          category: this.category,
          priority: isFirstReminder ? this.priorities.NORMAL : this.priorities.HIGH,
          referenceId: orderData.orderNumber,
          actionUrl: `/orders/${orderData.orderNumber}/pay`,
          extraData: {
            orderNumber: orderData.orderNumber,
            amount: orderData.totalPrice,
            dueDate: this.calculateDueDate(orderData.createdAt),
            reminderType,
            paymentMethods: ['UPI: posterpro.store@upi'],
            invoiceUrl: `/invoices/order/${orderData.orderNumber}`,
            actionRequired: 'Pay now to confirm order'
          }
        }
      );

      // Send to admin for final reminder
      if (!isFirstReminder) {
        await notificationService.sendAdminNotification(
          '⏰ Final Payment Reminder Sent',
          `Final reminder sent for Order #${orderData.orderNumber}. Customer: ${orderData.phoneNumber}`,
          {
            category: this.category,
            priority: this.priorities.NORMAL,
            referenceId: orderData.orderNumber,
            actionUrl: `/admin/orders/${orderData.orderNumber}`,
            extraData: {
              orderNumber: orderData.orderNumber,
              customerPhone: orderData.phoneNumber,
              amount: orderData.totalPrice,
              daysPending: this.calculateDaysPending(orderData.createdAt),
              nextAction: 'Consider order cancellation if no payment'
            }
          }
        );
      }

      // Log notification
      await this.logNotification({
        title: `${reminderType} Payment Reminder`,
        body: `Order #${orderData.orderNumber} - ₹${orderData.totalPrice}`,
        category: this.category,
        priority: isFirstReminder ? this.priorities.NORMAL : this.priorities.HIGH,
        recipientPhone: orderData.phoneNumber,
        orderNumber: orderData.orderNumber,
        notificationType: 'payment_reminder',
        reminderType: reminderType.toLowerCase(),
        customerNotified: customerNotification.success
      });

      return {
        success: customerNotification.success,
        customerNotification,
        orderNumber: orderData.orderNumber,
        reminderType
      };

    } catch (error) {
      console.error('❌ Error sending payment reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate due date based on order creation
   */
  calculateDueDate(createdAt) {
    try {
      const orderDate = new Date(createdAt);
      const dueDate = new Date(orderDate);
      dueDate.setDate(dueDate.getDate() + 2); // 2 days for payment
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Calculate days pending
   */
  calculateDaysPending(createdAt) {
    try {
      const orderDate = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - orderDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Send notification for invoice payment received
   */
  async sendInvoicePaidNotification(invoiceData, paymentData) {
    try {
      console.log('💰 Invoice paid notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        orderNumber: invoiceData.orderNumber,
        amount: paymentData.amount
      });

      const notificationService = await this.getNotificationService();

      // Send to admin
      const adminNotification = await notificationService.sendAdminNotification(
        '💰 Invoice Paid',
        `Invoice #${invoiceData.invoiceNumber} paid. Amount: ₹${paymentData.amount}`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: invoiceData.invoiceNumber,
          actionUrl: `/admin/invoices/${invoiceData.invoiceNumber}`,
          extraData: {
            invoiceNumber: invoiceData.invoiceNumber,
            orderNumber: invoiceData.orderNumber,
            customerName: invoiceData.customerName || 'Customer',
            amount: paymentData.amount,
            paidAt: new Date().toISOString(),
            paymentMethod: paymentData.method || 'UPI',
            transactionId: paymentData.transactionId || '',
            invoiceStatus: 'paid'
          }
        }
      );

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        invoiceData.customerPhone,
        '✅ Invoice Payment Received',
        `Thank you! We've received payment of ₹${paymentData.amount} for Invoice #${invoiceData.invoiceNumber}`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: invoiceData.orderNumber,
          actionUrl: `/invoices/${invoiceData.invoiceNumber}`,
          extraData: {
            invoiceNumber: invoiceData.invoiceNumber,
            orderNumber: invoiceData.orderNumber,
            amount: paymentData.amount,
            paidAt: new Date().toISOString(),
            paymentMethod: paymentData.method || 'UPI',
            receiptNumber: `RCPT-${Date.now()}`,
            nextStep: 'Order processing'
          }
        }
      );

      // Log notification
      await this.logNotification({
        title: 'Invoice Paid',
        body: `Invoice #${invoiceData.invoiceNumber} - ₹${paymentData.amount}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        recipientPhone: invoiceData.customerPhone,
        invoiceNumber: invoiceData.invoiceNumber,
        notificationType: 'invoice_paid',
        amount: paymentData.amount,
        adminNotified: adminNotification.success,
        customerNotified: customerNotification.success
      });

      return {
        success: adminNotification.success || customerNotification.success,
        adminNotification,
        customerNotification,
        invoiceNumber: invoiceData.invoiceNumber
      };

    } catch (error) {
      console.error('❌ Error sending invoice paid notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for overdue invoices
   */
  async sendOverdueInvoiceNotification(invoiceData, daysOverdue) {
    try {
      console.log('⚠️ Overdue invoice notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        daysOverdue
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: `⚠️ Invoice Overdue (${daysOverdue} days)`,
        body: `Invoice #${invoiceData.invoiceNumber} for Order #${invoiceData.orderNumber} is overdue. Amount: ₹${invoiceData.totalAmount}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/overdue`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerPhone: invoiceData.customerPhone,
          amount: invoiceData.totalAmount,
          dueDate: invoiceData.dueDate,
          daysOverdue,
          overdueAmount: invoiceData.totalAmount,
          actionRequired: 'Follow up with customer'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_overdue',
        daysOverdue,
        invoiceNumber: invoiceData.invoiceNumber
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending overdue invoice notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk invoices sent notification
   */
  async sendBulkInvoicesSentNotification(count, totalAmount) {
    try {
      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: `📤 ${count} Invoices Sent`,
        body: `Sent ${count} invoices with total amount ₹${totalAmount}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        actionUrl: '/admin/invoices',
        extraData: {
          invoicesSent: count,
          totalAmount,
          sentAt: new Date().toISOString(),
          averageInvoice: totalAmount / count,
          batchId: `BATCH-${Date.now()}`
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return result;

    } catch (error) {
      console.error('❌ Error sending bulk invoices notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for invoice delivery failure
   */
  async sendInvoiceDeliveryFailedNotification(invoiceData, failureReason, deliveryMethod = 'whatsapp') {
    try {
      console.log('❌ Invoice delivery failed notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        failureReason,
        deliveryMethod
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '❌ Invoice Delivery Failed',
        body: `Failed to send invoice #${invoiceData.invoiceNumber} via ${deliveryMethod}. Reason: ${failureReason}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerPhone: invoiceData.customerPhone,
          deliveryMethod,
          failureReason,
          failedAt: new Date().toISOString(),
          retryCount: 0,
          actionRequired: 'Manual intervention needed'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_delivery_failed',
        invoiceNumber: invoiceData.invoiceNumber
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending invoice delivery failed notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for invoice view/opened
   */
  async sendInvoiceViewedNotification(invoiceData, viewedAt, viewerInfo = {}) {
    try {
      console.log('👁️ Invoice viewed notification:', {
        invoiceNumber: invoiceData.invoiceNumber,
        viewedAt
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '👁️ Invoice Viewed by Customer',
        body: `Invoice #${invoiceData.invoiceNumber} was viewed by customer.`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerPhone: invoiceData.customerPhone,
          viewedAt: viewedAt || new Date().toISOString(),
          viewerInfo,
          ipAddress: viewerInfo.ip || 'Unknown',
          device: viewerInfo.device || 'Unknown'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_viewed',
        invoiceNumber: invoiceData.invoiceNumber
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending invoice viewed notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for invoice download
   */
  async sendInvoiceDownloadedNotification(invoiceData, downloadedAt) {
    try {
      console.log('📥 Invoice downloaded notification:', {
        invoiceNumber: invoiceData.invoiceNumber
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '📥 Invoice Downloaded by Customer',
        body: `Invoice #${invoiceData.invoiceNumber} was downloaded by customer.`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerPhone: invoiceData.customerPhone,
          downloadedAt: downloadedAt || new Date().toISOString(),
          format: 'PDF',
          action: 'Customer downloaded invoice'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_downloaded',
        invoiceNumber: invoiceData.invoiceNumber
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending invoice downloaded notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log notification
   */
  async logNotification(notification) {
    try {
      const logEntry = {
        ...notification,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      // Here you would save to your database
      console.log('📝 Invoice notification logged:', {
        title: notification.title,
        type: notification.notificationType,
        invoiceNumber: notification.invoiceNumber,
        recipient: notification.recipientPhone || 'admin'
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging invoice notification:', error);
      return null;
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(timeframe = 'month') {
    try {
      // This would query your database for invoice statistics
      return {
        totalInvoices: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        timeframe,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting invoice stats:', error);
      return {
        totalInvoices: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Schedule overdue invoice checks
   */
  scheduleOverdueInvoiceChecks(checkIntervalHours = 24) {
    // Run immediately first
    setTimeout(() => {
      this.checkAndNotifyOverdueInvoices();
    }, 5000); // Start after 5 seconds
    
    // Then schedule periodic checks
    const intervalMs = checkIntervalHours * 60 * 60 * 1000;
    setInterval(() => {
      this.checkAndNotifyOverdueInvoices();
    }, intervalMs);
    
    console.log(`⏰ Overdue invoice checks scheduled every ${checkIntervalHours} hours`);
  }

  /**
   * Check and notify overdue invoices
   */
  async checkAndNotifyOverdueInvoices() {
    try {
      console.log('🔍 Checking for overdue invoices...');
      
      // This would query your database for overdue invoices
      // const overdueInvoices = await Invoice.find({ 
      //   status: 'pending', 
      //   dueDate: { $lt: new Date() } 
      // });
      
      // For now, placeholder logic
      const overdueInvoices = [];
      
      if (overdueInvoices.length > 0) {
        console.log(`⚠️ Found ${overdueInvoices.length} overdue invoices`);
        
        for (const invoice of overdueInvoices) {
          const daysOverdue = Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
          await this.sendOverdueInvoiceNotification(invoice, daysOverdue);
        }
      }
      
      return {
        success: true,
        checked: overdueInvoices.length,
        notified: overdueInvoices.length
      };
      
    } catch (error) {
      console.error('❌ Error checking overdue invoices:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const invoiceSendNotify = new InvoiceSendNotification();
export default invoiceSendNotify;