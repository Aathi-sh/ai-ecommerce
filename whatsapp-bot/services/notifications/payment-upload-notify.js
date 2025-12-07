// services/notifications/payment-upload-notify.js

/**
 * Payment Upload Notification Service
 * Handles all payment-related notifications to admin
 */

class PaymentUploadNotification {
  constructor() {
    this.category = 'payment';
    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    };
    
    this.notificationService = null;
    console.log('💰 Payment Upload Notification service initialized (Admin Only)');
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
   * Send notification when payment is uploaded
   */
  async sendPaymentUploadedNotification(paymentData) {
    try {
      console.log('📸 Payment uploaded notification:', {
        orderNumber: paymentData.orderNumber,
        customerPhone: paymentData.customerPhone
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '📸 Payment Proof Uploaded',
        body: `Payment proof for Order #${paymentData.orderNumber} has been uploaded.`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: paymentData.orderNumber,
        actionUrl: `/admin/payments/verify/${paymentData._id || paymentData.orderNumber}`,
        extraData: {
          orderNumber: paymentData.orderNumber,
          amount: paymentData.orderDetails?.totalAmount || paymentData.amount,
          customerPhone: paymentData.customerPhone,
          uploadedAt: new Date().toISOString(),
          verificationStatus: paymentData.status || 'pending',
          confidenceScore: paymentData.validationResults?.confidenceScore || 0,
          requiresVerification: true
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
        notificationType: 'payment_uploaded',
        paymentId: paymentData._id || paymentData.orderNumber,
        success: result.success
      });

      return {
        success: result.success,
        paymentId: paymentData._id || paymentData.orderNumber,
        orderNumber: paymentData.orderNumber,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending payment uploaded notification:', error);
      return {
        success: false,
        error: error.message,
        orderNumber: paymentData.orderNumber
      };
    }
  }

  /**
   * Send notification when payment is verified
   */
  async sendPaymentVerifiedNotification(paymentData, verificationMethod = 'auto') {
    try {
      console.log('✅ Payment verified notification:', {
        orderNumber: paymentData.orderNumber,
        status: paymentData.status,
        method: verificationMethod
      });

      const notificationService = await this.getNotificationService();

      const verificationSource = verificationMethod === 'auto' ? 'automatically' : 'manually by admin';
      const emoji = verificationMethod === 'auto' ? '🤖' : '👤';

      const notificationData = {
        title: `${emoji} Payment Verified: ${paymentData.orderNumber}`,
        body: `Payment of ₹${paymentData.orderDetails?.totalAmount} verified ${verificationSource}.`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: paymentData.orderNumber,
        actionUrl: `/admin/orders/${paymentData.orderNumber}`,
        extraData: {
          orderNumber: paymentData.orderNumber,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.orderDetails?.totalAmount,
          verificationMethod,
          confidenceScore: paymentData.validationResults?.confidenceScore || 0,
          verifiedBy: verificationMethod === 'auto' ? 'system' : paymentData.verifiedBy,
          verifiedAt: new Date().toISOString(),
          nextStep: 'Order processing started'
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
        notificationType: 'payment_verified',
        orderNumber: paymentData.orderNumber,
        verificationMethod,
        success: result.success
      });

      return {
        success: result.success,
        orderNumber: paymentData.orderNumber,
        verificationMethod,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending payment verified notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when payment is rejected
   */
  async sendPaymentRejectedNotification(paymentData, reason, rejectedBy = 'admin') {
    try {
      console.log('❌ Payment rejected notification:', {
        orderNumber: paymentData.orderNumber,
        reason,
        rejectedBy
      });

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '❌ Payment Rejected',
        body: `Payment for Order #${paymentData.orderNumber} was rejected. Reason: ${reason}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: paymentData.orderNumber,
        actionUrl: `/admin/payments/${paymentData._id || paymentData.orderNumber}`,
        extraData: {
          orderNumber: paymentData.orderNumber,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.orderDetails?.totalAmount,
          rejectionReason: reason,
          rejectedBy,
          rejectedAt: new Date().toISOString(),
          actionRequired: 'Contact customer for correct payment proof'
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
        notificationType: 'payment_rejected',
        orderNumber: paymentData.orderNumber,
        reason,
        rejectedBy,
        success: result.success
      });

      return {
        success: result.success,
        orderNumber: paymentData.orderNumber,
        reason,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending payment rejected notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification when payment is marked as fraud
   */
  async sendPaymentFraudNotification(paymentData, reasons, markedBy = 'admin') {
    try {
      console.log('🚨 Payment fraud notification:', {
        orderNumber: paymentData.orderNumber,
        reasons,
        markedBy
      });

      const notificationService = await this.getNotificationService();

      const reasonText = Array.isArray(reasons) ? reasons.join(', ') : reasons;

      const notificationData = {
        title: '🚨 FRAUD ALERT!',
        body: `Order #${paymentData.orderNumber} marked as fraud. Reasons: ${reasonText}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: paymentData.orderNumber,
        actionUrl: `/admin/payments/fraud/${paymentData._id || paymentData.orderNumber}`,
        sound: 'alert',
        extraData: {
          orderNumber: paymentData.orderNumber,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.orderDetails?.totalAmount,
          fraudReasons: Array.isArray(reasons) ? reasons : [reasons],
          markedBy,
          markedAt: new Date().toISOString(),
          riskLevel: 'high',
          actionRequired: 'Investigate immediately',
          blockCustomer: true
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
        notificationType: 'payment_fraud',
        orderNumber: paymentData.orderNumber,
        reasons: Array.isArray(reasons) ? reasons : [reasons],
        markedBy,
        success: result.success
      });

      return {
        success: result.success,
        orderNumber: paymentData.orderNumber,
        reasons,
        markedBy,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending payment fraud notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for pending payment verification
   */
  async sendPendingVerificationNotification(paymentData) {
    try {
      const notificationService = await this.getNotificationService();
      const pendingCount = await this.getPendingVerificationCount();
      
      const notificationData = {
        title: `⏳ Pending Verification: ${pendingCount}`,
        body: `Order #${paymentData.orderNumber} needs verification. Amount: ₹${paymentData.orderDetails?.totalAmount}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: paymentData.orderNumber,
        actionUrl: '/admin/payments/pending',
        extraData: {
          orderNumber: paymentData.orderNumber,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.orderDetails?.totalAmount,
          pendingCount,
          uploadedAt: paymentData.createdAt || new Date().toISOString(),
          waitingTime: this.calculateWaitingTime(paymentData.createdAt)
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
        notificationType: 'pending_verification',
        orderNumber: paymentData.orderNumber,
        pendingCount,
        success: result.success
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending pending verification notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate waiting time for verification
   */
  calculateWaitingTime(createdAt) {
    try {
      if (!createdAt) return 'N/A';
      
      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Less than 1 hour';
      if (diffHours === 1) return '1 hour';
      if (diffHours < 24) return `${diffHours} hours`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get count of pending verifications
   */
  async getPendingVerificationCount() {
    try {
      // This should query your database
      // const count = await PaymentVerification.countDocuments({ status: 'pending' });
      // return count;
      
      return 0; // Placeholder
    } catch (error) {
      console.error('❌ Error getting pending verification count:', error);
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
        category: 'invoice',
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
   * Send notification for payment reminder
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
      const urgency = isFirstReminder ? 'needs payment' : 'requires URGENT payment';

      const notificationData = {
        title: `⏰ ${reminderType} Payment Reminder Sent`,
        body: `Reminder sent for Order #${orderData.orderNumber}. ${urgency}`,
        category: this.category,
        priority: isFirstReminder ? this.priorities.NORMAL : this.priorities.HIGH,
        referenceId: orderData.orderNumber,
        actionUrl: `/admin/orders/${orderData.orderNumber}`,
        extraData: {
          orderNumber: orderData.orderNumber,
          customerPhone: orderData.phoneNumber,
          amount: orderData.totalPrice,
          dueDate: this.calculateDueDate(orderData.createdAt),
          reminderType,
          daysPending: this.calculateDaysPending(orderData.createdAt),
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
   * Send notification for payment verification delay
   */
  async sendVerificationDelayNotification(paymentData, delayHours) {
    try {
      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: `⏰ Verification Delayed (${delayHours} hours)`,
        body: `Payment for Order #${paymentData.orderNumber} pending for ${delayHours} hours.`,
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: paymentData.orderNumber,
        actionUrl: `/admin/payments/verify/${paymentData._id || paymentData.orderNumber}`,
        extraData: {
          orderNumber: paymentData.orderNumber,
          customerPhone: paymentData.customerPhone,
          amount: paymentData.orderDetails?.totalAmount,
          uploadedAt: paymentData.createdAt,
          delayHours,
          actionRequired: 'Verify manually'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return result;

    } catch (error) {
      console.error('❌ Error sending verification delay notification:', error);
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
      console.log('📝 Payment notification logged:', {
        type: notification.notificationType,
        orderNumber: notification.orderNumber,
        success: notification.success
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging payment notification:', error);
      return null;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(timeframe = 'day') {
    try {
      // This would query your database for payment statistics
      return {
        totalPayments: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
        fraud: 0,
        averageVerificationTime: 0,
        timeframe,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting payment stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const paymentUploadNotify = new PaymentUploadNotification();
export default paymentUploadNotify;