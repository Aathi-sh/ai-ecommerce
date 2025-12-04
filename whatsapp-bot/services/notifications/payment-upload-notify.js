// services/notifications/payment-upload-notify.js

class PaymentUploadNotification {
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

    this.category = this.categories.PAYMENT;
    console.log('💰 Payment Upload Notification service initialized');
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
          confidenceScore: paymentData.validationResults?.confidenceScore || 0
        }
      };

      // Send to admin for verification
      const adminResult = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Send confirmation to customer
      const customerResult = await notificationService.sendCustomerNotification(
        paymentData.customerPhone,
        '✅ Payment Received!',
        `We've received your payment proof for Order #${paymentData.orderNumber}. We're verifying it now.`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: paymentData.orderNumber,
          actionUrl: `/orders/${paymentData.orderNumber}`,
          extraData: {
            orderNumber: paymentData.orderNumber,
            amount: paymentData.orderDetails?.totalAmount,
            verificationTime: '5-15 minutes'
          }
        }
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        recipientPhone: paymentData.customerPhone,
        notificationType: 'payment_uploaded',
        adminNotified: adminResult.success,
        customerNotified: customerResult.success
      });

      return {
        success: adminResult.success || customerResult.success,
        adminNotification: adminResult,
        customerNotification: customerResult,
        paymentId: paymentData._id || paymentData.orderNumber
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

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        paymentData.customerPhone,
        '🎉 Payment Verified!',
        `Your payment of ₹${paymentData.orderDetails?.totalAmount} for Order #${paymentData.orderNumber} has been verified ${verificationSource}.`,
        {
          title: '🎉 Payment Verified Successfully!',
          body: `Your payment for Order #${paymentData.orderNumber} has been confirmed. Your order is now being processed.`,
          category: this.category,
          priority: this.priorities.HIGH,
          referenceId: paymentData.orderNumber,
          actionUrl: `/orders/${paymentData.orderNumber}`,
          extraData: {
            orderNumber: paymentData.orderNumber,
            amount: paymentData.orderDetails?.totalAmount,
            verifiedAt: new Date().toISOString(),
            verificationMethod,
            confidenceScore: paymentData.validationResults?.confidenceScore || 0,
            nextStep: 'Order processing started'
          }
        }
      );

      // Send to admin (for auto-verification) or confirmation (for manual)
      const adminNotification = await notificationService.sendAdminNotification(
        `${emoji} Payment Verified: ${paymentData.orderNumber}`,
        `Payment of ₹${paymentData.orderDetails?.totalAmount} verified ${verificationSource}.`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: paymentData.orderNumber,
          actionUrl: `/admin/orders/${paymentData.orderNumber}`,
          extraData: {
            orderNumber: paymentData.orderNumber,
            customerPhone: paymentData.customerPhone,
            verificationMethod,
            confidenceScore: paymentData.validationResults?.confidenceScore || 0,
            verifiedBy: verificationMethod === 'auto' ? 'system' : paymentData.verifiedBy
          }
        }
      );

      // Log notification
      await this.logNotification({
        title: `Payment Verified ${verificationMethod === 'auto' ? 'Automatically' : 'Manually'}`,
        body: `Order #${paymentData.orderNumber} - ₹${paymentData.orderDetails?.totalAmount}`,
        category: this.category,
        priority: this.priorities.NORMAL,
        recipientPhone: paymentData.customerPhone,
        orderNumber: paymentData.orderNumber,
        notificationType: 'payment_verified',
        verificationMethod,
        customerNotified: customerNotification.success,
        adminNotified: adminNotification.success
      });

      return {
        success: customerNotification.success,
        customerNotification,
        adminNotification,
        orderNumber: paymentData.orderNumber
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

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        paymentData.customerPhone,
        '❌ Payment Verification Failed',
        `Your payment for Order #${paymentData.orderNumber} was rejected. Reason: ${reason}`,
        {
          title: '❌ Payment Issue Detected',
          body: `We couldn't verify your payment for Order #${paymentData.orderNumber}. Please check and try again.`,
          category: this.category,
          priority: this.priorities.HIGH,
          referenceId: paymentData.orderNumber,
          actionUrl: `/orders/${paymentData.orderNumber}`,
          extraData: {
            orderNumber: paymentData.orderNumber,
            amount: paymentData.orderDetails?.totalAmount,
            rejectionReason: reason,
            rejectedBy,
            rejectedAt: new Date().toISOString(),
            actionRequired: 'Please upload correct payment proof'
          }
        }
      );

      // Log notification
      await this.logNotification({
        title: 'Payment Rejected',
        body: `Order #${paymentData.orderNumber} - Reason: ${reason}`,
        category: this.category,
        priority: this.priorities.HIGH,
        recipientPhone: paymentData.customerPhone,
        orderNumber: paymentData.orderNumber,
        notificationType: 'payment_rejected',
        reason,
        rejectedBy,
        customerNotified: customerNotification.success
      });

      return {
        success: customerNotification.success,
        customerNotification,
        orderNumber: paymentData.orderNumber
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

      // Send to admin (high priority)
      const adminNotification = await notificationService.sendAdminNotification(
        '🚨 FRAUD ALERT!',
        `Order #${paymentData.orderNumber} marked as fraud. Reasons: ${reasonText}`,
        {
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
            actionRequired: 'Investigate immediately'
          }
        }
      );

      // Log notification
      await this.logNotification({
        title: '🚨 Payment Marked as Fraud',
        body: `Order #${paymentData.orderNumber} - ${reasonText}`,
        category: this.category,
        priority: this.priorities.HIGH,
        orderNumber: paymentData.orderNumber,
        notificationType: 'payment_fraud',
        reasons: Array.isArray(reasons) ? reasons : [reasons],
        markedBy,
        adminNotified: adminNotification.success
      });

      return {
        success: adminNotification.success,
        adminNotification,
        orderNumber: paymentData.orderNumber
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
      
      const adminNotification = await notificationService.sendAdminNotification(
        `⏳ Pending Verification: ${pendingCount}`,
        `Order #${paymentData.orderNumber} needs verification. Amount: ₹${paymentData.orderDetails?.totalAmount}`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: paymentData.orderNumber,
          actionUrl: '/admin/payments/pending',
          extraData: {
            orderNumber: paymentData.orderNumber,
            customerPhone: paymentData.customerPhone,
            amount: paymentData.orderDetails?.totalAmount,
            pendingCount,
            uploadedAt: paymentData.createdAt || new Date().toISOString()
          }
        }
      );

      return adminNotification;

    } catch (error) {
      console.error('❌ Error sending pending verification notification:', error);
      return { success: false, error: error.message };
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

      // Send to admin
      const adminNotification = await notificationService.sendAdminNotification(
        '💰 Invoice Paid',
        `Invoice #${invoiceData.invoiceNumber} paid. Amount: ₹${paymentData.amount}`,
        {
          category: this.categories.INVOICE,
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
          category: this.categories.INVOICE,
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
        category: this.categories.INVOICE,
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
      const urgency = isFirstReminder ? 'Please complete payment' : 'URGENT: Payment required';

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        orderData.phoneNumber,
        `⏰ ${reminderType} Payment Reminder`,
        `${urgency} for Order #${orderData.orderNumber}. Amount: ₹${orderData.totalPrice}`,
        {
          category: this.categories.PAYMENT,
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
            category: this.categories.PAYMENT,
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
        category: this.categories.PAYMENT,
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
      console.log('📝 Payment notification logged:', {
        title: notification.title,
        recipient: notification.recipientPhone || 'admin',
        type: notification.notificationType,
        orderNumber: notification.orderNumber
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging payment notification:', error);
      return null;
    }
  }
}

// Create singleton instance
const paymentUploadNotify = new PaymentUploadNotification();
export default paymentUploadNotify;