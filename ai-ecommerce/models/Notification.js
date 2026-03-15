// lib/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    // ===== COMPANY ISOLATION (SAAS) =====
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required for multi-tenancy'],
      index: true
    },
    
    // ===== BASIC INFO =====
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: [
          'NEW_ORDER',
          'PAYMENT_RECEIVED', 
          'PAYMENT_VERIFIED',
          'LOW_STOCK_ALERT',
          'ORDER_STATUS_CHANGED',
          'SYSTEM_ALERT',
          'ADMIN_ALERT',
          'TEST_NOTIFICATION',
          'BOOKING_CONFIRMED',
          'BOOKING_CANCELLED',
          'USER_REGISTERED',
          'WHATSAPP_DISCONNECTED',
          'SUBSCRIPTION_EXPIRING',
          'LIMIT_REACHED'
        ],
        message: '{VALUE} is not a valid notification type'
      },
      index: true
    },
    
    // ===== ORDER REFERENCE =====
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      sparse: true,
      index: true
    },
    orderNumber: {
      type: String,
      sparse: true,
      index: true,
      trim: true
    },
    
    // ===== CUSTOMER INFO =====
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    customerPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 12;
        },
        message: 'Please enter a valid phone number'
      }
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    
    // ===== FINANCIAL INFO =====
    totalAmount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
      uppercase: true
    },
    
    // ===== NOTIFICATION CONTENT =====
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    
    // ===== PRIORITY & STATUS =====
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
      index: true
    },
    
    // ===== SOURCE INFO =====
    source: {
      type: String,
      default: 'whatsapp-bot',
      enum: ['whatsapp-bot', 'dashboard', 'system', 'api', 'cron', 'webhook'],
      index: true
    },
    channel: {
      type: String,
      enum: ['dashboard', 'push', 'whatsapp', 'email', 'sms'],
      default: 'dashboard'
    },
    
    // ===== ACTION BUTTONS =====
    actions: [{
      label: {
        type: String,
        required: true
      },
      url: String,
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET'
      },
      icon: String,
      primary: {
        type: Boolean,
        default: false
      }
    }],
    
    // ===== LINK TO RESOURCE =====
    link: {
      to: String,
      text: String,
      external: {
        type: Boolean,
        default: false
      }
    },
    
    // ===== ICON & IMAGE =====
    icon: String,
    image: String,
    
    // ===== METADATA (Flexible) =====
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // ===== TIMESTAMPS =====
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== ERROR HANDLING =====
    error: {
      message: String,
      code: String,
      stack: String
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    
    // ===== USER ACTION TRACKING =====
    actionTaken: {
      type: Boolean,
      default: false
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actionAt: Date,
    actionType: String,
    
    // ===== READ RECEIPTS (Multiple Users) =====
    readByUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // ===== GROUP NOTIFICATIONS =====
    isGrouped: {
      type: Boolean,
      default: false
    },
    groupId: {
      type: String,
      sparse: true,
      index: true
    },
    groupCount: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // ===== EXPIRY =====
    expiresAt: {
      type: Date,
      index: true
    },
    
    // ===== SCHEDULED NOTIFICATIONS =====
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduledFor: Date,
    
    // ===== BULK NOTIFICATIONS =====
    isBulk: {
      type: Boolean,
      default: false
    },
    bulkId: {
      type: String,
      sparse: true
    },
    recipientCount: {
      type: Number,
      default: 1
    },
    
    // ===== AUDIT TRAIL (Like in Company Model) =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    createdVia: {
      type: String,
      enum: ['system', 'api', 'dashboard', 'webhook', 'cron'],
      default: 'system'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedVia: {
      type: String,
      enum: ['system', 'api', 'dashboard', 'webhook', 'cron']
    },
    
    // ===== SOFT DELETE (Like in Company Model) =====
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedVia: {
      type: String,
      enum: ['system', 'api', 'dashboard', 'webhook', 'cron']
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // ===== RESTORE INFO =====
    restoredAt: Date,
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== TAGS & CATEGORIES =====
    tags: [{
      type: String,
      trim: true
    }],
    category: String,
    
    // ===== IMPORTANCE FLAGS =====
    isImportant: {
      type: Boolean,
      default: false
    },
    isStarred: {
      type: Boolean,
      default: false
    },
    
    // ===== NOTIFICATION PREFERENCES =====
    requiresAcknowledgment: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // ===== NOTIFICATION TEMPLATE =====
    templateId: String,
    templateData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    
    // ===== LOCALIZATION =====
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'gu', 'mr']
    },
    
    // ===== CUSTOM DATA =====
    customData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============== INDEXES ==============
NotificationSchema.index({ companyId: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, priority: 1, createdAt: -1 });
NotificationSchema.index({ companyId: 1, orderNumber: 1 });
NotificationSchema.index({ companyId: 1, 'readByUsers.user': 1 });
NotificationSchema.index({ companyId: 1, isDeleted: 1 });
NotificationSchema.index({ companyId: 1, expiresAt: 1 });
NotificationSchema.index({ companyId: 1, scheduledFor: 1 });
NotificationSchema.index({ bulkId: 1 });
NotificationSchema.index({ groupId: 1 });

// ============== VIRTUAL PROPERTIES (Like in Company Model) ==============

// Virtual for time ago
NotificationSchema.virtual('timeSince').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
});

// Virtual for is read
NotificationSchema.virtual('isRead').get(function() {
  return this.status === 'read' || this.readAt !== null;
});

// Virtual for formatted amount
NotificationSchema.virtual('formattedAmount').get(function() {
  if (!this.totalAmount) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency
  }).format(this.totalAmount);
});

// Virtual for audit info (Like in Company Model)
NotificationSchema.virtual('auditInfo').get(function() {
  return {
    created: {
      at: this.createdAt,
      by: this.createdBy,
      via: this.createdVia
    },
    updated: {
      at: this.updatedAt,
      by: this.updatedBy,
      via: this.updatedVia
    },
    deleted: {
      at: this.deletedAt,
      by: this.deletedBy,
      via: this.deletedVia
    },
    restored: {
      at: this.restoredAt,
      by: this.restoredBy
    }
  };
});

// Virtual for acknowledgment status
NotificationSchema.virtual('acknowledgmentStatus').get(function() {
  if (!this.requiresAcknowledgment) return 'not_required';
  if (this.acknowledgedAt) return 'acknowledged';
  return 'pending';
});

// ============== PRE-SAVE MIDDLEWARE ==============
NotificationSchema.pre('save', function(next) {
  // Auto-set sentAt when status becomes 'sent'
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  // Auto-set deliveredAt when status becomes 'delivered'
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  // Auto-set readAt when status becomes 'read'
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Auto-set isDeleted flag
  if (this.deletedAt && !this.isDeleted) {
    this.isDeleted = true;
  }
  
  // Set expiry for notifications (default 30 days)
  if (!this.expiresAt && !this.isScheduled) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiresAt = expiryDate;
  }
  
  // Ensure companyId is set
  if (!this.companyId) {
    throw new Error('Company ID is required for notification');
  }
  
  next();
});

// ============== STATIC METHODS (Like in Company Model) ==============

/**
 * Get unread count for a company
 */
NotificationSchema.statics.getUnreadCount = async function(companyId, userId = null) {
  const query = {
    companyId,
    isDeleted: false,
    status: { $nin: ['read', 'failed'] }
  };
  
  if (userId) {
    query['readByUsers.user'] = { $ne: userId };
  }
  
  return this.countDocuments(query);
};

/**
 * Get notifications for company with pagination
 */
NotificationSchema.statics.getForCompany = async function(companyId, options = {}) {
  const {
    limit = 50,
    page = 1,
    type,
    status,
    priority,
    search,
    startDate,
    endDate,
    unreadOnly = false,
    userId = null,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { companyId, isDeleted: false };
  
  // Apply filters
  if (type && type !== 'all') query.type = type;
  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;
  
  if (unreadOnly && userId) {
    query.$or = [
      { 'readByUsers.user': { $ne: userId } },
      { readByUsers: { $size: 0 } }
    ];
    query.status = { $ne: 'read' };
  }
  
  // Search
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  // Build sort
  const sort = { [sortBy]: sortOrder };
  if (sortBy !== 'createdAt') {
    sort.createdAt = -1;
  }
  
  // Get notifications and count
  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('customerId', 'name email phone')
      .populate('orderId', 'orderNumber totalAmount')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get notification statistics
 */
NotificationSchema.statics.getStats = async function(companyId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        createdAt: { $gte: startDate },
        isDeleted: false
      }
    },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $in: ['$status', ['pending', 'sent', 'delivered']] }, 1, 0] }
              },
              read: {
                $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
              },
              failed: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
              },
              urgent: {
                $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
              },
              high: {
                $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
              }
            }
          }
        ],
        byType: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        byPriority: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          }
        ],
        bySource: [
          {
            $group: {
              _id: '$source',
              count: { $sum: 1 }
            }
          }
        ],
        dailyTrend: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ],
        avgResponseTime: [
          {
            $match: { readAt: { $exists: true } }
          },
          {
            $project: {
              responseTime: {
                $divide: [
                  { $subtract: ['$readAt', '$createdAt'] },
                  1000 * 60 // Convert to minutes
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              average: { $avg: '$responseTime' },
              min: { $min: '$responseTime' },
              max: { $max: '$responseTime' }
            }
          }
        ]
      }
    }
  ]);
  
  return {
    overview: stats[0]?.overview[0] || { total: 0, unread: 0, read: 0, failed: 0, urgent: 0, high: 0 },
    byType: stats[0]?.byType || [],
    byPriority: stats[0]?.byPriority || [],
    bySource: stats[0]?.bySource || [],
    dailyTrend: stats[0]?.dailyTrend || [],
    avgResponseTime: stats[0]?.avgResponseTime[0] || { average: 0, min: 0, max: 0 },
    period: { days, startDate }
  };
};

/**
 * Mark as read for a user
 */
NotificationSchema.statics.markAsRead = async function(notificationId, userId, companyId) {
  const notification = await this.findOne({ 
    _id: notificationId, 
    companyId,
    isDeleted: false 
  });
  
  if (!notification) return null;
  
  // Add to readByUsers if not already there
  const alreadyRead = notification.readByUsers.some(
    r => r.user && r.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    notification.readByUsers.push({ user: userId, readAt: new Date() });
  }
  
  notification.status = 'read';
  notification.readAt = new Date();
  notification.readBy = userId;
  notification.updatedBy = userId;
  notification.updatedVia = 'dashboard';
  
  return notification.save();
};

/**
 * Mark all as read for a company
 */
NotificationSchema.statics.markAllAsRead = async function(companyId, userId) {
  const result = await this.updateMany(
    {
      companyId,
      'readByUsers.user': { $ne: userId },
      status: { $ne: 'read' },
      isDeleted: false
    },
    {
      $push: { readByUsers: { user: userId, readAt: new Date() } },
      $set: {
        status: 'read',
        readAt: new Date(),
        readBy: userId,
        updatedBy: userId,
        updatedVia: 'dashboard',
        updatedAt: new Date()
      }
    }
  );
  
  return result;
};

/**
 * Create notification from order
 */
NotificationSchema.statics.createFromOrder = async function(order, type = 'NEW_ORDER', createdBy = null) {
  const notificationData = {
    companyId: order.companyId,
    type,
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.phoneNumber,
    customerEmail: order.customerEmail,
    totalAmount: order.totalAmount,
    currency: order.currency || 'INR',
    title: this.getTitleForType(type, order),
    message: this.getMessageForType(type, order),
    priority: type === 'NEW_ORDER' ? 'high' : 'normal',
    source: 'whatsapp-bot',
    channel: 'dashboard',
    createdBy,
    createdVia: 'system',
    metadata: {
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      itemsCount: order.items?.length || 0
    },
    link: {
      to: `/orders/${order._id}`,
      text: 'View Order'
    },
    actions: [
      {
        label: 'View Order',
        url: `/orders/${order._id}`,
        method: 'GET',
        primary: true
      },
      {
        label: 'Update Status',
        url: `/api/orders/${order._id}/status`,
        method: 'PUT',
        primary: false
      }
    ]
  };
  
  return this.create(notificationData);
};

/**
 * Get title for notification type
 */
NotificationSchema.statics.getTitleForType = function(type, data = {}) {
  const titles = {
    'NEW_ORDER': '🛍️ New Order Received',
    'PAYMENT_RECEIVED': '💰 Payment Received',
    'PAYMENT_VERIFIED': '✅ Payment Verified',
    'LOW_STOCK_ALERT': '📦 Low Stock Alert',
    'ORDER_STATUS_CHANGED': '📦 Order Status Updated',
    'BOOKING_CONFIRMED': '📅 Booking Confirmed',
    'BOOKING_CANCELLED': '❌ Booking Cancelled',
    'USER_REGISTERED': '👤 New User Registered',
    'SYSTEM_ALERT': '⚙️ System Alert',
    'WHATSAPP_DISCONNECTED': '📱 WhatsApp Disconnected',
    'SUBSCRIPTION_EXPIRING': '⚠️ Subscription Expiring Soon',
    'LIMIT_REACHED': '🚫 Limit Reached',
    'TEST_NOTIFICATION': '🧪 Test Notification'
  };
  
  return titles[type] || '📢 New Notification';
};

/**
 * Get message for notification type
 */
NotificationSchema.statics.getMessageForType = function(type, data = {}) {
  const messages = {
    'NEW_ORDER': `Order #${data.orderNumber} from ${data.customerName || 'Customer'} for ${data.currency || '₹'}${data.totalAmount || 0}`,
    'PAYMENT_RECEIVED': `Payment of ${data.currency || '₹'}${data.amount || data.totalAmount} received for Order #${data.orderNumber}`,
    'PAYMENT_VERIFIED': `Payment for Order #${data.orderNumber} has been verified`,
    'LOW_STOCK_ALERT': `${data.productName || 'Product'} is running low (${data.stock || 0} left)`,
    'ORDER_STATUS_CHANGED': `Order #${data.orderNumber} is now ${data.newStatus || data.status}`,
    'WHATSAPP_DISCONNECTED': 'WhatsApp connection has been disconnected. Please reconnect to continue receiving messages.',
    'SUBSCRIPTION_EXPIRING': `Your subscription will expire in ${data.days || 7} days. Renew now to continue services.`,
    'LIMIT_REACHED': `You have reached your ${data.limitType || 'plan'} limit. Upgrade your plan to continue.`
  };
  
  return messages[type] || 'You have a new notification';
};

// ============== INSTANCE METHODS (Like in Company Model) ==============

/**
 * Mark as read
 */
NotificationSchema.methods.markAsRead = async function(userId, via = 'dashboard') {
  // Add to readByUsers
  const alreadyRead = this.readByUsers.some(
    r => r.user && r.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readByUsers.push({ user: userId, readAt: new Date() });
  }
  
  this.status = 'read';
  this.readAt = new Date();
  this.readBy = userId;
  this.updatedBy = userId;
  this.updatedVia = via;
  
  return this.save();
};

/**
 * Mark as failed
 */
NotificationSchema.methods.markAsFailed = async function(error, updatedBy = null) {
  this.status = 'failed';
  this.error = {
    message: error.message || error,
    code: error.code,
    stack: error.stack
  };
  this.updatedBy = updatedBy;
  this.updatedVia = 'system';
  
  return this.save();
};

/**
 * Increment retry count
 */
NotificationSchema.methods.incrementRetry = async function() {
  this.retryCount += 1;
  return this.save();
};

/**
 * Add action taken
 */
NotificationSchema.methods.addAction = async function(actionBy, actionType, via = 'dashboard') {
  this.actionTaken = true;
  this.actionBy = actionBy;
  this.actionAt = new Date();
  this.actionType = actionType;
  this.updatedBy = actionBy;
  this.updatedVia = via;
  
  return this.save();
};

/**
 * Acknowledge notification
 */
NotificationSchema.methods.acknowledge = async function(acknowledgedBy, via = 'dashboard') {
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = acknowledgedBy;
  this.updatedBy = acknowledgedBy;
  this.updatedVia = via;
  
  return this.save();
};

/**
 * Soft delete (Like in Company Model)
 */
NotificationSchema.methods.softDelete = async function(deletedBy, via = 'dashboard') {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deletedVia = via;
  this.isDeleted = true;
  this.updatedBy = deletedBy;
  this.updatedVia = via;
  
  return this.save();
};

/**
 * Restore soft deleted notification (Like in Company Model)
 */
NotificationSchema.methods.restore = async function(restoredBy, via = 'dashboard') {
  this.deletedAt = null;
  this.deletedBy = null;
  this.deletedVia = null;
  this.isDeleted = false;
  this.restoredAt = new Date();
  this.restoredBy = restoredBy;
  this.updatedBy = restoredBy;
  this.updatedVia = via;
  
  return this.save();
};

/**
 * Get notification summary (Like in Company Model)
 */
NotificationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    companyId: this.companyId,
    type: this.type,
    orderNumber: this.orderNumber,
    title: this.title,
    message: this.message,
    priority: this.priority,
    status: this.status,
    customerName: this.customerName,
    totalAmount: this.totalAmount,
    formattedAmount: this.formattedAmount,
    timeSince: this.timeSince,
    isRead: this.isRead,
    createdAt: this.createdAt,
    source: this.source,
    actions: this.actions,
    link: this.link,
    auditInfo: this.auditInfo,
    acknowledgmentStatus: this.acknowledgmentStatus
  };
};

// ============== QUERY HELPERS ==============
NotificationSchema.query.forCompany = function(companyId) {
  return this.where({ companyId, isDeleted: false });
};

NotificationSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

NotificationSchema.query.unread = function() {
  return this.where({ status: { $nin: ['read', 'failed'] } });
};

NotificationSchema.query.highPriority = function() {
  return this.where({ priority: { $in: ['high', 'urgent'] } });
};

NotificationSchema.query.recent = function(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return this.where({ createdAt: { $gte: since } });
};

NotificationSchema.query.notExpired = function() {
  return this.where({
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// ============== JSON TRANSFORM (Like in Company Model) ==============
NotificationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    ret.id = ret._id;
    
    // Format dates
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    if (ret.readAt) ret.readAt = ret.readAt.toISOString();
    if (ret.deliveredAt) ret.deliveredAt = ret.deliveredAt.toISOString();
    if (ret.sentAt) ret.sentAt = ret.sentAt.toISOString();
    
    // Add computed fields
    ret.timeSince = doc.timeSince;
    ret.isRead = doc.isRead;
    ret.formattedAmount = doc.formattedAmount;
    ret.auditInfo = doc.auditInfo;
    ret.acknowledgmentStatus = doc.acknowledgmentStatus;
    
    // Remove sensitive/internal fields
    delete ret.error?.stack;
    delete ret.metadata?.sensitiveData;
    delete ret.customData?.private;
    
    return ret;
  }
});

// ============== EXPORT ==============
const Notification = mongoose.models.Notification || 
  mongoose.model('Notification', NotificationSchema);

export default Notification;