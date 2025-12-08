/**
 * New Order Notification Service
 * Handles ONLY order-related notifications to admin
 */

class NewOrderNotification {
  constructor() {
    this.category = 'order';
    this.priorities = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    };
    
    this.notificationService = null;
    console.log('🛍️ New Order Notification service initialized');
  }

  /**
   * Lazy load notification service
   */
  async getNotificationService() {
    if (!this.notificationService) {
      const { default: notificationService } = await import("./notification-service.js");
      this.notificationService = notificationService;
    }
    return this.notificationService;
  }

  /**
   * Send notification for new order
   */
  async sendNewOrderNotification(orderData) {
    try {
      console.log('🛍️ Sending new order notification:', {
        orderNumber: orderData.orderNumber,
        customerPhone: orderData.phoneNumber || orderData.customerPhone
      });

      const notificationService = await this.getNotificationService();

      // Format notification data
      const notificationData = {
        title: '🛍️ New Order Received!',
        body: `Order #${orderData.orderNumber} for ₹${orderData.totalPrice || orderData.totalAmount || 0}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: orderData.orderNumber,
        actionUrl: `/admin/orders/${orderData.orderNumber || orderData._id}`,
        extraData: {
          type: 'NEW_ORDER',
          orderId: orderData._id || orderData.orderId,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName || orderData.fullName || 'Customer',
          customerPhone: orderData.phoneNumber || orderData.customerPhone,
          totalAmount: orderData.totalPrice || orderData.totalAmount || 0,
          itemsCount: orderData.items?.length || 0,
          paymentStatus: orderData.paymentStatus || 'pending',
          shippingAddress: orderData.shippingAddress ? 
            (orderData.shippingAddress.substring(0, 50) + '...') : 'Not specified',
          timestamp: new Date().toISOString()
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
        notificationType: 'new_order',
        success: result.success,
        orderNumber: orderData.orderNumber
      });

      return {
        success: result.success,
        orderNumber: orderData.orderNumber,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending new order notification:', error);
      return {
        success: false,
        error: error.message,
        orderNumber: orderData.orderNumber
      };
    }
  }

  /**
   * Send notification when order status changes
   */
  async sendOrderStatusUpdate(orderId, newStatus, previousStatus) {
    try {
      console.log(`🔄 Sending order status update: ${orderId} from ${previousStatus} to ${newStatus}`);

      const notificationService = await this.getNotificationService();

      const statusMessages = {
        'pending': 'is pending',
        'processing': 'is now being processed',
        'confirmed': 'has been confirmed',
        'shipped': 'has been shipped',
        'out_for_delivery': 'is out for delivery',
        'delivered': 'has been delivered',
        'cancelled': 'has been cancelled',
        'refunded': 'has been refunded',
        'failed': 'has failed'
      };

      const statusEmoji = {
        'pending': '⏳',
        'processing': '🔧',
        'confirmed': '✅',
        'shipped': '🚚',
        'out_for_delivery': '📦',
        'delivered': '🎉',
        'cancelled': '❌',
        'refunded': '💸',
        'failed': '❌'
      };

      const message = statusMessages[newStatus] || 'status has been updated';
      const emoji = statusEmoji[newStatus] || '📋';

      const notificationData = {
        title: `${emoji} Order ${newStatus.toUpperCase()}: ${orderId}`,
        body: `Order #${orderId} ${message}.`,
        category: this.category,
        priority: ['cancelled', 'refunded', 'failed'].includes(newStatus) ? this.priorities.HIGH : this.priorities.NORMAL,
        referenceId: orderId,
        actionUrl: `/admin/orders/${orderId}`,
        extraData: {
          type: 'ORDER_STATUS_UPDATE',
          orderId,
          previousStatus,
          newStatus,
          updatedAt: new Date().toISOString()
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
        notificationType: 'order_status_update',
        success: result.success,
        orderId
      });

      return {
        success: result.success,
        orderId,
        status: newStatus,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending order status update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk order notification for multiple orders
   */
  async sendBulkOrdersNotification(orders) {
    try {
      if (!orders || orders.length === 0) {
        return { success: false, error: 'No orders provided' };
      }

      console.log(`📦 Sending bulk orders notification for ${orders.length} orders`);

      const notificationService = await this.getNotificationService();

      const totalAmount = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
      const uniqueCustomers = [...new Set(orders.map(order => order.phoneNumber || order.customerPhone))].filter(Boolean);

      const notificationData = {
        title: `📊 ${orders.length} New Orders Today!`,
        body: `Total value: ₹${totalAmount} from ${uniqueCustomers.length} customers`,
        category: this.category,
        priority: this.priorities.NORMAL,
        actionUrl: '/admin/orders',
        extraData: {
          type: 'BULK_ORDERS',
          orderCount: orders.length,
          totalAmount,
          customerCount: uniqueCustomers.length,
          averageOrderValue: totalAmount / orders.length,
          date: new Date().toISOString().split('T')[0],
          summary: orders.slice(0, 5).map(order => ({
            orderNumber: order.orderNumber || order._id,
            amount: order.totalPrice || order.totalAmount || 0,
            customer: order.phoneNumber || order.customerPhone
          }))
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return {
        success: result.success,
        orderCount: orders.length,
        totalAmount,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending bulk orders notification:', error);
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
      console.log('📝 Order notification logged:', {
        type: notification.notificationType,
        orderNumber: notification.orderNumber || notification.orderId,
        success: notification.success
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging notification:', error);
      return null;
    }
  }

  /**
   * Send order payment status update
   */
  async sendOrderPaymentUpdate(orderData, paymentStatus) {
    try {
      console.log(`💳 Sending order payment update: ${orderData.orderNumber} - ${paymentStatus}`);

      const notificationService = await this.getNotificationService();

      const statusEmoji = {
        'paid': '✅',
        'pending': '⏳',
        'failed': '❌',
        'refunded': '💸',
        'partial': '⚠️'
      };

      const emoji = statusEmoji[paymentStatus] || '💳';

      const notificationData = {
        title: `${emoji} Order Payment ${paymentStatus.toUpperCase()}`,
        body: `Order #${orderData.orderNumber} payment is ${paymentStatus}. Amount: ₹${orderData.totalAmount || orderData.totalPrice}`,
        category: this.category,
        priority: paymentStatus === 'failed' ? this.priorities.HIGH : this.priorities.NORMAL,
        referenceId: orderData.orderNumber,
        actionUrl: `/admin/orders/${orderData.orderNumber}`,
        extraData: {
          type: 'ORDER_PAYMENT_UPDATE',
          orderNumber: orderData.orderNumber,
          orderId: orderData._id,
          paymentStatus,
          amount: orderData.totalAmount || orderData.totalPrice,
          paymentMethod: orderData.paymentMethod,
          customerPhone: orderData.phoneNumber || orderData.customerPhone,
          timestamp: new Date().toISOString()
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return {
        success: result.success,
        orderNumber: orderData.orderNumber,
        paymentStatus,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending order payment update:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const newOrderNotify = new NewOrderNotification();
export default newOrderNotify;