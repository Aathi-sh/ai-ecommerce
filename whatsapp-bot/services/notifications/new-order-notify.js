// services/notifications/new-order-notify.js

class NewOrderNotification {
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

    this.category = this.categories.ORDER;
    console.log('🛍️ New Order Notification service initialized');
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
   * Lazy load API service
   */
  async getApiService() {
    if (!this.apiService) {
      const { default: apiService } = await import('../apiService.js');
      this.apiService = apiService;
    }
    return this.apiService;
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
          customerName: orderData.customerName || 'Customer',
          itemsCount: orderData.items?.length || 0,
          shippingAddress: orderData.shippingAddress?.substring(0, 50) + '...',
          paymentStatus: orderData.paymentStatus || 'pending'
        }
      };

      // Send to admin
      const adminResult = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // Send to customer if they have app
      const customerResult = await notificationService.sendCustomerNotification(
        orderData.phoneNumber,
        '🎉 Order Confirmed!',
        `Your order #${orderData.orderNumber} has been received. We'll notify you once it's processed.`,
        {
          category: this.category,
          priority: this.priorities.NORMAL,
          referenceId: orderData.orderNumber,
          actionUrl: `/orders/${orderData.orderNumber}`,
          extraData: {
            orderNumber: orderData.orderNumber,
            totalAmount: orderData.totalPrice,
            estimatedDelivery: '3-5 business days'
          }
        }
      );

      // Log notification
      await this.logNotification({
        ...notificationData,
        recipientPhone: orderData.phoneNumber,
        orderNumber: orderData.orderNumber,
        notificationType: 'new_order',
        adminNotified: adminResult.success,
        customerNotified: customerResult.success
      });

      return {
        success: adminResult.success || customerResult.success,
        adminNotification: adminResult,
        customerNotification: customerResult,
        orderNumber: orderData.orderNumber
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

      const apiService = await this.getApiService();
      const notificationService = await this.getNotificationService();

      const order = await apiService.getOrderById(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const statusMessages = {
        'processing': 'is now being processed',
        'confirmed': 'has been confirmed',
        'shipped': 'has been shipped',
        'out_for_delivery': 'is out for delivery',
        'delivered': 'has been delivered',
        'cancelled': 'has been cancelled'
      };

      const statusEmoji = {
        'processing': '🔧',
        'confirmed': '✅',
        'shipped': '🚚',
        'out_for_delivery': '📦',
        'delivered': '🎉',
        'cancelled': '❌'
      };

      const message = statusMessages[newStatus] || 'status has been updated';
      const emoji = statusEmoji[newStatus] || '📋';

      // Send to customer
      const customerNotification = await notificationService.sendCustomerNotification(
        order.phoneNumber,
        `${emoji} Order Update: ${newStatus.toUpperCase()}`,
        `Your order #${order.orderNumber} ${message}.`,
        {
          category: this.category,
          priority: newStatus === 'cancelled' ? this.priorities.HIGH : this.priorities.NORMAL,
          referenceId: order.orderNumber,
          actionUrl: `/orders/${order.orderNumber}`,
          extraData: {
            previousStatus,
            newStatus,
            updatedAt: new Date().toISOString()
          }
        }
      );

      // Send to admin for important status changes
      if (['cancelled', 'delivered'].includes(newStatus)) {
        await notificationService.sendAdminNotification(
          `📊 Order ${newStatus.toUpperCase()}: ${order.orderNumber}`,
          `Order #${order.orderNumber} has been marked as ${newStatus}`,
          {
            category: this.category,
            priority: this.priorities.NORMAL,
            referenceId: order.orderNumber,
            actionUrl: `/admin/orders/${order.orderNumber}`
          }
        );
      }

      return {
        success: customerNotification.success,
        orderNumber: order.orderNumber,
        status: newStatus,
        customerNotified: customerNotification.success
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
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
          productName: product.productName,
          currentStock,
          threshold,
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
        notificationType: 'low_stock',
        threshold,
        productId: product._id
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
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
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
        productId: product._id
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending out of stock notification:', error);
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
          date: new Date().toISOString().split('T')[0]
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
   * Send notification when stock is updated
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
        category: this.category,
        priority: this.priorities.NORMAL,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
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
        productId: product._id
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending stock updated notification:', error);
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
      console.log('📝 Notification logged:', {
        title: notification.title,
        recipient: notification.recipientPhone,
        category: notification.category
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

      const apiService = await this.getApiService();
      const products = await apiService.getProducts();
      
      if (!products || products.length === 0) {
        console.log('📦 No products found');
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
      if (notifications.length > 1) {
        const notificationService = await this.getNotificationService();
        
        await notificationService.sendAdminNotification(
          `📦 Stock Status Report (${notifications.length} issues)`,
          `Critical: ${criticalStockProducts.length}, Low: ${lowStockProducts.length - criticalStockProducts.length}, Out of Stock: ${outOfStockProducts.length}`,
          {
            category: this.category,
            priority: this.priorities.NORMAL,
            actionUrl: '/admin/products/stock',
            extraData: {
              reportDate: new Date().toISOString(),
              criticalStock: criticalStockProducts.length,
              lowStock: lowStockProducts.length,
              outOfStock: outOfStockProducts.length
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