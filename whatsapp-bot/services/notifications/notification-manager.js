// Import individual notification services directly
import newOrderNotify from './new-order-notify.js';
import paymentUploadNotify from './payment-upload-notify.js';
import lowStockNotify from './low-stock-notify.js';
import invoiceSendNotify from './invoice-send-notify.js';

// Import notification service from separate base service
import  notificationService from "../../services/notifications/notifictaion-service.js";

class NotificationManager {
  constructor() {
    this.services = {
      order: newOrderNotify,
      payment: paymentUploadNotify,
      stock: lowStockNotify,
      invoice: invoiceSendNotify
    };
    this.baseService =  notificationService;
    console.log('🎯 Notification Manager initialized');
  }

  /**
   * Unified method to send notifications based on event type
   */
  async sendNotification(eventType, data) {
    try {
      console.log(`🎯 Processing notification event: ${eventType}`, {
        orderNumber: data.orderNumber || data.orderId,
        customerPhone: data.customerPhone || data.phoneNumber || data.phone
      });

      switch (eventType) {
        case 'NEW_ORDER':
          return await this.services.order.sendNewOrderNotification(data);

        case 'ORDER_STATUS_UPDATE':
          return await this.services.order.sendOrderStatusUpdate(
            data.orderId || data._id,
            data.newStatus,
            data.previousStatus
          );

        case 'PAYMENT_UPLOADED':
          return await this.services.payment.sendPaymentUploadedNotification(data);

        case 'PAYMENT_VERIFIED':
          return await this.services.payment.sendPaymentVerifiedNotification(
            data,
            data.verificationMethod || 'auto'
          );

        case 'PAYMENT_REJECTED':
          return await this.services.payment.sendPaymentRejectedNotification(
            data,
            data.reason,
            data.rejectedBy
          );

        case 'PAYMENT_FRAUD':
          return await this.services.payment.sendPaymentFraudNotification(
            data,
            data.reasons,
            data.markedBy
          );

        case 'LOW_STOCK_CHECK':
          return await this.services.stock.checkAndSendLowStockNotifications();

        case 'STOCK_UPDATED':
          return await this.services.stock.sendStockUpdatedNotification(
            data.product,
            data.previousStock,
            data.newStock,
            data.updatedBy
          );

        case 'INVOICE_GENERATED':
          return await this.services.invoice.sendInvoiceGeneratedNotification(data);

        case 'INVOICE_SENT':
          return await this.services.invoice.sendInvoiceSentToCustomerNotification(
            data,
            data.sentVia
          );

        case 'PAYMENT_REMINDER':
          return await this.services.invoice.sendPaymentReminderNotification(
            data,
            data.isFirstReminder
          );

        case 'INVOICE_PAID':
          return await this.services.invoice.sendInvoicePaidNotification(
            data.invoiceData,
            data.paymentData
          );

        case 'BULK_ORDERS':
          return await this.services.order.sendBulkOrdersNotification(data.orders);

        case 'ADMIN_ALERT':
          return await this.baseService.sendAdminNotification(
            data.title,
            data.body,
            data.notificationData
          );

        case 'CUSTOMER_NOTIFICATION':
          return await this.baseService.sendCustomerNotification(
            data.customerPhone,
            data.title,
            data.body,
            data.notificationData
          );

        default:
          console.warn(`⚠️ Unknown notification event type: ${eventType}`);
          return {
            success: false,
            error: `Unknown event type: ${eventType}`,
            eventType
          };
      }

    } catch (error) {
      console.error(`❌ Error in notification manager for ${eventType}:`, error);
      return {
        success: false,
        error: error.message,
        eventType
      };
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(recipientType = 'admin', customData = {}) {
    try {
      const testData = {
        title: '🔔 Test Notification',
        body: 'This is a test notification from your WhatsApp Bot',
        ...customData
      };

      if (recipientType === 'admin') {
        return await this.baseService.sendAdminNotification(
          testData.title,
          testData.body,
          {
            category: 'SYSTEM',
            priority: 'NORMAL',
            extraData: {
              test: true,
              timestamp: new Date().toISOString(),
              botVersion: '1.0.0'
            }
          }
        );
      } else {
        return await this.baseService.sendCustomerNotification(
          recipientType, // assuming recipientType is phone number for customer
          testData.title,
          testData.body,
          {
            category: 'SYSTEM',
            priority: 'NORMAL',
            extraData: {
              test: true,
              timestamp: new Date().toISOString()
            }
          }
        );
      }

    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(timeframe = 'day') {
    try {
      // This would query your database for notification logs
      // For now, return placeholder stats
      return {
        totalSent: 0,
        successful: 0,
        failed: 0,
        byCategory: {},
        byPriority: {},
        timeframe
      };
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize scheduled notifications
   */
  initializeScheduledNotifications() {
    // Schedule daily stock check at 9 AM
    if (this.services.stock.scheduleDailyStockCheck) {
      this.services.stock.scheduleDailyStockCheck();
    }

    // Schedule payment reminder checks (every 6 hours)
    setInterval(() => {
      this.checkAndSendPaymentReminders();
    }, 6 * 60 * 60 * 1000);

    // Schedule overdue invoice checks (daily at 10 AM)
    const now = new Date();
    const invoiceCheckTime = new Date(now);
    invoiceCheckTime.setHours(10, 0, 0, 0);
    
    if (now > invoiceCheckTime) {
      invoiceCheckTime.setDate(invoiceCheckTime.getDate() + 1);
    }
    
    setTimeout(() => {
      this.checkAndSendOverdueInvoices();
      // Repeat daily
      setInterval(() => {
        this.checkAndSendOverdueInvoices();
      }, 24 * 60 * 60 * 1000);
    }, invoiceCheckTime - now);

    console.log('⏰ Scheduled notifications initialized');
  }

  /**
   * Check and send payment reminders
   */
  async checkAndSendPaymentReminders() {
    try {
      console.log('⏰ Checking for payment reminders...');
      // This would query pending orders and send reminders
      // Implementation depends on your database structure
      return { success: true, message: 'Payment reminder check completed' };
    } catch (error) {
      console.error('❌ Error checking payment reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check and send overdue invoices
   */
  async checkAndSendOverdueInvoices() {
    try {
      console.log('⚠️ Checking for overdue invoices...');
      // This would query overdue invoices and send notifications
      // Implementation depends on your database structure
      return { success: true, message: 'Overdue invoice check completed' };
    } catch (error) {
      console.error('❌ Error checking overdue invoices:', error);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationManager;