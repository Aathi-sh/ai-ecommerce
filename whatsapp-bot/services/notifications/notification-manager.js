// services/notifications/notification-manager.js

/**
 * Notification Manager
 * Main orchestrator for all notification services
 * ADMIN-ONLY notifications
 */

// Import individual notification services
import newOrderNotify from './new-order-notify.js';
import paymentUploadNotify from './payment-upload-notify.js';
import lowStockNotify from './low-stock-notify.js';
import invoiceSendNotify from './invoice-send-notify.js';

// Import base notification service
import notificationService from "./notifictaion-service.js";

class NotificationManager {
  constructor() {
    this.services = {
      order: newOrderNotify,
      payment: paymentUploadNotify,
      stock: lowStockNotify,
      invoice: invoiceSendNotify
    };
    this.baseService = notificationService;
    console.log('🎯 Notification Manager initialized (Admin Only)');
  }

  /**
   * Unified method to send notifications based on event type
   */
  async sendNotification(eventType, data) {
    try {
      console.log(`🎯 Processing admin notification event: ${eventType}`, {
        orderNumber: data.orderNumber || data.orderId,
        referenceId: data.referenceId
      });

      switch (eventType) {
        // Order events
        case 'NEW_ORDER':
          return await this.services.order.sendNewOrderNotification(data);

        case 'ORDER_STATUS_UPDATE':
          return await this.services.order.sendOrderStatusUpdate(
            data.orderId || data._id,
            data.newStatus,
            data.previousStatus
          );

        case 'BULK_ORDERS':
          return await this.services.order.sendBulkOrdersNotification(data.orders);

        // Payment events
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

        // Stock events
        case 'LOW_STOCK_CHECK':
          return await this.services.stock.checkAndSendLowStockNotifications();

        case 'STOCK_UPDATED':
          return await this.services.stock.sendStockUpdatedNotification(
            data.product,
            data.previousStock,
            data.newStock,
            data.updatedBy
          );

        // Invoice events
        case 'INVOICE_GENERATED':
          return await this.services.invoice.sendInvoiceGeneratedNotification(data);

        case 'INVOICE_SENT':
          return await this.services.invoice.sendInvoiceSentToCustomerNotification(data);

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

        // System events
        case 'ADMIN_ALERT':
          return await this.baseService.sendAdminNotification(
            data.title,
            data.body,
            data.notificationData
          );

        case 'SYSTEM_ALERT':
          return await this.baseService.sendAlertNotification(
            data.title,
            data.body,
            data.alertData
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
   * Send test notification to admin
   */
  async sendTestNotification(customData = {}) {
    try {
      const testData = {
        title: '🔔 Test Notification',
        body: 'This is a test notification to admin devices',
        ...customData
      };

      return await this.baseService.sendTestNotification(testData);

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
        timeframe,
        recipients: 'admin-only'
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
    try {
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

    } catch (error) {
      console.error('❌ Error initializing scheduled notifications:', error);
    }
  }

  /**
   * Check and send payment reminders
   */
  async checkAndSendPaymentReminders() {
    try {
      console.log('⏰ Checking for payment reminders...');
      // This would query pending payments and send admin reminders
      return { 
        success: true, 
        message: 'Payment reminder check completed',
        timestamp: new Date().toISOString()
      };
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
      // This would query overdue invoices and send admin notifications
      return { 
        success: true, 
        message: 'Overdue invoice check completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error checking overdue invoices:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check Firebase connectivity
   */
  async checkFirebaseConnection() {
    return await this.baseService.checkConnection();
  }

  /**
   * Get all available notification event types
   */
  getAvailableEventTypes() {
    return {
      ORDER_EVENTS: [
        'NEW_ORDER',
        'ORDER_STATUS_UPDATE',
        'BULK_ORDERS'
      ],
      PAYMENT_EVENTS: [
        'PAYMENT_UPLOADED',
        'PAYMENT_VERIFIED',
        'PAYMENT_REJECTED',
        'PAYMENT_FRAUD'
      ],
      STOCK_EVENTS: [
        'LOW_STOCK_CHECK',
        'STOCK_UPDATED'
      ],
      INVOICE_EVENTS: [
        'INVOICE_GENERATED',
        'INVOICE_SENT',
        'PAYMENT_REMINDER',
        'INVOICE_PAID'
      ],
      SYSTEM_EVENTS: [
        'ADMIN_ALERT',
        'SYSTEM_ALERT'
      ]
    };
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export as default for easier imports
export default notificationManager;