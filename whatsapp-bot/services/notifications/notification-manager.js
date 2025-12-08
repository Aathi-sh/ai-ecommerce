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
import notificationService from "./notification-service.js";

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
          return await this.sendOrderNotification('NEW_ORDER', data);
          
        case 'ORDER_STATUS_UPDATE':
          return await this.sendOrderNotification('ORDER_STATUS_UPDATE', data);

        case 'BULK_ORDERS':
          return await this.sendOrderNotification('BULK_ORDERS', data);

        // Payment events
        case 'PAYMENT_UPLOADED':
          return await this.sendPaymentNotification('PAYMENT_UPLOADED', data);

        case 'PAYMENT_VERIFIED':
          return await this.sendPaymentNotification('PAYMENT_VERIFIED', data);

        case 'PAYMENT_REJECTED':
          return await this.sendPaymentNotification('PAYMENT_REJECTED', data);

        case 'PAYMENT_FRAUD':
          return await this.sendPaymentNotification('PAYMENT_FRAUD', data);

        // Stock events
        case 'LOW_STOCK_CHECK':
          return await this.sendStockNotification('LOW_STOCK_CHECK', data);

        case 'STOCK_UPDATED':
          return await this.sendStockNotification('STOCK_UPDATED', data);

        // Invoice events
        case 'INVOICE_GENERATED':
          return await this.sendInvoiceNotification('INVOICE_GENERATED', data);

        case 'INVOICE_SENT':
          return await this.sendInvoiceNotification('INVOICE_SENT', data);

        case 'PAYMENT_REMINDER':
          return await this.sendInvoiceNotification('PAYMENT_REMINDER', data);

        case 'INVOICE_PAID':
          return await this.sendInvoiceNotification('INVOICE_PAID', data);

        // System events
        case 'ADMIN_ALERT':
          return await this.baseService.sendAdminNotification(
            data.title || 'Admin Alert',
            data.body || 'You have a new alert',
            {
              type: 'ADMIN_ALERT',
              category: 'alert',
              priority: 'high',
              ...data.notificationData
            }
          );

        case 'SYSTEM_ALERT':
          return await this.baseService.sendAlertNotification(
            data.title || 'System Alert',
            data.body || 'System notification',
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
   * Send order notification
   */
  async sendOrderNotification(type, data) {
    try {
      const notificationData = this.getOrderNotificationData(type, data);
      
      return await this.baseService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        {
          type: 'ORDER',
          category: 'order',
          priority: 'high',
          referenceId: data.orderNumber || data.orderId,
          orderId: data.orderId || data._id,
          customerPhone: data.customerPhone,
          totalAmount: data.totalAmount,
          ...notificationData.extraData
        }
      );
    } catch (error) {
      console.error(`❌ Error sending order notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(type, data) {
    try {
      const notificationData = this.getPaymentNotificationData(type, data);
      
      return await this.baseService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        {
          type: 'PAYMENT',
          category: 'payment',
          priority: 'high',
          referenceId: data.orderNumber || data.referenceId,
          amount: data.amount,
          status: data.status,
          ...notificationData.extraData
        }
      );
    } catch (error) {
      console.error(`❌ Error sending payment notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send stock notification
   */
  async sendStockNotification(type, data) {
    try {
      const notificationData = this.getStockNotificationData(type, data);
      
      return await this.baseService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        {
          type: 'STOCK',
          category: 'stock',
          priority: data.priority || 'normal',
          productId: data.product?._id || data.productId,
          productName: data.product?.name || data.productName,
          currentStock: data.newStock || data.currentStock,
          ...notificationData.extraData
        }
      );
    } catch (error) {
      console.error(`❌ Error sending stock notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send invoice notification
   */
  async sendInvoiceNotification(type, data) {
    try {
      const notificationData = this.getInvoiceNotificationData(type, data);
      
      return await this.baseService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        {
          type: 'INVOICE',
          category: 'invoice',
          priority: 'normal',
          invoiceId: data.invoiceId || data._id,
          orderNumber: data.orderNumber,
          amount: data.amount,
          status: data.status,
          ...notificationData.extraData
        }
      );
    } catch (error) {
      console.error(`❌ Error sending invoice notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order notification data
   */
  getOrderNotificationData(type, data) {
    const templates = {
      'NEW_ORDER': {
        title: '🛍️ New Order Received',
        body: `Order #${data.orderNumber} from ${data.customerPhone || 'Customer'}`,
        extraData: {
          orderStatus: 'new',
          itemCount: data.items?.length || 0
        }
      },
      'ORDER_STATUS_UPDATE': {
        title: '📦 Order Status Updated',
        body: `Order #${data.orderNumber} updated to ${data.newStatus}`,
        extraData: {
          previousStatus: data.previousStatus,
          newStatus: data.newStatus
        }
      },
      'BULK_ORDERS': {
        title: '📦 Multiple New Orders',
        body: `${data.orders?.length || 0} new orders received`,
        extraData: {
          orderCount: data.orders?.length || 0
        }
      }
    };

    return templates[type] || {
      title: 'Order Update',
      body: 'Your order has been updated',
      extraData: {}
    };
  }

  /**
   * Get payment notification data
   */
  getPaymentNotificationData(type, data) {
    const templates = {
      'PAYMENT_UPLOADED': {
        title: '💰 Payment Uploaded',
        body: `Payment for Order #${data.orderNumber} uploaded`,
        extraData: {
          amount: data.amount,
          method: data.method || 'Unknown'
        }
      },
      'PAYMENT_VERIFIED': {
        title: '✅ Payment Verified',
        body: `Payment for Order #${data.orderNumber} verified ${data.verificationMethod === 'auto' ? '(Auto)' : '(Manual)'}`,
        extraData: {
          verifiedBy: data.verificationMethod || 'manual',
          amount: data.amount
        }
      },
      'PAYMENT_REJECTED': {
        title: '❌ Payment Rejected',
        body: `Payment for Order #${data.orderNumber} rejected`,
        extraData: {
          reason: data.reason,
          rejectedBy: data.rejectedBy
        }
      },
      'PAYMENT_FRAUD': {
        title: '🚨 Fraud Alert',
        body: `Payment for Order #${data.orderNumber} marked as fraud`,
        extraData: {
          reasons: data.reasons,
          markedBy: data.markedBy
        }
      }
    };

    return templates[type] || {
      title: 'Payment Update',
      body: 'Payment status updated',
      extraData: {}
    };
  }

  /**
   * Get stock notification data
   */
  getStockNotificationData(type, data) {
    const templates = {
      'LOW_STOCK_CHECK': {
        title: '📉 Low Stock Alert',
        body: `${data.lowStockCount || 'Some'} products are running low on stock`,
        extraData: {
          lowStockCount: data.lowStockCount,
          criticalCount: data.criticalCount
        }
      },
      'STOCK_UPDATED': {
        title: '📊 Stock Updated',
        body: `${data.product?.name || 'Product'} stock updated to ${data.newStock}`,
        extraData: {
          productName: data.product?.name,
          previousStock: data.previousStock,
          newStock: data.newStock,
          updatedBy: data.updatedBy
        }
      }
    };

    return templates[type] || {
      title: 'Stock Update',
      body: 'Stock information updated',
      extraData: {}
    };
  }

  /**
   * Get invoice notification data
   */
  getInvoiceNotificationData(type, data) {
    const templates = {
      'INVOICE_GENERATED': {
        title: '🧾 Invoice Generated',
        body: `Invoice #${data.invoiceNumber || data.invoiceId} generated`,
        extraData: {
          invoiceNumber: data.invoiceNumber,
          orderNumber: data.orderNumber,
          amount: data.amount
        }
      },
      'INVOICE_SENT': {
        title: '📤 Invoice Sent',
        body: `Invoice sent to customer for Order #${data.orderNumber}`,
        extraData: {
          customerPhone: data.customerPhone,
          sentMethod: data.sentMethod || 'whatsapp'
        }
      },
      'PAYMENT_REMINDER': {
        title: '⏰ Payment Reminder',
        body: `Reminder sent for Order #${data.orderNumber}`,
        extraData: {
          isFirstReminder: data.isFirstReminder || false,
          daysOverdue: data.daysOverdue || 0
        }
      },
      'INVOICE_PAID': {
        title: '✅ Invoice Paid',
        body: `Invoice #${data.invoiceNumber} has been paid`,
        extraData: {
          invoiceNumber: data.invoiceNumber,
          paymentMethod: data.paymentData?.method,
          amount: data.paymentData?.amount
        }
      }
    };

    return templates[type] || {
      title: 'Invoice Update',
      body: 'Invoice status updated',
      extraData: {}
    };
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
      // You would query your database for notification logs
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
      if (this.services.stock && this.services.stock.scheduleDailyStockCheck) {
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
      // Implement your payment reminder logic here
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
      // Implement your overdue invoice logic here
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