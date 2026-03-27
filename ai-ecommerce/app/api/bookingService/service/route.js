
import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Service from '@/models/Service';
import Bookingmng from '@/models/Bookingmng';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import mongoose from 'mongoose';

// ==================== CONFIGURATION ====================
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;
export const revalidate = 0;

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && 
           /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Format service response
 */
const formatServiceResponse = (service) => {
    const serviceObj = service.toObject ? service.toObject() : service;
    
    return {
        ...serviceObj,
        _id: serviceObj._id.toString(),
        companyId: serviceObj.companyId?.toString(),
        professionalId: serviceObj.professionalId?.toString(),
        createdBy: serviceObj.createdBy?.toString(),
        updatedBy: serviceObj.updatedBy?.toString(),
        createdAt: serviceObj.createdAt?.toISOString(),
        updatedAt: serviceObj.updatedAt?.toISOString(),
        deletedAt: serviceObj.deletedAt?.toISOString() || null,
        
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
        professionalProvides: serviceObj.professionalProvides || [],
        
        // SaaS flags
        isDeleted: !!serviceObj.deletedAt
    };
};

// ==================== GET HANDLER ====================

export async function GET(request) {
    console.log('🚀 [Services API] GET request received');
    
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
        const includeDeleted = searchParams.get('includeDeleted') === 'true';
        
        // Validate companyId
        if (!companyId || !isValidObjectId(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Valid companyId is required'
            }, { status: 400 });
        }
        
        // ===== SINGLE SERVICE BY ID =====
        if (id) {
            console.log(`🔍 Fetching single service with ID: ${id}`);
            
            if (!isValidObjectId(id)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid service ID format'
                }, { status: 400 });
            }
            
            // Build query with company filter
            let query = { _id: id, companyId };
            if (!includeDeleted) {
                query.deletedAt = null;
            }
            
            const service = await Service.findOne(query).lean();
            
            if (!service) {
                return NextResponse.json({
                    success: false,
                    error: 'Service not found in this company'
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
        
        // Build query with company filter (REQUIRED for SaaS)
        let query = { companyId };
        
        // Handle soft delete filter
        if (!includeDeleted) {
            query.deletedAt = null;
        }
        
        // Filter by professional (must belong to same company)
        if (professionalId) {
            if (!isValidObjectId(professionalId)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid professional ID format'
                }, { status: 400 });
            }
            
            // Verify professional belongs to this company
            const professional = await Bookingmng.findOne({ 
                _id: professionalId, 
                companyId 
            });
            
            if (!professional) {
                return NextResponse.json({
                    success: false,
                    error: 'Professional not found in this company'
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
        
        console.log(`📊 Found ${services.length} services (total: ${total}) for company ${companyId}`);
        
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
            },
            companyId
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
        const companyId = body.companyId; // REQUIRED for SaaS
        const userId = body.userId || session?.user?.id; // For audit
        
        // Validate companyId
        if (!companyId || !isValidObjectId(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Valid companyId is required'
            }, { status: 400 });
        }
        
        // Validate userId for audit
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required for audit'
            }, { status: 400 });
        }
        
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
        } else {
            // Verify professional belongs to this company
            const professional = await Bookingmng.findOne({ 
                _id: body.professionalId, 
                companyId 
            });
            
            if (!professional) {
                errors.professionalId = 'Professional not found in this company';
            }
        }
        
        // Check if service name already exists in this company
        if (body.name?.trim()) {
            const existingService = await Service.findOne({ 
                companyId,
                name: body.name.trim(),
                deletedAt: null
            });
            
            if (existingService) {
                errors.name = 'Service with this name already exists in your company';
            }
        }
        
        // Return validation errors if any
        if (Object.keys(errors).length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: errors
            }, { status: 400 });
        }
        
        // Prepare service data with SaaS fields
        const serviceData = {
            // SaaS fields
            companyId,
            createdBy: userId,
            
            // Service fields
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
        
        console.log(`✅ Service created: ${service.name} (${service._id}) for company ${companyId}`);
        
        return NextResponse.json({
            success: true,
            data: formatServiceResponse(service),
            message: 'Service created successfully'
        }, { status: 201 });
        
    } catch (error) {
        console.error('❌ [Services API] POST error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                error: `${field} already exists in this company`
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
        const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
        const userId = searchParams.get('userId') || session?.user?.id; // For audit
        
        if (!id || !companyId) {
            return NextResponse.json({
                success: false,
                error: 'Service ID and companyId are required'
            }, { status: 400 });
        }
        
        if (!isValidObjectId(id) || !isValidObjectId(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid ID format'
            }, { status: 400 });
        }
        
        // Verify service exists and belongs to this company
        const existing = await Service.findOne({ _id: id, companyId });
        if (!existing) {
            return NextResponse.json({
                success: false,
                error: 'Service not found in this company'
            }, { status: 404 });
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
        } else {
            // Verify professional belongs to this company
            const professional = await Bookingmng.findOne({ 
                _id: body.professionalId, 
                companyId 
            });
            
            if (!professional) {
                errors.professionalId = 'Professional not found in this company';
            }
        }
        
        // Check if service name already exists (excluding current service)
        if (body.name?.trim()) {
            const existingService = await Service.findOne({ 
                companyId,
                name: body.name.trim(),
                _id: { $ne: id },
                deletedAt: null
            });
            
            if (existingService) {
                errors.name = 'Service with this name already exists in your company';
            }
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
            
            // Audit field
            updatedBy: userId,
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
                error: 'Service with this name already exists in this company'
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
        const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
        const userId = searchParams.get('userId') || session?.user?.id; // For audit
        const action = searchParams.get('action');
        
        if (!id || !companyId) {
            return NextResponse.json({
                success: false,
                error: 'Service ID and companyId are required'
            }, { status: 400 });
        }
        
        if (!isValidObjectId(id) || !isValidObjectId(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid ID format'
            }, { status: 400 });
        }
        
        // Verify service exists and belongs to this company
        const existing = await Service.findOne({ _id: id, companyId });
        if (!existing) {
            return NextResponse.json({
                success: false,
                error: 'Service not found in this company'
            }, { status: 404 });
        }
        
        const body = await request.json();
        let updateData = { updatedBy: userId, updatedAt: new Date() };
        
        // Handle different actions
        if (action === 'activate') {
            updateData.isActive = true;
        } else if (action === 'deactivate') {
            updateData.isActive = false;
        } else if (action === 'increment-bookings') {
            updateData = { 
                $inc: { totalBookings: 1 },
                updatedBy: userId,
                updatedAt: new Date() 
            };
            
            const service = await Service.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
            
            return NextResponse.json({
                success: true,
                data: formatServiceResponse(service),
                message: 'Bookings incremented successfully'
            }, { status: 200 });
            
        } else if (action === 'restore') {
            // Restore soft deleted service
            updateData = {
                deletedAt: null,
                updatedBy: userId,
                updatedAt: new Date()
            };
        } else {
            // General partial update
            const { _id, companyId: _, createdBy, createdAt, totalBookings, popularity, ...updateFields } = body;
            updateData = {
                ...updateFields,
                updatedBy: userId,
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
        const companyId = searchParams.get('companyId'); // REQUIRED for SaaS
        const userId = searchParams.get('userId') || session?.user?.id; // For audit
        const permanent = searchParams.get('permanent') === 'true';
        
        if (!companyId || !isValidObjectId(companyId)) {
            return NextResponse.json({
                success: false,
                error: 'Valid companyId is required'
            }, { status: 400 });
        }
        
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
            
            // Verify all services belong to this company
            const services = await Service.find({ 
                _id: { $in: validIds },
                companyId 
            }).select('_id');
            
            if (services.length !== validIds.length) {
                return NextResponse.json({
                    success: false,
                    error: 'Some services do not belong to this company'
                }, { status: 403 });
            }
            
            if (permanent) {
                // Permanent delete
                const result = await Service.deleteMany({
                    _id: { $in: validIds },
                    companyId
                });
                
                console.log(`✅ Permanently deleted ${result.deletedCount} services`);
                
                return NextResponse.json({
                    success: true,
                    message: `Successfully deleted ${result.deletedCount} services`,
                    data: { deletedCount: result.deletedCount }
                }, { status: 200 });
            } else {
                // Soft delete
                const result = await Service.updateMany(
                    { _id: { $in: validIds }, companyId },
                    { 
                        deletedAt: new Date(),
                        updatedBy: userId,
                        isActive: false
                    }
                );
                
                console.log(`✅ Soft deleted ${result.modifiedCount} services`);
                
                return NextResponse.json({
                    success: true,
                    message: `Successfully deactivated ${result.modifiedCount} services`,
                    data: { modifiedCount: result.modifiedCount }
                }, { status: 200 });
            }
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
        
        // Verify service belongs to this company
        const service = await Service.findOne({ _id: id, companyId });
        if (!service) {
            return NextResponse.json({
                success: false,
                error: 'Service not found in this company'
            }, { status: 404 });
        }
        
        if (permanent) {
            // Permanent delete
            await Service.findByIdAndDelete(id);
            console.log(`✅ Service permanently deleted: ${service.name}`);
            
            return NextResponse.json({
                success: true,
                message: 'Service permanently deleted',
                data: { id: service._id.toString() }
            }, { status: 200 });
        } else {
            // Soft delete
            await Service.findByIdAndUpdate(
                id,
                { 
                    deletedAt: new Date(),
                    updatedBy: userId,
                    isActive: false
                }
            );
            
            console.log(`✅ Service soft deleted: ${service.name}`);
            
            return NextResponse.json({
                success: true,
                message: 'Service deactivated successfully',
                data: { id: service._id.toString() }
            }, { status: 200 });
        }
        
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
        description: 'Multi-tenant Services Management API',
        endpoints: {
            GET: {
                description: 'Fetch services (with filters) or single service by ID',
                required: ['companyId'],
                examples: [
                    '/api/bookingService/service?companyId=xxx&page=1&limit=20',
                    '/api/bookingService/service?companyId=xxx&category=beauty&status=active',
                    '/api/bookingService/service?companyId=xxx&id=123456789012345678901234'
                ]
            },
            POST: {
                description: 'Create a new service',
                required: ['companyId', 'userId'],
                example: '/api/bookingService/service'
            },
            PUT: {
                description: 'Full update of a service',
                required: ['companyId'],
                example: '/api/bookingService/service?companyId=xxx&id=123456789012345678901234'
            },
            PATCH: {
                description: 'Partial update or actions (activate/deactivate/increment-bookings/restore)',
                required: ['companyId'],
                example: '/api/bookingService/service?companyId=xxx&id=123&action=activate'
            },
            DELETE: {
                description: 'Delete single or multiple services (soft delete by default)',
                required: ['companyId'],
                examples: [
                    '/api/bookingService/service?companyId=xxx&id=123',
                    '/api/bookingService/service?companyId=xxx&ids=id1,id2,id3&permanent=true'
                ]
            }
        }
    }, { 
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-ID'
        }
    });
}