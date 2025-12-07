// services/notifications/index.js

/**
 * Main export file for all notification services
 * Centralized export for easier imports
 */

import notificationManager from './notification-manager.js';
import notificationService from './notification-service.js';
import newOrderNotify from './new-order-notify.js';
import paymentUploadNotify from './payment-upload-notify.js';
import lowStockNotify from './low-stock-notify.js';
import invoiceSendNotify from './invoice-send-notify.js';

// Export all services as named exports
export {
  notificationManager,
  notificationService,
  newOrderNotify,
  paymentUploadNotify,
  lowStockNotify,
  invoiceSendNotify
};

// Also export notificationManager as default for backward compatibility
export default notificationManager;