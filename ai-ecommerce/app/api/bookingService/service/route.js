import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Service from '@/models/Service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Format service response
 */
const formatServiceResponse = (service) => {
    const serviceObj = service.toObject ? service.toObject() : service;
    
    return {
        ...serviceObj,
        _id: serviceObj._id.toString(),
        professionalId: serviceObj.professionalId?.toString() || null,
        createdAt: serviceObj.createdAt?.toISOString(),
        updatedAt: serviceObj.updatedAt?.toISOString(),
        
        // Format variations
        variations: (serviceObj.variations || []).map(v => ({
            ...v,
            price: Number(v.price) || 0,
            duration: Number(v.duration) || 0
        })),
        
        // Format addons
        addons: (serviceObj.addons || []).map(a => ({
            ...a,
            price: Number(a.price) || 0
        })),
        
        // Ensure numbers are numbers
        basePrice: Number(serviceObj.basePrice) || 0,
        duration: Number(serviceObj.duration) || 60,
        bufferTime: Number(serviceObj.bufferTime) || 0,
        advanceBooking: Number(serviceObj.advanceBooking) || 30,
        totalBookings: Number(serviceObj.totalBookings) || 0,
        popularity: Number(serviceObj.popularity) || 0,
        
        // Ensure arrays exist
        tags: serviceObj.tags || [],
        images: serviceObj.images || [],
        clientRequirements: serviceObj.clientRequirements || [],
        professionalProvides: serviceObj.professionalProvides || []
    };
};

// ==================== GET HANDLER ====================

export async function GET(request) {
    console.log('🚀 [Services API] GET request received');
    
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        // ===== SINGLE SERVICE BY ID =====
        if (id) {
            console.log(`🔍 Fetching single service with ID: ${id}`);
            
            if (!isValidObjectId(id)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid service ID format'
                }, { status: 400 });
            }
            
            const service = await Service.findById(id).lean();
            
            if (!service) {
                return NextResponse.json({
                    success: false,
                    error: 'Service not found'
                }, { status: 404 });
            }
            
            return NextResponse.json({
                success: true,
                data: formatServiceResponse(service)
            }, { status: 200 });
        }
        
        // ===== LIST SERVICES WITH FILTERS =====
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const type = searchParams.get('type') || '';
        const status = searchParams.get('status') || 'all';
        const professionalId = searchParams.get('professionalId');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        
        // Filter by professional
        if (professionalId) {
            if (!isValidObjectId(professionalId)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid professional ID format'
                }, { status: 400 });
            }
            query.professionalId = professionalId;
        }
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Category filter
        if (category && category !== 'all' && category !== '') {
            query.category = category;
        }
        
        // Type filter
        if (type && type !== 'all' && type !== '') {
            query.type = type;
        }
        
        // Status filter
        if (status && status !== 'all') {
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice && !isNaN(parseFloat(minPrice))) {
                query.basePrice.$gte = parseFloat(minPrice);
            }
            if (maxPrice && !isNaN(parseFloat(maxPrice))) {
                query.basePrice.$lte = parseFloat(maxPrice);
            }
        }
        
        // Build sort options
        let sortOptions = {};
        const validSortFields = ['createdAt', 'name', 'basePrice', 'duration', 'popularity', 'totalBookings'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
        
        // Get total count
        const total = await Service.countDocuments(query);
        
        // Get services
        const services = await Service.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions)
            .lean();
        
        // Format services
        const formattedServices = services.map(service => formatServiceResponse(service));
        
        console.log(`📊 Found ${services.length} services (total: ${total})`);
        
        return NextResponse.json({
            success: true,
            data: formattedServices,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        }, { status: 200 });
        
    } catch (error) {
        console.error('❌ [Services API] GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch services',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ==================== POST HANDLER ====================

export async function POST(request) {
    console.log('🚀 [Services API] POST request received');
    
    try {
        await connectDB();
        
        // Check authentication (optional - remove if not needed)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const body = await request.json();
        
        // ===== VALIDATION =====
        const errors = {};
        
        // Required fields validation
        if (!body.name?.trim()) {
            errors.name = 'Service name is required';
        }
        
        if (!body.category) {
            errors.category = 'Category is required';
        }
        
        if (!body.basePrice && body.basePrice !== 0) {
            errors.basePrice = 'Base price is required';
        } else if (body.basePrice < 0) {
            errors.basePrice = 'Base price cannot be negative';
        }
        
        if (!body.duration) {
            errors.duration = 'Duration is required';
        } else if (body.duration < 15) {
            errors.duration = 'Duration must be at least 15 minutes';
        }
        
        if (!body.professionalId) {
            errors.professionalId = 'Professional ID is required';
        } else if (!isValidObjectId(body.professionalId)) {
            errors.professionalId = 'Invalid professional ID format';
        }
        
        // Return validation errors if any
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        // Prepare service data
        const serviceData = {
            name: body.name.trim(),
            description: body.description?.trim() || '',
            professionalId: body.professionalId,
            category: body.category,
            type: body.type || 'physical',
            subcategory: body.subcategory?.trim() || '',
            basePrice: parseFloat(body.basePrice),
            currency: body.currency || 'INR',
            duration: parseInt(body.duration),
            isActive: body.isActive !== undefined ? body.isActive : true,
            
            // Optional fields with defaults
            variations: Array.isArray(body.variations) ? body.variations.map(v => ({
                name: v.name || '',
                price: parseFloat(v.price) || 0,
                duration: parseInt(v.duration) || 0
            })) : [],
            
            addons: Array.isArray(body.addons) ? body.addons.map(a => ({
                name: a.name || '',
                price: parseFloat(a.price) || 0,
                description: a.description || ''
            })) : [],
            
            bufferTime: parseInt(body.bufferTime) || 0,
            advanceBooking: parseInt(body.advanceBooking) || 30,
            
            images: Array.isArray(body.images) ? body.images : [],
            tags: Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(t => t) : [],
            clientRequirements: Array.isArray(body.clientRequirements) 
                ? body.clientRequirements.filter(r => r?.trim()) 
                : [],
            professionalProvides: Array.isArray(body.professionalProvides) 
                ? body.professionalProvides.filter(p => p?.trim()) 
                : [],
            
            minAge: body.minAge ? parseInt(body.minAge) : null,
            maxAge: body.maxAge ? parseInt(body.maxAge) : null,
            genderPreference: body.genderPreference || 'any',
            
            // Stats (always start at 0)
            totalBookings: 0,
            popularity: 0
        };
        
        // Create service
        const service = new Service(serviceData);
        await service.save();
        
        console.log(`✅ Service created: ${service.name} (${service._id})`);
        
        return NextResponse.json({
            success: true,
            data: formatServiceResponse(service),
            message: 'Service created successfully'
        }, { status: 201 });
        
    } catch (error) {
        console.error('❌ [Services API] POST error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: 'Service with this name already exists'
            }, { status: 409 });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to create service',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ==================== PUT HANDLER (Full Update) ====================

export async function PUT(request) {
    console.log('🚀 [Services API] PUT request received');
    
    try {
        await connectDB();
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Service ID is required'
            }, { status: 400 });
        }
        
        if (!isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid service ID format'
            }, { status: 400 });
        }
        
        const body = await request.json();
        
        // ===== VALIDATION =====
        const errors = {};
        
        if (!body.name?.trim()) {
            errors.name = 'Service name is required';
        }
        
        if (!body.category) {
            errors.category = 'Category is required';
        }
        
        if (!body.basePrice && body.basePrice !== 0) {
            errors.basePrice = 'Base price is required';
        } else if (body.basePrice < 0) {
            errors.basePrice = 'Base price cannot be negative';
        }
        
        if (!body.duration) {
            errors.duration = 'Duration is required';
        } else if (body.duration < 15) {
            errors.duration = 'Duration must be at least 15 minutes';
        }
        
        if (!body.professionalId) {
            errors.professionalId = 'Professional ID is required';
        } else if (!isValidObjectId(body.professionalId)) {
            errors.professionalId = 'Invalid professional ID format';
        }
        
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        // Prepare update data
        const updateData = {
            name: body.name.trim(),
            description: body.description?.trim() || '',
            professionalId: body.professionalId,
            category: body.category,
            type: body.type || 'physical',
            subcategory: body.subcategory?.trim() || '',
            basePrice: parseFloat(body.basePrice),
            currency: body.currency || 'INR',
            duration: parseInt(body.duration),
            isActive: body.isActive !== undefined ? body.isActive : true,
            
            variations: Array.isArray(body.variations) ? body.variations.map(v => ({
                name: v.name || '',
                price: parseFloat(v.price) || 0,
                duration: parseInt(v.duration) || 0
            })) : [],
            
            addons: Array.isArray(body.addons) ? body.addons.map(a => ({
                name: a.name || '',
                price: parseFloat(a.price) || 0,
                description: a.description || ''
            })) : [],
            
            bufferTime: parseInt(body.bufferTime) || 0,
            advanceBooking: parseInt(body.advanceBooking) || 30,
            
            images: Array.isArray(body.images) ? body.images : [],
            tags: Array.isArray(body.tags) ? body.tags.map(t => t.trim()).filter(t => t) : [],
            clientRequirements: Array.isArray(body.clientRequirements) 
                ? body.clientRequirements.filter(r => r?.trim()) 
                : [],
            professionalProvides: Array.isArray(body.professionalProvides) 
                ? body.professionalProvides.filter(p => p?.trim()) 
                : [],
            
            minAge: body.minAge ? parseInt(body.minAge) : null,
            maxAge: body.maxAge ? parseInt(body.maxAge) : null,
            genderPreference: body.genderPreference || 'any',
            
            updatedAt: new Date()
        };
        
        // Update service
        const service = await Service.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        );
        
        if (!service) {
            return NextResponse.json({
                success: false,
                error: 'Service not found'
            }, { status: 404 });
        }
        
        console.log(`✅ Service updated: ${service.name} (${service._id})`);
        
        return NextResponse.json({
            success: true,
            data: formatServiceResponse(service),
            message: 'Service updated successfully'
        }, { status: 200 });
        
    } catch (error) {
        console.error('❌ [Services API] PUT error:', error);
        
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                error: 'Service with this name already exists'
            }, { status: 409 });
        }
        
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to update service',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ==================== PATCH HANDLER (Partial Update) ====================

export async function PATCH(request) {
    console.log('🚀 [Services API] PATCH request received');
    
    try {
        await connectDB();
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const action = searchParams.get('action');
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Service ID is required'
            }, { status: 400 });
        }
        
        if (!isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid service ID format'
            }, { status: 400 });
        }
        
        const body = await request.json();
        let updateData = {};
        
        // Handle different actions
        if (action === 'activate') {
            updateData = { 
                isActive: true,
                updatedAt: new Date() 
            };
        } else if (action === 'deactivate') {
            updateData = { 
                isActive: false,
                updatedAt: new Date() 
            };
        } else if (action === 'increment-bookings') {
            updateData = { 
                $inc: { totalBookings: 1 },
                updatedAt: new Date() 
            };
            
            const service = await Service.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
            
            if (!service) {
                return NextResponse.json({
                    success: false,
                    error: 'Service not found'
                }, { status: 404 });
            }
            
            return NextResponse.json({
                success: true,
                data: formatServiceResponse(service),
                message: 'Bookings incremented successfully'
            }, { status: 200 });
            
        } else {
            // General partial update
            const { _id, totalBookings, popularity, createdAt, ...updateFields } = body;
            updateData = {
                ...updateFields,
                updatedAt: new Date()
            };
        }
        
        const service = await Service.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        );
        
        if (!service) {
            return NextResponse.json({
                success: false,
                error: 'Service not found'
            }, { status: 404 });
        }
        
        console.log(`✅ Service ${action || 'updated'}: ${service.name} (${service._id})`);
        
        return NextResponse.json({
            success: true,
            data: formatServiceResponse(service),
            message: action 
                ? `Service ${action}d successfully` 
                : 'Service updated successfully'
        }, { status: 200 });
        
    } catch (error) {
        console.error('❌ [Services API] PATCH error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to update service',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ==================== DELETE HANDLER ====================

export async function DELETE(request) {
    console.log('🚀 [Services API] DELETE request received');
    
    try {
        await connectDB();
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ids = searchParams.get('ids');
        
        // ===== BULK DELETE =====
        if (ids) {
            const idArray = ids.split(',').filter(id => id.trim());
            const validIds = idArray.filter(id => isValidObjectId(id));
            
            if (validIds.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'No valid service IDs provided'
                }, { status: 400 });
            }
            
            const result = await Service.deleteMany({
                _id: { $in: validIds }
            });
            
            console.log(`✅ Deleted ${result.deletedCount} services (bulk)`);
            
            return NextResponse.json({
                success: true,
                message: `Successfully deleted ${result.deletedCount} services`,
                data: {
                    deletedCount: result.deletedCount,
                    ids: validIds
                }
            }, { status: 200 });
        }
        
        // ===== SINGLE DELETE =====
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Service ID is required'
            }, { status: 400 });
        }
        
        if (!isValidObjectId(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid service ID format'
            }, { status: 400 });
        }
        
        const service = await Service.findByIdAndDelete(id);
        
        if (!service) {
            return NextResponse.json({
                success: false,
                error: 'Service not found'
            }, { status: 404 });
        }
        
        console.log(`✅ Service deleted: ${service.name} (${service._id})`);
        
        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully',
            data: { 
                id: service._id.toString(),
                name: service.name 
            }
        }, { status: 200 });
        
    } catch (error) {
        console.error('❌ [Services API] DELETE error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete service',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

// ==================== OPTIONS HANDLER ====================

export async function OPTIONS() {
    return NextResponse.json({
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        description: 'Services Management API',
        endpoints: {
            GET: {
                description: 'Fetch services (with filters) or single service by ID',
                examples: [
                    '/api/bookingService/service?page=1&limit=20',
                    '/api/bookingService/service?category=beauty&status=active',
                    '/api/bookingService/service?id=123456789012345678901234'
                ]
            },
            POST: {
                description: 'Create a new service',
                example: '/api/bookingService/service'
            },
            PUT: {
                description: 'Full update of a service',
                example: '/api/bookingService/service?id=123456789012345678901234'
            },
            PATCH: {
                description: 'Partial update or actions (activate/deactivate/increment-bookings)',
                example: '/api/bookingService/service?id=123456789012345678901234&action=activate'
            },
            DELETE: {
                description: 'Delete single or multiple services',
                examples: [
                    '/api/bookingService/service?id=123456789012345678901234',
                    '/api/bookingService/service?ids=id1,id2,id3'
                ]
            }
        }
    }, { 
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}