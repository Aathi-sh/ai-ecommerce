// services/notifications/notification-manager.js - COMPLETE FIXED VERSION
import notificationService from './notification-service.js';

class NotificationManager {
  constructor() {
    this.firebaseEnabled = process.env.FIREBASE_ENABLED === 'true';
    this.socketEnabled = false;
    
    // Initialize Socket.IO connection
    this.initializeSocketIO();
    
    console.log('🚀 Notification Manager Initialized:', {
      firebase: this.firebaseEnabled,
      socket: this.socketEnabled
    });
  }

  /**
   * Initialize Socket.IO connection
   */
  initializeSocketIO() {
    try {
      // Check if Socket.IO is available globally (from server.js)
      if (global.io && typeof global.io.of === 'function') {
        this.io = global.io;
        this.socketEnabled = true;
        console.log('✅ Socket.IO connected to Notification Manager');
      } else {
        console.log('⚠️ Socket.IO not available globally');
        this.socketEnabled = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Socket.IO:', error.message);
      this.socketEnabled = false;
    }
  }

  /**
   * Send Socket.IO notification to admin dashboard
   */
  async sendSocketNotification(orderData) {
    if (!this.socketEnabled || !this.io) {
      return { 
        success: false, 
        reason: 'Socket.IO not available or disabled' 
      };
    }

    try {
      console.log('📡 Sending Socket.IO notification...');
      
      // Emit to all connected admin clients in notifications namespace
      this.io.of('/notifications').emit('NEW_ORDER', {
        type: 'NEW_ORDER',
        order: orderData,
        timestamp: new Date().toISOString(),
        priority: 'high'
      });

      // Also emit to QR namespace if needed (for admin dashboards)
      this.io.of('/qr').emit('order-update', {
        type: 'order-update',
        order: orderData,
        timestamp: new Date().toISOString()
      });

      return { 
        success: true, 
        method: 'socket.io',
        namespace: ['/notifications', '/qr']
      };

    } catch (error) {
      console.error('❌ Socket.IO notification failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        method: 'socket.io'
      };
    }
  }

  /**
   * Main method to send notifications through all channels
   */
  async sendNewOrderNotification(orderData) {
    console.log(`🎯 Processing notification for order: ${orderData.orderNumber}`);
    
    const results = {
      firebase: null,
      socket: null,
      dashboard: null
    };

    // 1. Send Firebase Push Notification (for mobile apps)
    if (this.firebaseEnabled) {
      try {
        console.log('🔥 Sending Firebase push notification...');
        results.firebase = await notificationService.sendNewOrderNotification(orderData);
        console.log('✅ Firebase result:', {
          success: results.firebase.success,
          devices: results.firebase.successCount || 0,
          message: results.firebase.message
        });
      } catch (firebaseError) {
        console.error('❌ Firebase notification failed:', firebaseError.message);
        results.firebase = { 
          success: false, 
          error: firebaseError.message,
          channel: 'firebase'
        };
      }
    } else {
      results.firebase = { 
        success: false, 
        reason: 'Firebase disabled in settings',
        channel: 'firebase'
      };
    }

    // 2. Send Socket.IO Notification (for real-time admin dashboard)
    if (this.socketEnabled) {
      try {
        console.log('📡 Sending Socket.IO notification...');
        results.socket = await this.sendSocketNotification(orderData);
        console.log('✅ Socket.IO result:', results.socket.success);
      } catch (socketError) {
        console.error('❌ Socket.IO notification failed:', socketError.message);
        results.socket = { 
          success: false, 
          error: socketError.message,
          channel: 'socket.io'
        };
      }
    } else {
      results.socket = { 
        success: false, 
        reason: 'Socket.IO not initialized',
        channel: 'socket.io'
      };
    }

    // 3. Send Dashboard API Notification (fallback/backup)
    try {
      console.log('📊 Sending dashboard API notification...');
      results.dashboard = await notificationService.sendWhatsAppNotification(orderData);
      console.log('✅ Dashboard API result:', results.dashboard.success);
    } catch (dashboardError) {
      console.error('❌ Dashboard API notification failed:', dashboardError.message);
      results.dashboard = { 
        success: false, 
        error: dashboardError.message,
        channel: 'dashboard-api'
      };
    }

    // Calculate overall success
    const successfulChannels = Object.values(results)
      .filter(channel => channel?.success)
      .length;
    
    const overallSuccess = successfulChannels > 0;
    
    console.log(`📊 Notification Summary for ${orderData.orderNumber}:`, {
      success: overallSuccess ? '✅' : '❌',
      channels: {
        firebase: results.firebase?.success ? '✅' : '❌',
        socket: results.socket?.success ? '✅' : '❌',
        dashboard: results.dashboard?.success ? '✅' : '❌'
      },
      successfulChannels
    });

    return {
      success: overallSuccess,
      orderNumber: orderData.orderNumber,
      timestamp: new Date().toISOString(),
      successfulChannels,
      channels: results,
      summary: {
        firebaseEnabled: this.firebaseEnabled,
        socketEnabled: this.socketEnabled,
        firebaseSuccess: results.firebase?.success || false,
        socketSuccess: results.socket?.success || false,
        dashboardSuccess: results.dashboard?.success || false
      }
    };
  }

  /**
   * Generic method to send any type of notification
   */
  async sendNotification(type, data) {
    console.log(`📤 Sending ${type} notification...`);
    
    switch (type) {
      case 'NEW_ORDER':
        return await this.sendNewOrderNotification(data);
      
      case 'PAYMENT_RECEIVED':
        return await this.sendPaymentNotification(data);
      
      case 'ORDER_STATUS_UPDATE':
        return await this.sendOrderStatusUpdate(data);
      
      case 'LOW_STOCK_ALERT':
        return await this.sendLowStockNotification(data);
      
      case 'TEST':
        return await this.test();
      
      default:
        console.warn(`⚠️ Unknown notification type: ${type}`);
        return { 
          success: false, 
          error: `Unknown notification type: ${type}`,
          timestamp: new Date().toISOString()
        };
    }
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(paymentData) {
    try {
      console.log(`💰 Sending payment notification for order: ${paymentData.orderNumber}`);
      
      // Send Firebase notification
      let firebaseResult = null;
      if (this.firebaseEnabled) {
        firebaseResult = await notificationService.sendPaymentNotification(paymentData);
      }

      // Send Socket.IO notification
      let socketResult = null;
      if (this.socketEnabled && this.io) {
        this.io.of('/notifications').emit('PAYMENT_RECEIVED', {
          type: 'PAYMENT_RECEIVED',
          payment: paymentData,
          timestamp: new Date().toISOString()
        });
        socketResult = { success: true };
      }

      return {
        success: (firebaseResult?.success || socketResult?.success || false),
        paymentNumber: paymentData.orderNumber,
        amount: paymentData.amount,
        firebase: firebaseResult,
        socket: socketResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Payment notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(updateData) {
    try {
      console.log(`📦 Sending order status update: ${updateData.orderNumber} (${updateData.oldStatus} → ${updateData.newStatus})`);
      
      // You can add Firebase/Socket.IO notifications for status updates
      if (this.socketEnabled && this.io) {
        this.io.of('/notifications').emit('ORDER_STATUS_CHANGED', {
          type: 'ORDER_STATUS_CHANGED',
          orderNumber: updateData.orderNumber,
          oldStatus: updateData.oldStatus,
          newStatus: updateData.newStatus,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        orderNumber: updateData.orderNumber,
        statusChange: `${updateData.oldStatus} → ${updateData.newStatus}`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Order status update failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send low stock notification
   */
  async sendLowStockNotification(stockData) {
    try {
      console.log(`📉 Sending low stock alert for: ${stockData.productName}`);
      
      if (this.firebaseEnabled) {
        await notificationService.sendLowStockNotification(stockData);
      }

      if (this.socketEnabled && this.io) {
        this.io.of('/notifications').emit('LOW_STOCK_ALERT', {
          type: 'LOW_STOCK_ALERT',
          product: stockData,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        productName: stockData.productName,
        currentStock: stockData.stock,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Low stock notification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system status
   */
  async getStatus() {
    try {
      const serviceStatus = await notificationService.getNotificationStatus();
      const dashboardHealth = await notificationService.checkDashboardHealth();
      
      return {
        manager: {
          firebaseEnabled: this.firebaseEnabled,
          socketEnabled: this.socketEnabled,
          socketConnected: !!this.io,
          status: 'running'
        },
        service: serviceStatus,
        dashboard: dashboardHealth,
        timestamp: new Date().toISOString(),
        overallStatus: this.socketEnabled && dashboardHealth.healthy ? 'healthy' : 'degraded'
      };

    } catch (error) {
      console.error('❌ Error getting status:', error);
      return {
        manager: {
          firebaseEnabled: this.firebaseEnabled,
          socketEnabled: this.socketEnabled,
          socketConnected: !!this.io,
          status: 'error'
        },
        error: error.message,
        timestamp: new Date().toISOString(),
        overallStatus: 'error'
      };
    }
  }

  /**
   * Test the notification system
   */
  async test() {
    console.log('🧪 Testing notification system...');
    
    const testOrder = {
      orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
      customerName: 'Test Customer',
      customerPhone: '9876543210',
      totalPrice: 1999,
      totalAmount: 1999,
      items: [{ productName: 'Test Product', quantity: 1, price: 1999 }],
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      _id: `test-${Date.now()}`
    };

    const result = await this.sendNewOrderNotification(testOrder);
    
    return {
      test: true,
      orderNumber: testOrder.orderNumber,
      timestamp: new Date().toISOString(),
      result
    };
  }

  /**
   * Enable/disable Firebase notifications
   */
  setFirebaseEnabled(enabled) {
    this.firebaseEnabled = enabled;
    console.log(`🔥 Firebase notifications ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return this.firebaseEnabled;
  }

  /**
   * Enable/disable Socket.IO notifications
   */
  setSocketEnabled(enabled) {
    this.socketEnabled = enabled;
    console.log(`📡 Socket.IO notifications ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return this.socketEnabled;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export for use in server.js to set up Socket.IO
export { NotificationManager };
export default notificationManager;