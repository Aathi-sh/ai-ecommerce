// /app/api/companies/with-whatsapp/route.js
// PROFESSIONAL ROUTE - Get all companies with WhatsApp capabilities
// Supports filtering by connection status, active status, and more

import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Company from '@/models/Company';

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const connected = searchParams.get('connected'); // 'true' or 'false'
    const status = searchParams.get('status'); // 'active', 'pending', etc.
    const hasPhone = searchParams.get('hasPhone'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    console.log('🔍 [API] Fetching companies with WhatsApp filters:', {
      connected,
      status,
      hasPhone,
      limit,
      page
    });

    // Build query based on filters
    const query = { deletedAt: null };
    
    // Filter by connection status
    if (connected === 'true') {
      query['whatsapp.isConnected'] = true;
      query['whatsapp.connectionStatus'] = 'connected';
    } else if (connected === 'false') {
      query['whatsapp.isConnected'] = false;
    }
    
    // Filter by company status
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active companies
    }
    
    // Filter by having phone numbers
    if (hasPhone === 'true') {
      query.$or = [
        { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
        { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
      ];
    }

    // Get total count for pagination
    const total = await Company.countDocuments(query);
    
    // Fetch companies with selected fields
    const companies = await Company.find(query)
      .select({
        _id: 1,
        companyName: 1,
        companyEmail: 1,
        companyPhone: 1,
        status: 1,
        'whatsapp.isConnected': 1,
        'whatsapp.connectionStatus': 1,
        'whatsapp.phoneNumber': 1,
        'whatsapp.clientId': 1,
        'whatsapp.connectedAt': 1,
        'whatsapp.lastMessageAt': 1,
        'whatsapp.deviceInfo': 1,
        'whatsappRouting.phoneNumbers': 1,
        'subscription.plan': 1,
        'features.whatsappBot': 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`✅ [API] Found ${companies.length} companies (total: ${total})`);

    // Format the response data
    const formattedCompanies = companies.map(company => {
      // Get all active WhatsApp numbers
      const whatsappNumbers = [];
      
      // Add main WhatsApp number if exists
      if (company.whatsapp?.phoneNumber) {
        whatsappNumbers.push({
          number: company.whatsapp.phoneNumber,
          type: 'primary',
          isActive: true,
          isConnected: company.whatsapp.isConnected || false
        });
      }
      
      // Add routing numbers if they exist
      if (company.whatsappRouting?.phoneNumbers?.length > 0) {
        company.whatsappRouting.phoneNumbers.forEach(p => {
          if (p.isActive) {
            whatsappNumbers.push({
              number: p.number,
              type: p.isPrimary ? 'routing_primary' : 'routing',
              isPrimary: p.isPrimary || false,
              isActive: p.isActive,
              description: p.description,
              verifiedAt: p.verifiedAt
            });
          }
        });
      }

      return {
        _id: company._id,
        companyName: company.companyName,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        status: company.status,
        subscription: {
          plan: company.subscription?.plan || 'free'
        },
        features: {
          whatsappBot: company.features?.whatsappBot || false
        },
        whatsapp: {
          isConnected: company.whatsapp?.isConnected || false,
          connectionStatus: company.whatsapp?.connectionStatus || 'disconnected',
          phoneNumber: company.whatsapp?.phoneNumber,
          clientId: company.whatsapp?.clientId,
          connectedAt: company.whatsapp?.connectedAt,
          lastMessageAt: company.whatsapp?.lastMessageAt,
          deviceInfo: company.whatsapp?.deviceInfo
        },
        whatsappNumbers,
        totalNumbers: whatsappNumbers.length,
        hasActiveWhatsApp: whatsappNumbers.length > 0,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    });

    // Return successful response with pagination
    return NextResponse.json({
      success: true,
      data: formattedCompanies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: skip + companies.length < total
      },
      filters: {
        connected,
        status,
        hasPhone
      }
    });

  } catch (error) {
    console.error('❌ [API] Error fetching companies with WhatsApp:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch companies'
    }, { status: 500 });
  }
}

// Optional: GET statistics summary
export async function HEAD(request) {
  try {
    await connectDB();
    
    // Get statistics
    const total = await Company.countDocuments({ 
      status: 'active', 
      deletedAt: null 
    });
    
    const connected = await Company.countDocuments({
      status: 'active',
      deletedAt: null,
      'whatsapp.isConnected': true,
      'whatsapp.connectionStatus': 'connected'
    });
    
    const withPhone = await Company.countDocuments({
      status: 'active',
      deletedAt: null,
      $or: [
        { 'whatsapp.phoneNumber': { $exists: true, $ne: null } },
        { 'whatsappRouting.phoneNumbers.0': { $exists: true } }
      ]
    });
    
    return NextResponse.json({
      success: true,
      data: {
        total,
        connected,
        withPhone,
        disconnected: total - connected,
        withoutPhone: total - withPhone
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}