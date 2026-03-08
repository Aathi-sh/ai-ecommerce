// // app/api/config/route.js - Professional Config API Routes
// import { NextResponse } from 'next/server';
// import ConfigModel, { ConfigUtils } from '../../../models/config';
// import { connectDB } from "@/utils/db";
// import mongoose from 'mongoose';

// // Helper: Validate ObjectId
// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id);
// };

// // Helper: Handle errors
// const handleError = (error, message = 'Internal server error') => {
//   console.error('Config API Error:', error);
  
//   if (error.name === 'ValidationError') {
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Validation failed',
//         errors: Object.values(error.errors).map(err => err.message) 
//       },
//       { status: 400 }
//     );
//   }
  
//   if (error.code === 11000) {
//     return NextResponse.json(
//       { success: false, message: 'Configuration already exists for this tenant' },
//       { status: 409 }
//     );
//   }
  
//   return NextResponse.json(
//     { success: false, message },
//     { status: 500 }
//   );
// };

// // GET: Get configuration for current tenant
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const tenantId = searchParams.get('tenantId');
//     const includeFeatures = searchParams.get('includeFeatures');
    
//     if (!tenantId) {
//       return NextResponse.json(
//         { success: false, message: 'Tenant ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (!isValidObjectId(tenantId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid Tenant ID format' },
//         { status: 400 }
//       );
//     }
    
//     let config;
    
//     if (includeFeatures === 'true') {
//       const features = [
//         'features.coupons',
//         'features.referrals',
//         'features.analytics',
//         'ecommerce.enabled',
//         'booking.enabled',
//         'notifications.email',
//         'notifications.sms',
//         'notifications.whatsapp'
//       ];
      
//       const result = await ConfigModel.getConfigWithFeatures(tenantId, features);
      
//       if (!result) {
//         return NextResponse.json(
//           { success: false, message: 'Configuration not found' },
//           { status: 404 }
//         );
//       }
      
//       config = result;
//     } else {
//       config = await ConfigModel.findByTenantId(tenantId);
      
//       if (!config) {
//         return NextResponse.json(
//           { success: false, message: 'Configuration not found' },
//           { status: 404 }
//         );
//       }
      
//       // Convert to plain object and add virtuals
//       config = {
//         ...config.toObject(),
//         isSubscriptionValid: config.isSubscriptionValid,
//         daysUntilExpiry: config.daysUntilExpiry,
//         planTier: config.planTier
//       };
//     }
    
//     return NextResponse.json({
//       success: true,
//       data: config,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     return handleError(error, 'Failed to fetch configuration');
//   }
// }

// // POST: Create or update configuration
// export async function POST(request) {
//   try {
//     await connectDB();
    
//     const body = await request.json();
//     const { tenantId, ...configData } = body;
    
//     if (!tenantId) {
//       return NextResponse.json(
//         { success: false, message: 'Tenant ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (!isValidObjectId(tenantId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid Tenant ID format' },
//         { status: 400 }
//       );
//     }
    
//     // Validate updates
//     const validation = ConfigUtils.validateUpdates(configData);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid configuration data', errors: validation.errors },
//         { status: 400 }
//       );
//     }
    
//     // Check if config exists
//     const existingConfig = await ConfigModel.findOne({ tenantId });
    
//     let config;
    
//     if (existingConfig) {
//       // Update existing config
//       Object.keys(configData).forEach(key => {
//         if (key === 'general' || key === 'ecommerce' || key === 'booking' || 
//             key === 'notifications' || key === 'features' || key === 'limits' || 
//             key === 'subscription') {
//           Object.keys(configData[key] || {}).forEach(nestedKey => {
//             existingConfig[key][nestedKey] = configData[key][nestedKey];
//           });
//         } else {
//           existingConfig[key] = configData[key];
//         }
//       });
      
//       if (body.updatedBy) {
//         existingConfig.updatedBy = body.updatedBy;
//       }
      
//       config = await existingConfig.save();
//     } else {
//       // Create new config
//       const newConfigData = {
//         tenantId,
//         ...configData
//       };
      
//       config = new ConfigModel(newConfigData);
//       await config.save();
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: existingConfig ? 'Configuration updated successfully' : 'Configuration created successfully',
//       data: {
//         ...config.toObject(),
//         isSubscriptionValid: config.isSubscriptionValid,
//         daysUntilExpiry: config.daysUntilExpiry
//       },
//       timestamp: new Date().toISOString()
//     }, { status: existingConfig ? 200 : 201 });
    
//   } catch (error) {
//     return handleError(error, 'Failed to save configuration');
//   }
// }

// // PUT: Update specific fields
// export async function PUT(request) {
//   try {
//     await connectDB();
    
//     const body = await request.json();
//     const { tenantId, updates } = body;
    
//     if (!tenantId || !updates) {
//       return NextResponse.json(
//         { success: false, message: 'Tenant ID and updates are required' },
//         { status: 400 }
//       );
//     }
    
//     if (!isValidObjectId(tenantId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid Tenant ID format' },
//         { status: 400 }
//       );
//     }
    
//     // Validate updates
//     const validation = ConfigUtils.validateUpdates(updates);
//     if (!validation.valid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid update data', errors: validation.errors },
//         { status: 400 }
//       );
//     }
    
//     // Build update query for nested fields
//     const updateQuery = { $set: {} };
//     const unsetQuery = { $unset: {} };
    
//     Object.keys(updates).forEach(key => {
//       if (key === 'general' || key === 'ecommerce' || key === 'booking' || 
//           key === 'notifications' || key === 'features' || key === 'limits' || 
//           key === 'subscription') {
//         Object.keys(updates[key] || {}).forEach(nestedKey => {
//           if (updates[key][nestedKey] === null || updates[key][nestedKey] === undefined) {
//             unsetQuery.$unset[`${key}.${nestedKey}`] = "";
//           } else {
//             updateQuery.$set[`${key}.${nestedKey}`] = updates[key][nestedKey];
//           }
//         });
//       } else {
//         if (updates[key] === null || updates[key] === undefined) {
//           unsetQuery.$unset[key] = "";
//         } else {
//           updateQuery.$set[key] = updates[key];
//         }
//       }
//     });
    
//     // Add updatedBy if provided
//     if (body.updatedBy) {
//       updateQuery.$set.updatedBy = body.updatedBy;
//     }
    
//     // Execute update
//     const result = await ConfigModel.findOneAndUpdate(
//       { tenantId },
//       { ...updateQuery, ...(Object.keys(unsetQuery.$unset).length > 0 ? unsetQuery : {}) },
//       { new: true, runValidators: true }
//     );
    
//     if (!result) {
//       return NextResponse.json(
//         { success: false, message: 'Configuration not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: 'Configuration updated successfully',
//       data: {
//         ...result.toObject(),
//         isSubscriptionValid: result.isSubscriptionValid,
//         daysUntilExpiry: result.daysUntilExpiry
//       },
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     return handleError(error, 'Failed to update configuration');
//   }
// }

// // PATCH: Partial update (specific operations)
// export async function PATCH(request) {
//   try {
//     await connectDB();
    
//     const body = await request.json();
//     const { tenantId, operation, data } = body;
    
//     if (!tenantId || !operation) {
//       return NextResponse.json(
//         { success: false, message: 'Tenant ID and operation are required' },
//         { status: 400 }
//       );
//     }
    
//     if (!isValidObjectId(tenantId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid Tenant ID format' },
//         { status: 400 }
//       );
//     }
    
//     const config = await ConfigModel.findOne({ tenantId });
//     if (!config) {
//       return NextResponse.json(
//         { success: false, message: 'Configuration not found' },
//         { status: 404 }
//       );
//     }
    
//     let result;
    
//     switch (operation) {
//       case 'updatePlan':
//         if (!data || !data.planName) {
//           return NextResponse.json(
//             { success: false, message: 'Plan name is required' },
//             { status: 400 }
//           );
//         }
//         result = await config.updatePlan(data.planName, data.expiresAt, data.updatedBy);
//         break;
        
//       case 'toggleFeature':
//         if (!data || !data.featureName) {
//           return NextResponse.json(
//             { success: false, message: 'Feature name is required' },
//             { status: 400 }
//           );
//         }
        
//         const featureName = data.featureName;
//         if (featureName in config.features) {
//           config.features[featureName] = !config.features[featureName];
//         } else if (featureName in config.notifications) {
//           config.notifications[featureName] = !config.notifications[featureName];
//         } else if (featureName === 'ecommerce') {
//           config.ecommerce.enabled = !config.ecommerce.enabled;
//         } else if (featureName === 'booking') {
//           config.booking.enabled = !config.booking.enabled;
//         } else {
//           return NextResponse.json(
//             { success: false, message: 'Invalid feature name' },
//             { status: 400 }
//           );
//         }
        
//         if (data.updatedBy) {
//           config.updatedBy = data.updatedBy;
//         }
        
//         result = await config.save();
//         break;
        
//       case 'upgradePlan':
//         if (!data || !data.newPlan) {
//           return NextResponse.json(
//             { success: false, message: 'New plan is required' },
//             { status: 400 }
//           );
//         }
//         result = await ConfigUtils.upgradePlan(tenantId, data.newPlan, data.expiresAt, data.updatedBy);
//         break;
        
//       case 'checkLimit':
//         if (!data || !data.action || data.currentCount === undefined) {
//           return NextResponse.json(
//             { success: false, message: 'Action and current count are required' },
//             { status: 400 }
//           );
//         }
//         const limitCheck = await ConfigUtils.canPerformAction(tenantId, data.action, data.currentCount);
//         return NextResponse.json({
//           success: true,
//           data: limitCheck,
//           timestamp: new Date().toISOString()
//         });
        
//       default:
//         return NextResponse.json(
//           { success: false, message: 'Invalid operation' },
//           { status: 400 }
//         );
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: `Operation "${operation}" completed successfully`,
//       data: {
//         ...result.toObject(),
//         isSubscriptionValid: result.isSubscriptionValid,
//         daysUntilExpiry: result.daysUntilExpiry
//       },
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     return handleError(error, `Failed to perform operation`);
//   }
// }

// // DELETE: Deactivate configuration (soft delete)
// export async function DELETE(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const tenantId = searchParams.get('tenantId');
    
//     if (!tenantId) {
//       return NextResponse.json(
//         { success: false, message: 'Tenant ID is required' },
//         { status: 400 }
//       );
//     }
    
//     if (!isValidObjectId(tenantId)) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid Tenant ID format' },
//         { status: 400 }
//       );
//     }
    
//     const result = await ConfigModel.findOneAndUpdate(
//       { tenantId },
//       { isActive: false, updatedAt: new Date() },
//       { new: true }
//     );
    
//     if (!result) {
//       return NextResponse.json(
//         { success: false, message: 'Configuration not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: 'Configuration deactivated successfully',
//       data: {
//         id: result._id,
//         tenantId: result.tenantId,
//         isActive: result.isActive,
//         deactivatedAt: new Date().toISOString()
//       },
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     return handleError(error, 'Failed to deactivate configuration');
//   }
// }

// // OPTIONS: Handle CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Allow-Origin': '*',
//     },
//   });
// }



import { NextResponse } from 'next/server';
import ConfigModel, { ConfigUtils } from '../../../models/config';
import { connectDB } from "@/utils/db";
import mongoose from 'mongoose';

// Helper: Validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper: Handle errors
const handleError = (error, message = 'Internal server error') => {
  console.error('Config API Error:', error);
  
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message) 
      },
      { status: 400 }
    );
  }
  
  if (error.code === 11000) {
    return NextResponse.json(
      { success: false, message: 'Configuration already exists for this tenant' },
      { status: 409 }
    );
  }
  
  return NextResponse.json(
    { success: false, message: error.message || message },
    { status: 500 }
  );
};

// GET: Get configuration for current tenant
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const includeFeatures = searchParams.get('includeFeatures');
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(tenantId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Tenant ID format' },
        { status: 400 }
      );
    }
    
    let config;
    
    if (includeFeatures === 'true') {
      const features = [
        'features.coupons',
        'features.referrals',
        'features.analytics',
        'ecommerce.enabled',
        'ecommerce.orderFlowMode',
        'booking.enabled',
        'notifications.email',
        'notifications.sms',
        'notifications.whatsapp'
      ];
      
      const result = await ConfigModel.getConfigWithFeatures(tenantId, features);
      
      if (!result) {
        // Return default config if not found
        const defaultConfig = ConfigUtils.getDefaultConfig(tenantId);
        return NextResponse.json({
          success: true,
          data: defaultConfig,
          isDefault: true,
          timestamp: new Date().toISOString()
        });
      }
      
      config = result;
    } else {
      config = await ConfigModel.findByTenantId(tenantId);
      
      if (!config) {
        // Return default config if not found
        const defaultConfig = ConfigUtils.getDefaultConfig(tenantId);
        return NextResponse.json({
          success: true,
          data: defaultConfig,
          isDefault: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Convert to plain object and add virtuals
      config = {
        ...config.toObject(),
        isSubscriptionValid: config.isSubscriptionValid,
        daysUntilExpiry: config.daysUntilExpiry,
        planTier: config.planTier
      };
    }
    
    return NextResponse.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return handleError(error, 'Failed to fetch configuration');
  }
}

// POST: Create or update configuration
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { tenantId, ...configData } = body;
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(tenantId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Tenant ID format' },
        { status: 400 }
      );
    }
    
    // Validate updates
    const validation = ConfigUtils.validateUpdates(configData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid configuration data', errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Check if config exists
    const existingConfig = await ConfigModel.findOne({ tenantId });
    
    let config;
    
    if (existingConfig) {
      // Update existing config
      Object.keys(configData).forEach(key => {
        if (key === 'general' || key === 'ecommerce' || key === 'booking' || 
            key === 'notifications' || key === 'features' || key === 'limits' || 
            key === 'subscription') {
          Object.keys(configData[key] || {}).forEach(nestedKey => {
            existingConfig[key][nestedKey] = configData[key][nestedKey];
          });
        } else {
          existingConfig[key] = configData[key];
        }
      });
      
      if (body.updatedBy) {
        existingConfig.updatedBy = body.updatedBy;
      }
      
      config = await existingConfig.save();
    } else {
      // Create new config
      const newConfigData = {
        tenantId,
        ...ConfigUtils.getDefaultConfig(tenantId),
        ...configData
      };
      
      config = new ConfigModel(newConfigData);
      await config.save();
    }
    
    return NextResponse.json({
      success: true,
      message: existingConfig ? 'Configuration updated successfully' : 'Configuration created successfully',
      data: {
        ...config.toObject(),
        isSubscriptionValid: config.isSubscriptionValid,
        daysUntilExpiry: config.daysUntilExpiry
      },
      timestamp: new Date().toISOString()
    }, { status: existingConfig ? 200 : 201 });
    
  } catch (error) {
    return handleError(error, 'Failed to save configuration');
  }
}

// PUT: Update specific fields
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { tenantId, updates } = body;
    
    if (!tenantId || !updates) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID and updates are required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(tenantId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Tenant ID format' },
        { status: 400 }
      );
    }
    
    // Validate updates
    const validation = ConfigUtils.validateUpdates(updates);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid update data', errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Build update query for nested fields
    const updateQuery = { $set: {} };
    const unsetQuery = { $unset: {} };
    
    Object.keys(updates).forEach(key => {
      if (key === 'general' || key === 'ecommerce' || key === 'booking' || 
          key === 'notifications' || key === 'features' || key === 'limits' || 
          key === 'subscription') {
        Object.keys(updates[key] || {}).forEach(nestedKey => {
          if (updates[key][nestedKey] === null || updates[key][nestedKey] === undefined) {
            unsetQuery.$unset[`${key}.${nestedKey}`] = "";
          } else {
            updateQuery.$set[`${key}.${nestedKey}`] = updates[key][nestedKey];
          }
        });
      } else {
        if (updates[key] === null || updates[key] === undefined) {
          unsetQuery.$unset[key] = "";
        } else {
          updateQuery.$set[key] = updates[key];
        }
      }
    });
    
    // Add updatedBy if provided
    if (body.updatedBy) {
      updateQuery.$set.updatedBy = body.updatedBy;
    }
    
    // Execute update
    const result = await ConfigModel.findOneAndUpdate(
      { tenantId },
      { ...updateQuery, ...(Object.keys(unsetQuery.$unset).length > 0 ? unsetQuery : {}) },
      { new: true, runValidators: true }
    );
    
    if (!result) {
      // Create new if not exists
      const newConfigData = {
        tenantId,
        ...ConfigUtils.getDefaultConfig(tenantId),
        ...updates
      };
      
      const newConfig = new ConfigModel(newConfigData);
      await newConfig.save();
      
      return NextResponse.json({
        success: true,
        message: 'Configuration created successfully',
        data: {
          ...newConfig.toObject(),
          isSubscriptionValid: newConfig.isSubscriptionValid,
          daysUntilExpiry: newConfig.daysUntilExpiry
        },
        timestamp: new Date().toISOString()
      }, { status: 201 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: {
        ...result.toObject(),
        isSubscriptionValid: result.isSubscriptionValid,
        daysUntilExpiry: result.daysUntilExpiry
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return handleError(error, 'Failed to update configuration');
  }
}

// PATCH: Partial update (specific operations)
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { tenantId, operation, data } = body;
    
    if (!tenantId || !operation) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID and operation are required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(tenantId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Tenant ID format' },
        { status: 400 }
      );
    }
    
    const config = await ConfigModel.findOne({ tenantId });
    if (!config) {
      return NextResponse.json(
        { success: false, message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    let result;
    
    switch (operation) {
      case 'updatePlan':
        if (!data || !data.planName) {
          return NextResponse.json(
            { success: false, message: 'Plan name is required' },
            { status: 400 }
          );
        }
        result = await config.updatePlan(data.planName, data.expiresAt, data.updatedBy);
        break;
        
      case 'toggleFeature':
        if (!data || !data.featureName) {
          return NextResponse.json(
            { success: false, message: 'Feature name is required' },
            { status: 400 }
          );
        }
        
        const featureName = data.featureName;
        if (featureName in config.features) {
          config.features[featureName] = !config.features[featureName];
        } else if (featureName in config.notifications) {
          config.notifications[featureName] = !config.notifications[featureName];
        } else if (featureName === 'ecommerce') {
          config.ecommerce.enabled = !config.ecommerce.enabled;
        } else if (featureName === 'booking') {
          config.booking.enabled = !config.booking.enabled;
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid feature name' },
            { status: 400 }
          );
        }
        
        if (data.updatedBy) {
          config.updatedBy = data.updatedBy;
        }
        
        result = await config.save();
        break;
        
      case 'upgradePlan':
        if (!data || !data.newPlan) {
          return NextResponse.json(
            { success: false, message: 'New plan is required' },
            { status: 400 }
          );
        }
        result = await ConfigUtils.upgradePlan(tenantId, data.newPlan, data.expiresAt, data.updatedBy);
        break;
        
      case 'checkLimit':
        if (!data || !data.action || data.currentCount === undefined) {
          return NextResponse.json(
            { success: false, message: 'Action and current count are required' },
            { status: 400 }
          );
        }
        const limitCheck = await ConfigUtils.canPerformAction(tenantId, data.action, data.currentCount);
        return NextResponse.json({
          success: true,
          data: limitCheck,
          timestamp: new Date().toISOString()
        });
        
      case 'getOrderFlowMode':
        const orderFlowMode = await ConfigUtils.getOrderFlowMode(tenantId);
        return NextResponse.json({
          success: true,
          data: { orderFlowMode },
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid operation' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Operation "${operation}" completed successfully`,
      data: {
        ...result.toObject(),
        isSubscriptionValid: result.isSubscriptionValid,
        daysUntilExpiry: result.daysUntilExpiry
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return handleError(error, `Failed to perform operation`);
  }
}

// DELETE: Deactivate configuration (soft delete)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    if (!isValidObjectId(tenantId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Tenant ID format' },
        { status: 400 }
      );
    }
    
    const result = await ConfigModel.findOneAndUpdate(
      { tenantId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration deactivated successfully',
      data: {
        id: result._id,
        tenantId: result.tenantId,
        isActive: result.isActive,
        deactivatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return handleError(error, 'Failed to deactivate configuration');
  }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
    },
  });
}