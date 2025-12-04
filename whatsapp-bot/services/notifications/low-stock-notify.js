// services/notifications/low-stock-notify.js

class LowStockNotification {
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

    this.category = this.categories.STOCK;
    this.lowStockThreshold = 5; // Default threshold
    this.criticalStockThreshold = 2; // Critical threshold
    console.log('📦 Low Stock Notification service initialized');
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

      const lowStockProducts = products.filter(product => {
        const stock = product.stock || 0;
        return stock > 0 && stock <= this.lowStockThreshold;
      });

      const criticalStockProducts = lowStockProducts.filter(
        product => (product.stock || 0) <= this.criticalStockThreshold
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
        const result = await this.sendCriticalStockAlert(product);
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
        const result = await this.sendLowStockAlert(product);
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
        await this.sendStockSummaryNotification(
          lowStockProducts.length,
          criticalStockProducts.length,
          outOfStockProducts.length
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

  /**
   * Send critical stock alert
   */
  async sendCriticalStockAlert(product) {
    try {
      const notificationService = await this.getNotificationService();
      const currentStock = product.stock || 0;
      
      const notificationData = {
        title: '🚨 CRITICAL STOCK ALERT!',
        body: `${product.productName} has only ${currentStock} units left!`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        sound: 'alert',
        extraData: {
          productId: product._id,
          productName: product.productName,
          currentStock,
          threshold: this.criticalStockThreshold,
          sku: product.sku || 'N/A',
          price: product.price || 0,
          urgency: 'URGENT',
          requiredAction: 'RESTOCK IMMEDIATELY'
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      await this.logNotification({
        ...notificationData,
        notificationType: 'critical_stock',
        productId: product._id
      });

      return result;

    } catch (error) {
      console.error('❌ Error sending critical stock alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send low stock alert
   */
  async sendLowStockAlert(product) {
    try {
      const notificationService = await this.getNotificationService();
      const currentStock = product.stock || 0;
      
      const notificationData = {
        title: '⚠️ Low Stock Warning',
        body: `${product.productName} is running low. Only ${currentStock} units left.`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
          productName: product.productName,
          currentStock,
          threshold: this.lowStockThreshold,
          sku: product.sku || 'N/A',
          price: product.price || 0,
          category: product.category || 'Uncategorized',
          suggestedReorder: Math.max(10, currentStock * 3) // Suggest reorder quantity
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
      const notificationService = await this.getNotificationService();

      const notificationData = {
        title: '🚫 Product Out of Stock',
        body: `${product.productName} is now out of stock. No units available.`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
          productName: product.productName,
          lastStockDate: new Date().toISOString(),
          sku: product.sku || 'N/A',
          price: product.price || 0,
          category: product.category || 'Uncategorized',
          averageSales: 'N/A',
          suggestedReorder: 20 // Suggested reorder quantity
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      // If product is popular, send to multiple admins
      if (product.isPopular || product.category === 'bestseller') {
        await this.sendBroadcastOutOfStock(product);
      }

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
   * Send broadcast out of stock for important products
   */
  async sendBroadcastOutOfStock(product) {
    try {
      const notificationService = await this.getNotificationService();
      
      // Get all admin users
      const adminTokens = process.env.ADMIN_FCM_TOKENS 
        ? process.env.ADMIN_FCM_TOKENS.split(',') 
        : [];

      if (adminTokens.length <= 1) return; // Only broadcast if multiple admins

      const notificationData = {
        title: '📢 IMPORTANT: Product Out of Stock',
        body: `${product.productName} (Bestseller) is out of stock. Affects sales.`,
        category: this.category,
        priority: this.priorities.HIGH,
        referenceId: product._id,
        actionUrl: `/admin/products/${product._id}`,
        extraData: {
          productId: product._id,
          productName: product.productName,
          importance: 'HIGH',
          impact: 'Sales affected',
          actionRequired: 'Priority restocking'
        }
      };

      const result = await notificationService.sendPushNotification(
        adminTokens,
        notificationData
      );

      return result;

    } catch (error) {
      console.error('❌ Error sending broadcast out of stock:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send stock summary notification
   */
  async sendStockSummaryNotification(lowStockCount, criticalStockCount, outOfStockCount) {
    try {
      if (lowStockCount + criticalStockCount + outOfStockCount === 0) {
        return { success: false, message: 'No stock issues to report' };
      }

      const notificationService = await this.getNotificationService();
      const totalIssues = lowStockCount + criticalStockCount + outOfStockCount;
      const message = `📊 Stock Summary: ${criticalStockCount} critical, ${lowStockCount} low, ${outOfStockCount} out of stock`;

      const notificationData = {
        title: `📦 Stock Status Report (${totalIssues} issues)`,
        body: message,
        category: this.category,
        priority: this.priorities.NORMAL,
        actionUrl: '/admin/products/stock',
        extraData: {
          reportDate: new Date().toISOString(),
          criticalStock: criticalStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          totalProducts: 'N/A',
          stockHealth: this.calculateStockHealth(lowStockCount, criticalStockCount, outOfStockCount)
        }
      };

      const result = await notificationService.sendAdminNotification(
        notificationData.title,
        notificationData.body,
        notificationData
      );

      return result;

    } catch (error) {
      console.error('❌ Error sending stock summary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate stock health percentage
   */
  calculateStockHealth(lowStock, criticalStock, outOfStock) {
    const totalIssues = lowStock + criticalStock + outOfStock;
    if (totalIssues === 0) return 'Excellent';
    
    const score = 100 - (criticalStock * 10 + lowStock * 5 + outOfStock * 15);
    
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
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
          stockStatus: newStock <= this.criticalStockThreshold ? 'critical' : 
                      newStock <= this.lowStockThreshold ? 'low' : 'good'
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
    
    setTimeout(() => {
      this.checkAndSendLowStockNotifications();
      // Schedule next check (24 hours later)
      setInterval(() => {
        this.checkAndSendLowStockNotifications();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilCheck);
    
    console.log(`⏰ Daily stock check scheduled for ${targetTime.toLocaleTimeString()}`);
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
      console.log('📝 Stock notification logged:', {
        title: notification.title,
        product: notification.extraData?.productName,
        category: notification.category,
        type: notification.notificationType
      });

      return logEntry;

    } catch (error) {
      console.error('❌ Error logging stock notification:', error);
      return null;
    }
  }

  /**
   * Send automatic stock check
   */
  async performAutomaticStockCheck() {
    try {
      console.log('🤖 Performing automatic stock check...');
      const result = await this.checkAndSendLowStockNotifications();
      
      if (result.success) {
        console.log(`✅ Automatic stock check completed: ${result.checked} products checked, ${result.notified} notifications sent`);
      } else {
        console.error('❌ Automatic stock check failed:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error in automatic stock check:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update stock thresholds
   */
  updateThresholds(lowThreshold = 5, criticalThreshold = 2) {
    this.lowStockThreshold = lowThreshold;
    this.criticalStockThreshold = criticalThreshold;
    console.log(`📊 Stock thresholds updated: Low=${lowThreshold}, Critical=${criticalThreshold}`);
  }

  /**
   * Get current stock statistics
   */
  async getStockStatistics() {
    try {
      const apiService = await this.getApiService();
      const products = await apiService.getProducts();
      
      if (!products || products.length === 0) {
        return {
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          criticalStock: 0,
          outOfStock: 0,
          health: 'Unknown'
        };
      }

      const inStock = products.filter(p => (p.stock || 0) > this.lowStockThreshold).length;
      const lowStock = products.filter(p => {
        const stock = p.stock || 0;
        return stock > this.criticalStockThreshold && stock <= this.lowStockThreshold;
      }).length;
      const criticalStock = products.filter(p => {
        const stock = p.stock || 0;
        return stock > 0 && stock <= this.criticalStockThreshold;
      }).length;
      const outOfStock = products.filter(p => (p.stock || 0) === 0).length;

      const health = this.calculateStockHealth(lowStock, criticalStock, outOfStock);

      return {
        totalProducts: products.length,
        inStock,
        lowStock,
        criticalStock,
        outOfStock,
        health,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting stock statistics:', error);
      return {
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        criticalStock: 0,
        outOfStock: 0,
        health: 'Error',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const lowStockNotify = new LowStockNotification();
export default lowStockNotify;