// /app/api/companies/by-whatsapp/route.js
// PROFESSIONAL COMBINED ROUTE - Handles all WhatsApp company lookups
// Supports: Phone lookup, Primary number, All numbers, Company details

import { NextResponse } from 'next/server';
import { connectDB } from "@/utils/db";
import Company from '@/models/Company';

export async function GET(request) {
  try {
    // Connect to database
    await connectDB ();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const companyId = searchParams.get('companyId');
    const fields = searchParams.get('fields') || 'basic'; // basic, primary, all, numbers, status
    
    // Validate input - at least one identifier required
    if (!phone && !companyId) {
      return NextResponse.json({
        success: false,
        error: 'Either phone or companyId is required'
      }, { status: 400 });
    }

    let company = null;
    let query = { status: 'active', deletedAt: null };

    // ===== CASE 1: Lookup by phone number =====
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      console.log(`🔍 [API] Looking up company by phone: ${cleanPhone}`);

      // Try multiple phone formats
      const phoneVariations = [
        cleanPhone,
        cleanPhone.slice(-10), // Last 10 digits
        `91${cleanPhone.slice(-10)}`, // With Indian country code
        `+91${cleanPhone.slice(-10)}` // With +91
      ].filter(Boolean);

      company = await Company.findOne({
        $and: [
          { status: 'active', deletedAt: null },
          {
            $or: [
              // Check in main whatsapp field
              { 'whatsapp.phoneNumber': { $in: phoneVariations } },
              // Check in routing numbers
              { 'whatsappRouting.phoneNumbers.number': { $in: phoneVariations } }
            ]
          }
        ]
      }).select('_id companyName companyEmail companyPhone whatsapp whatsappRouting subscription features');
    }

    // ===== CASE 2: Lookup by company ID =====
    if (companyId && !company) {
      console.log(`🔍 [API] Looking up company by ID: ${companyId}`);
      company = await Company.findOne({
        _id: companyId,
        status: 'active',
        deletedAt: null
      }).select('_id companyName companyEmail companyPhone whatsapp whatsappRouting subscription features');
    }

    // If no company found
    if (!company) {
      return NextResponse.json({
        success: false,
        error: phone ? 'No company found with this WhatsApp number' : 'Company not found'
      }, { status: 404 });
    }

    // ===== BUILD RESPONSE BASED ON FIELDS PARAMETER =====
    let responseData = {
      _id: company._id,
      companyName: company.companyName
    };

    // CASE: Return only basic info
    if (fields === 'basic') {
      return NextResponse.json({
        success: true,
        data: responseData
      });
    }

    // CASE: Return primary WhatsApp number
    if (fields === 'primary') {
      const primaryNumber = company.primaryWhatsappNumber;
      return NextResponse.json({
        success: true,
        data: {
          ...responseData,
          primaryNumber,
          hasWhatsApp: !!primaryNumber,
          isConnected: company.whatsapp?.isConnected || false,
          connectionStatus: company.whatsapp?.connectionStatus || 'disconnected'
        }
      });
    }

    // CASE: Return all WhatsApp numbers
    if (fields === 'numbers' || fields === 'all') {
      const allNumbers = [];
      
      // Add primary WhatsApp number if exists
      if (company.whatsapp?.phoneNumber) {
        allNumbers.push({
          number: company.whatsapp.phoneNumber,
          type: 'primary',
          isActive: true,
          description: 'Main WhatsApp number'
        });
      }
      
      // Add routing numbers
      if (company.whatsappRouting?.phoneNumbers?.length > 0) {
        company.whatsappRouting.phoneNumbers.forEach(p => {
          if (p.isActive) {
            allNumbers.push({
              number: p.number,
              type: p.isPrimary ? 'routing_primary' : 'routing',
              isPrimary: p.isPrimary || false,
              isActive: p.isActive,
              description: p.description || 'WhatsApp routing number',
              verifiedAt: p.verifiedAt
            });
          }
        });
      }

      responseData.whatsappNumbers = allNumbers;
      responseData.totalNumbers = allNumbers.length;
      responseData.isConnected = company.whatsapp?.isConnected || false;
    }

    // CASE: Return WhatsApp status
    if (fields === 'status') {
      responseData.whatsappStatus = {
        isConnected: company.whatsapp?.isConnected || false,
        connectionStatus: company.whatsapp?.connectionStatus || 'disconnected',
        phoneNumber: company.primaryWhatsappNumber,
        connectedAt: company.whatsapp?.connectedAt,
        lastMessageAt: company.whatsapp?.lastMessageAt,
        lastError: company.whatsapp?.lastError,
        clientId: company.whatsapp?.clientId,
        deviceInfo: company.whatsapp?.deviceInfo
      };
    }

    // CASE: Return full company details
    if (fields === 'full') {
      responseData = {
        ...responseData,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        address: company.address,
        gstin: company.gstin,
        pan: company.pan,
        subscription: company.subscription,
        features: company.features,
        whatsapp: {
          isConnected: company.whatsapp?.isConnected,
          connectionStatus: company.whatsapp?.connectionStatus,
          phoneNumber: company.whatsapp?.phoneNumber,
          clientId: company.whatsapp?.clientId,
          lastMessageAt: company.whatsapp?.lastMessageAt,
          deviceInfo: company.whatsapp?.deviceInfo
        },
        whatsappRouting: {
          phoneNumbers: company.whatsappRouting?.phoneNumbers?.filter(p => p.isActive) || [],
          autoResponse: company.whatsappRouting?.autoResponse,
          fallback: company.whatsappRouting?.fallback
        },
        stats: company.stats,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ [API] Company WhatsApp lookup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: POST method to register a new WhatsApp number
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyId, phoneNumber, isPrimary, description } = body;
    
    if (!companyId || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'companyId and phoneNumber are required'
      }, { status: 400 });
    }
    
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    
    // Add WhatsApp number using model method
    await company.addWhatsAppNumber(phoneNumber, isPrimary || false);
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp number added successfully',
      data: {
        companyId: company._id,
        phoneNumber,
        isPrimary: isPrimary || false
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Add WhatsApp number error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Optional: PATCH method to update WhatsApp status
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyId, status, data } = body;
    
    if (!companyId || !status) {
      return NextResponse.json({
        success: false,
        error: 'companyId and status are required'
      }, { status: 400 });
    }
    
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }
    
    // Update WhatsApp status using model method
    await company.updateWhatsAppStatus(status, data || {});
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp status updated successfully',
      data: {
        companyId: company._id,
        status,
        isConnected: company.whatsapp?.isConnected,
        connectionStatus: company.whatsapp?.connectionStatus
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Update WhatsApp status error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}