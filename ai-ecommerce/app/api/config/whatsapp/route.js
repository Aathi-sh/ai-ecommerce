import { NextResponse } from 'next/server';
import ConfigModel from '@/models/config';
import { connectDB } from '@/utils/db';
import mongoose from 'mongoose';

// Helper: Validate ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Helper: Get default configuration
const getDefaultConfig = () => ({
    ecommerce: {
        orderFlowMode: 'long',
        enabled: true,
        taxPercent: 18,
        shippingCharge: 0,
        freeShippingThreshold: 500,
        currencySymbol: '₹',
        showTaxBreakdown: true,
        enableReviews: true,
        enableWishlist: true,
        enableCompare: false
    },
    notifications: {
        whatsapp: true,
        email: true,
        sms: false,
        pushNotifications: false,
        orderUpdates: true,
        bookingReminders: true
    },
    general: {
        appName: 'Store',
        supportEmail: 'support@example.com',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'dd/mm/yyyy',
        timeFormat: '12h'
    },
    features: {
        coupons: false,
        referrals: false,
        analytics: true,
        multiVendor: false,
        giftCards: false,
        loyaltyPoints: false
    },
    limits: {
        maxProducts: 500,
        maxUsers: 5,
        maxBookingsPerMonth: 300,
        maxCategories: 50,
        maxImagesPerProduct: 10,
        maxFileSize: 10,
        storageLimit: 1024,
        apiRateLimit: 1000
    },
    subscription: {
        planName: 'free',
        isActive: true,
        expiresAt: null,
        billingCycle: 'monthly',
        autoRenew: true
    }
});

// GET: Get configuration for WhatsApp bot
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const operation = searchParams.get('operation');
        
        // Handle missing tenant ID - return default config
        if (!tenantId) {
            console.log('⚠️ No tenant ID provided, returning default config');
            return NextResponse.json({
                success: true,
                data: operation === 'getOrderFlowMode' 
                    ? { orderFlowMode: 'long' }
                    : getDefaultConfig(),
                isDefault: true,
                message: 'No tenant ID provided, using default configuration'
            });
        }
        
        console.log(`🔍 Fetching config for tenant: ${tenantId}, operation: ${operation || 'full'}`);
        
        // Handle specific operations
        if (operation === 'getOrderFlowMode') {
            try {
                // Try to find config - handle both ObjectId and string IDs
                let query = { isActive: true };
                
                if (isValidObjectId(tenantId)) {
                    query.tenantId = new mongoose.Types.ObjectId(tenantId);
                } else {
                    // For non-ObjectId strings (like 'default-tenant'), use string comparison
                    query.tenantId = tenantId;
                }
                
                const config = await ConfigModel.findOne(query).lean();
                
                if (!config) {
                    console.log(`⚠️ No config found for tenant: ${tenantId}, using default`);
                    return NextResponse.json({
                        success: true,
                        data: { orderFlowMode: 'long' },
                        isDefault: true,
                        tenantId: tenantId
                    });
                }
                
                console.log(`✅ Found config for tenant: ${tenantId}, mode: ${config.ecommerce?.orderFlowMode || 'long'}`);
                
                return NextResponse.json({
                    success: true,
                    data: { 
                        orderFlowMode: config.ecommerce?.orderFlowMode || 'long',
                        tenantId: config.tenantId
                    }
                });
                
            } catch (dbError) {
                console.error('❌ Database error fetching order flow mode:', dbError);
                return NextResponse.json({
                    success: true,
                    data: { orderFlowMode: 'long' },
                    isDefault: true,
                    error: 'Database error, using default'
                });
            }
        }
        
        // General config fetch with essential fields only
        try {
            let query = { isActive: true };
            
            if (isValidObjectId(tenantId)) {
                query.tenantId = new mongoose.Types.ObjectId(tenantId);
            } else {
                query.tenantId = tenantId;
            }
            
            const config = await ConfigModel.findOne(query).select({
                'ecommerce.orderFlowMode': 1,
                'ecommerce.enabled': 1,
                'ecommerce.taxPercent': 1,
                'ecommerce.shippingCharge': 1,
                'ecommerce.freeShippingThreshold': 1,
                'ecommerce.currencySymbol': 1,
                'ecommerce.showTaxBreakdown': 1,
                'ecommerce.enableReviews': 1,
                'ecommerce.enableWishlist': 1,
                'ecommerce.enableCompare': 1,
                'notifications.whatsapp': 1,
                'notifications.email': 1,
                'notifications.sms': 1,
                'notifications.pushNotifications': 1,
                'notifications.orderUpdates': 1,
                'notifications.bookingReminders': 1,
                'general.appName': 1,
                'general.supportEmail': 1,
                'general.currency': 1,
                'general.timezone': 1,
                'general.dateFormat': 1,
                'general.timeFormat': 1,
                'features.coupons': 1,
                'features.referrals': 1,
                'features.analytics': 1,
                'features.multiVendor': 1,
                'features.giftCards': 1,
                'features.loyaltyPoints': 1,
                'limits.maxProducts': 1,
                'limits.maxUsers': 1,
                'limits.maxBookingsPerMonth': 1,
                'limits.maxCategories': 1,
                'limits.maxImagesPerProduct': 1,
                'limits.maxFileSize': 1,
                'limits.storageLimit': 1,
                'limits.apiRateLimit': 1,
                'subscription.planName': 1,
                'subscription.isActive': 1,
                'subscription.expiresAt': 1,
                'subscription.billingCycle': 1,
                'subscription.autoRenew': 1
            }).lean();

            if (!config) {
                console.log(`⚠️ No config found for tenant: ${tenantId}, using default`);
                return NextResponse.json({
                    success: true,
                    data: getDefaultConfig(),
                    isDefault: true,
                    tenantId: tenantId
                });
            }

            console.log(`✅ Full config fetched for tenant: ${tenantId}`);
            return NextResponse.json({
                success: true,
                data: config
            });
            
        } catch (dbError) {
            console.error('❌ Database error fetching full config:', dbError);
            return NextResponse.json({
                success: true,
                data: getDefaultConfig(),
                isDefault: true,
                error: 'Database error, using default'
            });
        }

    } catch (error) {
        console.error('❌ WhatsApp Config API Error:', error);
        return NextResponse.json({
            success: true, // Return true with default even on error
            data: operation === 'getOrderFlowMode' 
                ? { orderFlowMode: 'long' }
                : getDefaultConfig(),
            isDefault: true,
            message: 'Error occurred, using default configuration',
            error: error.message
        });
    }
}

// POST: Update configuration from WhatsApp bot
export async function POST(request) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { tenantId, operation, data } = body;
        
        if (!tenantId || !operation) {
            return NextResponse.json({
                success: false,
                message: 'Tenant ID and operation are required'
            }, { status: 400 });
        }
        
        console.log(`📝 WhatsApp operation: ${operation} for tenant: ${tenantId}`);
        
        // Build query based on tenant ID type
        let query = {};
        if (isValidObjectId(tenantId)) {
            query.tenantId = new mongoose.Types.ObjectId(tenantId);
        } else {
            query.tenantId = tenantId;
        }
        
        const config = await ConfigModel.findOne(query);
        
        if (!config) {
            // If config doesn't exist, create default one for this tenant
            if (operation === 'updateOrderFlowMode') {
                const defaultConfig = getDefaultConfig();
                const newConfig = new ConfigModel({
                    tenantId: tenantId,
                    ...defaultConfig,
                    ecommerce: {
                        ...defaultConfig.ecommerce,
                        orderFlowMode: data?.mode || 'long'
                    }
                });
                await newConfig.save();
                
                return NextResponse.json({
                    success: true,
                    message: `Configuration created with order flow mode: ${data?.mode || 'long'}`,
                    data: { orderFlowMode: newConfig.ecommerce.orderFlowMode }
                });
            }
            
            return NextResponse.json({
                success: false,
                message: 'Configuration not found'
            }, { status: 404 });
        }
        
        // Handle different operations
        switch (operation) {
            case 'updateOrderFlowMode':
                if (!data || !data.mode) {
                    return NextResponse.json({
                        success: false,
                        message: 'Mode is required'
                    }, { status: 400 });
                }
                
                if (!['long', 'short'].includes(data.mode)) {
                    return NextResponse.json({
                        success: false,
                        message: 'Mode must be either "long" or "short"'
                    }, { status: 400 });
                }
                
                config.ecommerce.orderFlowMode = data.mode;
                if (data.updatedBy) {
                    config.updatedBy = data.updatedBy;
                }
                await config.save();
                
                console.log(`✅ Order flow mode updated to ${data.mode} for tenant: ${tenantId}`);
                
                return NextResponse.json({
                    success: true,
                    message: `Order flow mode updated to ${data.mode}`,
                    data: { orderFlowMode: config.ecommerce.orderFlowMode }
                });
                
            case 'checkLimit':
                if (!data || !data.action || data.currentCount === undefined) {
                    return NextResponse.json({
                        success: false,
                        message: 'Action and current count are required'
                    }, { status: 400 });
                }
                
                let allowed = false;
                let reason = '';
                
                switch (data.action) {
                    case 'createProduct':
                        allowed = data.currentCount < (config.limits?.maxProducts || 500);
                        reason = allowed ? '' : `Maximum product limit of ${config.limits?.maxProducts || 500} reached`;
                        break;
                    case 'createUser':
                        allowed = data.currentCount < (config.limits?.maxUsers || 5);
                        reason = allowed ? '' : `Maximum user limit of ${config.limits?.maxUsers || 5} reached`;
                        break;
                    case 'createBooking':
                        allowed = data.currentCount < (config.limits?.maxBookingsPerMonth || 300);
                        reason = allowed ? '' : `Monthly booking limit of ${config.limits?.maxBookingsPerMonth || 300} reached`;
                        break;
                    default:
                        return NextResponse.json({
                            success: false,
                            message: 'Invalid action'
                        }, { status: 400 });
                }
                
                console.log(`🔍 Limit check for ${data.action}: ${allowed ? 'allowed' : 'denied'} (${data.currentCount}/${config.limits?.[data.action === 'createProduct' ? 'maxProducts' : data.action === 'createUser' ? 'maxUsers' : 'maxBookingsPerMonth']})`);
                
                return NextResponse.json({
                    success: true,
                    data: { allowed, reason, current: data.currentCount, limit: config.limits?.[data.action === 'createProduct' ? 'maxProducts' : data.action === 'createUser' ? 'maxUsers' : 'maxBookingsPerMonth'] }
                });
                
            case 'getOrderFlowMode':
                return NextResponse.json({
                    success: true,
                    data: { orderFlowMode: config.ecommerce?.orderFlowMode || 'long' }
                });
                
            default:
                return NextResponse.json({
                    success: false,
                    message: 'Invalid operation'
                }, { status: 400 });
        }
        
    } catch (error) {
        console.error('❌ WhatsApp Config Update Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update configuration',
            error: error.message
        }, { status: 500 });
    }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS() {
    return NextResponse.json(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
        },
    });
}