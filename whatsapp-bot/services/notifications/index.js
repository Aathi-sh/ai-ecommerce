// Main export file for all notification services
import notificationManager from './notification-manager.js';
import newOrderNotify from './new-order-notify.js';
import paymentUploadNotify from './payment-upload-notify.js';
import lowStockNotify from './low-stock-notify.js';
import invoiceSendNotify from './invoice-send-notify.js';

// Create and configure notification service instance
const notificationService = new notificationManager();

// Register all notification handlers
notificationService.registerHandler('new-order', newOrderNotify);
notificationService.registerHandler('payment-upload', paymentUploadNotify);
notificationService.registerHandler('low-stock', lowStockNotify);
notificationService.registerHandler('invoice-send', invoiceSendNotify);

// Export all services
export {
  notificationService,
  newOrderNotify,
  paymentUploadNotify,
  lowStockNotify,
  invoiceSendNotify
};

// Export default as notification service
export default notificationService;