// services/notifications/new-order-notify.js

/**
 * New Order Notification Service
 * Handles all order-related notifications to admin
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
      const { default: notificationService } = await import("./notifictaion-service.js");
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
        customerPhone: orderData.phoneNumber
      });

      const notificationService = await this.getNotificationService();

      // Format notification data
      const notificationData = {
        title: '🛍️ New Order Received!',
        body: `Order #${orderData.orderNumber} for ₹${orderData.totalPrice}`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: orderData.orderNumber,
        actionUrl: `/admin/orders/${orderData.orderNumber}`,
        extraData: {
          orderId: orderData._id || orderData.orderNumber,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName || 'Customer',
          customerPhone: orderData.phoneNumber,
          totalAmount: orderData.totalPrice,
          itemsCount: orderData.items?.length || 0,
          paymentStatus: orderData.paymentStatus || 'pending',
          shippingAddress: orderData.shippingAddress?.substring(0, 50) + '...',
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

      // In production, fetch order details from database
      // const order = await Order.findById(orderId);
      const orderNumber = orderId; // For now, assume orderId is orderNumber

      const statusMessages = {
        'processing': 'is now being processed',
        'confirmed': 'has been confirmed',
        'shipped': 'has been shipped',
        'out_for_delivery': 'is out for delivery',
        'delivered': 'has been delivered',
        'cancelled': 'has been cancelled',
        'refunded': 'has been refunded'
      };

      const statusEmoji = {
        'processing': '🔧',
        'confirmed': '✅',
        'shipped': '🚚',
        'out_for_delivery': '📦',
        'delivered': '🎉',
        'cancelled': '❌',
        'refunded': '💸'
      };

      const message = statusMessages[newStatus] || 'status has been updated';
      const emoji = statusEmoji[newStatus] || '📋';

      const notificationData = {
        title: `${emoji} Order ${newStatus.toUpperCase()}: ${orderNumber}`,
        body: `Order #${orderNumber} ${message}.`,
        category: this.category,
        priority: ['cancelled', 'refunded'].includes(newStatus) ? this.priorities.HIGH : this.priorities.NORMAL,
        referenceId: orderNumber,
        actionUrl: `/admin/orders/${orderNumber}`,
        extraData: {
          orderNumber,
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
        orderNumber
      });

      return {
        success: result.success,
        orderNumber,
        status: newStatus,
        notification: result
      };

    } catch (error) {
      console.error('❌ Error sending order status update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send low stock alert to admin
   */
  async sendLowStockAlert(product, currentStock, threshold = 5) {
    try {
      console.log(`📉 Sending low stock alert for ${product.productName}: ${currentStock} left`);

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '⚠️ Low Stock Alert!',
        body: `${product.productName} is running low. Only ${currentStock} units left.`,
        category: 'stock',
        priority: currentStock <= 2 ? this.priorities.HIGH : this.priorities.NORMAL,
        referenceId: product._id || product.productId,
        actionUrl: `/admin/products/${product._id || product.productId}`,
        extraData: {
          productId: product._id || product.productId,
          productName: product.productName,
          currentStock,
          threshold,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized',
          alertLevel: currentStock <= 2 ? 'critical' : 'warning'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'low_stock',
        success: result.success,
        productId: product._id || product.productId
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending low stock alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send out of stock notification
   */
  async sendOutOfStockNotification(product) {
    try {
      console.log(`🚫 Sending out of stock notification for ${product.productName}`);

      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '🚫 Product Out of Stock!',
        body: `${product.productName} is now out of stock. Please restock.`,
        category: 'stock',
        priority: this.priorities.HIGH,
        referenceId: product._id || product.productId,
        actionUrl: `/admin/products/${product._id || product.productId}`,
        extraData: {
          productId: product._id || product.productId,
          productName: product.productName,
          lastStock: product.stock || 0,
          sku: product.sku || 'N/A',
          category: product.category || 'Uncategorized'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'out_of_stock',
        success: result.success,
        productId: product._id || product.productId
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending out of stock notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send stock updated notification
   */
  async sendStockUpdatedNotification(product, previousStock, newStock, updatedBy = 'system') {
    try {
      const notificationService = await this.getNotificationService();

      const stockChange = newStock - previousStock;
      const action = stockChange > 0 ? 'restocked' : 'sold';
      const changeText = Math.abs(stockChange);

      const notificationData = {
        title: `📦 Stock ${stockChange > 0 ? 'Added' : 'Updated'}: ${product.productName}`,
        body: `${changeText} units ${action}. Now: ${newStock} units.`,
        category: 'stock',
        priority: this.priorities.NORMAL,
        referenceId: product._id || product.productId,
        actionUrl: `/admin/products/${product._id || product.productId}`,
        extraData: {
          productId: product._id || product.productId,
          productName: product.productName,
          previousStock,
          newStock,
          change: stockChange,
          updatedBy,
          updatedAt: new Date().toISOString(),
          stockStatus: newStock <= 2 ? 'critical' : 
                      newStock <= 5 ? 'low' : 'good'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'stock_updated',
        success: result.success,
        productId: product._id || product.productId
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending stock updated notification:', error);
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

      const totalAmount = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const uniqueCustomers = [...new Set(orders.map(order => order.phoneNumber))];

      const notificationData = {
        title: `📊 ${orders.length} New Orders Today!`,
        body: `Total value: ₹${totalAmount} from ${uniqueCustomers.length} customers`,
        category: this.category,
        priority: this.priorities.NORMAL,
        actionUrl: '/admin/orders',
        extraData: {
          orderCount: orders.length,
          totalAmount,
          customerCount: uniqueCustomers.length,
          averageOrderValue: totalAmount / orders.length,
          date: new Date().toISOString().split('T')[0],
          summary: orders.map(order => ({
            orderNumber: order.orderNumber,
            amount: order.totalPrice,
            customer: order.phoneNumber
          }))
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return result;

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
        orderNumber: notification.orderNumber,
        success: notification.success
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging notification:', error);
      return null;
    }
  }

  /**
   * Schedule daily stock check
   */
  scheduleDailyStockCheck() {
    // Schedule at 9 AM daily
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(9, 0, 0, 0);
    
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilCheck = targetTime - now;
    
    setTimeout(async () => {
      await this.checkAndSendLowStockNotifications();
      // Schedule next check (24 hours later)
      setInterval(async () => {
        await this.checkAndSendLowStockNotifications();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilCheck);
    
    console.log(`⏰ Daily stock check scheduled for ${targetTime.toLocaleTimeString()}`);
  }

  /**
   * Check and send low stock notifications
   */
  async checkAndSendLowStockNotifications() {
    try {
      console.log('🔍 Checking for low stock products...');

      // In production, fetch products from database
      // const products = await Product.find({});
      const products = []; // Placeholder
      
      if (!products || products.length === 0) {
        console.log('📦 No products found for stock check');
        return { checked: 0, notified: 0 };
      }

      const lowStockThreshold = 5;
      const criticalStockThreshold = 2;

      const lowStockProducts = products.filter(product => {
        const stock = product.stock || 0;
        return stock > 0 && stock <= lowStockThreshold;
      });

      const criticalStockProducts = lowStockProducts.filter(
        product => (product.stock || 0) <= criticalStockThreshold
      );

      const outOfStockProducts = products.filter(
        product => (product.stock || 0) === 0
      );

      console.log(`📊 Stock Analysis:`, {
        totalProducts: products.length,
        lowStock: lowStockProducts.length,
        criticalStock: criticalStockProducts.length,
        outOfStock: outOfStockProducts.length
      });

      // Send notifications
      const notifications = [];

      // Send critical stock alerts first
      for (const product of criticalStockProducts) {
        const result = await this.sendLowStockAlert(product, product.stock, criticalStockThreshold);
        notifications.push({
          product: product.productName,
          stock: product.stock,
          type: 'critical',
          success: result.success
        });
      }

      // Send low stock alerts
      for (const product of lowStockProducts.filter(
        p => !criticalStockProducts.includes(p)
      )) {
        const result = await this.sendLowStockAlert(product, product.stock, lowStockThreshold);
        notifications.push({
          product: product.productName,
          stock: product.stock,
          type: 'low',
          success: result.success
        });
      }

      // Send out of stock notifications
      for (const product of outOfStockProducts) {
        const result = await this.sendOutOfStockNotification(product);
        notifications.push({
          product: product.productName,
          stock: product.stock,
          type: 'out_of_stock',
          success: result.success
        });
      }

      // Send summary if there are multiple notifications
      if (notifications.length > 0) {
        const notificationService = await this.getNotificationService();
        
        await notificationService.sendAdminNotification(
          `📦 Stock Status Report (${notifications.length} issues)`,
          `Critical: ${criticalStockProducts.length}, Low: ${lowStockProducts.length - criticalStockProducts.length}, Out of Stock: ${outOfStockProducts.length}`,
          {
            category: 'stock',
            priority: this.priorities.NORMAL,
            actionUrl: '/admin/products/stock',
            extraData: {
              reportDate: new Date().toISOString(),
              criticalStock: criticalStockProducts.length,
              lowStock: lowStockProducts.length,
              outOfStock: outOfStockProducts.length,
              details: notifications
            }
          }
        );
      }

      return {
        success: true,
        checked: products.length,
        notified: notifications.length,
        notifications,
        summary: {
          lowStock: lowStockProducts.length,
          criticalStock: criticalStockProducts.length,
          outOfStock: outOfStockProducts.length
        }
      };

    } catch (error) {
      console.error('❌ Error checking low stock:', error);
      return {
        success: false,
        error: error.message,
        checked: 0,
        notified: 0
      };
    }
  }
}

// Create singleton instance
const newOrderNotify = new NewOrderNotification();
export default newOrderNotify;