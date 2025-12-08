// services/notifications/invoice-send-notify.js

/**
 * Invoice Send Notification Service
 * Handles all invoice-related notifications to admin
 */

class InvoiceSendNotification {
  constructor() {
    this.category = 'invoice';
    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    };
    
    this.notificationService = null;
    console.log('🧾 Invoice Send Notification service initialized (Admin Only)');
  }

  /**
   * Lazy load notification service
   */
  async getNotificationService() {
    if (!this.notificationService) {
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
        type: 'INVOICE_GENERATED',
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: invoiceData.invoiceNumber || invoiceData.orderNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber || invoiceData.orderNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerName: invoiceData.customerName || 'Customer',
          customerPhone: invoiceData.customerPhone,
          amount: invoiceData.totalAmount || invoiceData.amount,
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

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_generated',
        orderNumber: invoiceData.orderNumber,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        notification: result
      };

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

      const notificationData = {
        title: `${emoji} Invoice Sent via ${channel}`,
        body: `Invoice #${invoiceData.invoiceNumber} sent to customer. Order #${invoiceData.orderNumber}`,
        type: 'INVOICE_SENT',
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
          amount: invoiceData.totalAmount || invoiceData.amount,
          deliveryStatus: 'sent'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_sent',
        orderNumber: invoiceData.orderNumber,
        sentVia,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        sentVia,
        notification: result
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
        customerPhone: orderData.phoneNumber || orderData.customerPhone,
        isFirstReminder
      });

      const notificationService = await this.getNotificationService();

      const reminderType = isFirstReminder ? 'First' : 'Final';

      const notificationData = {
        title: `⏰ ${reminderType} Payment Reminder Sent`,
        body: `Invoice reminder sent for Order #${orderData.orderNumber}. Customer: ${orderData.phoneNumber || orderData.customerPhone}`,
        type: 'PAYMENT_REMINDER',
        category: this.category,
        priority: isFirstReminder ? this.priorities.NORMAL : this.priorities.HIGH,
        referenceId: orderData.orderNumber,
        actionUrl: `/admin/orders/${orderData.orderNumber}`,
        extraData: {
          orderNumber: orderData.orderNumber,
          customerPhone: orderData.phoneNumber || orderData.customerPhone,
          amount: orderData.totalPrice || orderData.totalAmount,
          dueDate: this.calculateDueDate(orderData.createdAt || orderData.orderDate),
          reminderType,
          daysPending: this.calculateDaysPending(orderData.createdAt || orderData.orderDate),
          actionRequired: isFirstReminder ? 'Monitor payment' : 'Consider cancellation'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'payment_reminder',
        orderNumber: orderData.orderNumber,
        reminderType: reminderType.toLowerCase(),
        success: result.success
      });

      return {
        success: result.success,
        orderNumber: orderData.orderNumber,
        reminderType,
        notification: result
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

      const notificationData = {
        title: '💰 Invoice Paid',
        body: `Invoice #${invoiceData.invoiceNumber} paid. Amount: ₹${paymentData.amount}`,
        type: 'INVOICE_PAID',
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/${invoiceData.invoiceNumber}`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerName: invoiceData.customerName || 'Customer',
          customerPhone: invoiceData.customerPhone,
          amount: paymentData.amount,
          paidAt: new Date().toISOString(),
          paymentMethod: paymentData.method || 'UPI',
          transactionId: paymentData.transactionId || '',
          invoiceStatus: 'paid',
          confirmedBy: 'system'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_paid',
        invoiceNumber: invoiceData.invoiceNumber,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        notification: result
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
        body: `Invoice #${invoiceData.invoiceNumber} for Order #${invoiceData.orderNumber} is overdue. Amount: ₹${invoiceData.totalAmount || invoiceData.amount}`,
        type: 'INVOICE_OVERDUE',
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: invoiceData.invoiceNumber,
        actionUrl: `/admin/invoices/overdue`,
        extraData: {
          invoiceNumber: invoiceData.invoiceNumber,
          orderNumber: invoiceData.orderNumber,
          customerPhone: invoiceData.customerPhone,
          amount: invoiceData.totalAmount || invoiceData.amount,
          dueDate: invoiceData.dueDate,
          daysOverdue,
          overdueAmount: invoiceData.totalAmount || invoiceData.amount,
          actionRequired: 'Follow up with customer'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_overdue',
        invoiceNumber: invoiceData.invoiceNumber,
        daysOverdue,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        daysOverdue,
        notification: result
      };

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
        type: 'BULK_INVOICES_SENT',
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
        type: 'INVOICE_DELIVERY_FAILED',
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

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_delivery_failed',
        invoiceNumber: invoiceData.invoiceNumber,
        failureReason,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        failureReason,
        notification: result
      };

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
        type: 'INVOICE_VIEWED',
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
          device: viewerInfo.device || 'Unknown',
          engagement: 'Customer is viewing invoice'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_viewed',
        invoiceNumber: invoiceData.invoiceNumber,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        notification: result
      };

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
        type: 'INVOICE_DOWNLOADED',
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
          action: 'Customer downloaded invoice for records'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        notificationType: 'invoice_downloaded',
        invoiceNumber: invoiceData.invoiceNumber,
        success: result.success
      });

      return {
        success: result.success,
        invoiceNumber: invoiceData.invoiceNumber,
        notification: result
      };

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
        status: notification.success ? 'sent' : 'failed'
      };

      // Here you would save to your database
      console.log('📝 Invoice notification logged:', {
        type: notification.notificationType,
        invoiceNumber: notification.invoiceNumber,
        success: notification.success
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
      // Example:
      // const stats = await Invoice.aggregate([
      //   { $match: { createdAt: { $gte: startDate } } },
      //   { $group: { _id: "$status", count: { $sum: 1 } } }
      // ]);
      
      return {
        success: true,
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
        success: false,
        error: error.message,
        totalInvoices: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        sent: 0,
        delivered: 0,
        failed: 0
      };
    }
  }

  /**
   * Schedule overdue invoice checks
   */
  scheduleOverdueInvoiceChecks(checkIntervalHours = 24) {
    try {
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
      return {
        success: true,
        checkIntervalHours,
        nextCheck: new Date(Date.now() + intervalMs)
      };
    } catch (error) {
      console.error('❌ Error scheduling overdue invoice checks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and notify overdue invoices
   */
  async checkAndNotifyOverdueInvoices() {
    try {
      console.log('🔍 Checking for overdue invoices...');
      
      // This would query your database for overdue invoices
      // Example:
      // const overdueInvoices = await Invoice.find({ 
      //   status: 'pending', 
      //   dueDate: { $lt: new Date() } 
      // }).populate('orderId');
      
      // For now, placeholder logic
      const overdueInvoices = [];
      
      if (overdueInvoices.length > 0) {
        console.log(`⚠️ Found ${overdueInvoices.length} overdue invoices`);
        
        for (const invoice of overdueInvoices) {
          const daysOverdue = Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
          await this.sendOverdueInvoiceNotification(invoice, daysOverdue);
        }
      } else {
        console.log('✅ No overdue invoices found');
      }
      
      return {
        success: true,
        checked: true,
        found: overdueInvoices.length,
        notified: overdueInvoices.length,
        timestamp: new Date().toISOString()
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