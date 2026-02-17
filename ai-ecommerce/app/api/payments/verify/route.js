// app/api/payments/verify/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// In-memory storage for testing if MongoDB not ready
let paymentVerifications = [];

// Connect to MongoDB
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Continue with in-memory storage for testing
  }
}

// Simple PaymentVerification schema for in-memory or MongoDB
class PaymentVerificationSchema {
  constructor(data = {}) {
    this._id = data._id || `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.orderNumber = data.orderNumber;
    this.customerPhone = data.customerPhone;
    this.orderReference = data.orderReference;
    this.orderDetails = data.orderDetails || {};
    this.paymentProof = data.paymentProof || {};
    this.ocrAnalysis = data.ocrAnalysis || {};
    this.detectedPayment = data.detectedPayment || {};
    this.validationResults = data.validationResults || {};
    this.fraudAnalysis = data.fraudAnalysis || {};
    this.status = data.status || 'pending';
    this.verifiedAt = data.verifiedAt;
    this.verifiedBy = data.verifiedBy;
    this.rejectedAt = data.rejectedAt;
    this.rejectedBy = data.rejectedBy;
    this.rejectionReason = data.rejectionReason;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// Handle POST request - Create payment verification
export async function POST(request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    console.log('📥 Received payment verification request:', {
      orderNumber: body.orderNumber,
      customerPhone: body.customerPhone,
      hasOrderReference: !!body.orderReference
    });

    // Validate required fields
    if (!body.orderNumber || !body.customerPhone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order number and customer phone are required' 
        },
        { status: 400 }
      );
    }

    // Create payment verification object
    const paymentVerification = new PaymentVerificationSchema({
      orderNumber: body.orderNumber,
      customerPhone: body.customerPhone,
      orderReference: body.orderReference || `order_${body.orderNumber}`,
      orderDetails: body.orderDetails || {},
      paymentProof: body.paymentProof || {},
      ocrAnalysis: body.ocrAnalysis || {},
      detectedPayment: body.detectedPayment || {},
      validationResults: body.validationResults || {},
      fraudAnalysis: body.fraudAnalysis || {},
      status: 'pending'
    });

    // Try to save to MongoDB if available
    let savedVerification;
    try {
      await connectToDatabase();
      
      // If MongoDB is connected, use a real model
      if (mongoose.connections[0].readyState === 1) {
        // Define Mongoose schema if not already defined
        let PaymentVerificationModel;
        if (mongoose.models.PaymentVerification) {
          PaymentVerificationModel = mongoose.models.PaymentVerification;
        } else {
          const paymentVerificationSchema = new mongoose.Schema({
            orderNumber: { type: String, required: true, unique: true },
            customerPhone: { type: String, required: true },
            orderReference: { type: String, required: true },
            orderDetails: {
              totalAmount: Number,
              items: Array,
              shippingAddress: Object,
              pincode: String
            },
            paymentProof: {
              imageData: String,
              mimeType: String,
              uploadedAt: { type: Date, default: Date.now }
            },
            ocrAnalysis: {
              extractedText: String,
              confidenceScore: Number,
              processedAt: { type: Date, default: Date.now }
            },
            detectedPayment: {
              amount: Number,
              upiId: String,
              transactionId: String,
              transactionTime: Date,
              status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' }
            },
            validationResults: {
              amountMatch: Boolean,
              upiMatch: Boolean,
              confidenceScore: Number,
              validationErrors: [String]
            },
            fraudAnalysis: {
              isSuspicious: Boolean,
              fraudScore: Number,
              reasons: [String]
            },
            status: { 
              type: String, 
              enum: ['pending', 'processing', 'verified', 'rejected', 'fraud', 'manual_review'], 
              default: 'pending' 
            },
            verifiedAt: Date,
            verifiedBy: String,
            rejectedAt: Date,
            rejectedBy: String,
            rejectionReason: String,
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
          });

          PaymentVerificationModel = mongoose.model('PaymentVerification', paymentVerificationSchema);
        }

        // Save to MongoDB
        savedVerification = new PaymentVerificationModel(paymentVerification);
        await savedVerification.save();
        savedVerification = savedVerification.toObject();
      } else {
        // Fallback to in-memory storage
        paymentVerifications.push(paymentVerification);
        savedVerification = paymentVerification;
      }
    } catch (dbError) {
      console.log('⚠️ Using in-memory storage due to DB error:', dbError.message);
      // Use in-memory storage
      paymentVerifications.push(paymentVerification);
      savedVerification = paymentVerification;
    }

    console.log('✅ Payment verification created:', savedVerification._id);

    return NextResponse.json({
      success: true,
      message: 'Payment verification created successfully',
      data: savedVerification
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in payment verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET request - Get payment verifications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerPhone = searchParams.get('customerPhone');
    const orderNumber = searchParams.get('orderNumber');

    console.log('📥 GET payment verifications query:', { status, customerPhone, orderNumber });

    let results = [];

    try {
      await connectToDatabase();
      
      // Try to get from MongoDB if available
      if (mongoose.connections[0].readyState === 1) {
        let PaymentVerificationModel;
        if (mongoose.models.PaymentVerification) {
          PaymentVerificationModel = mongoose.models.PaymentVerification;
        }

        if (PaymentVerificationModel) {
          let query = {};
          
          if (status) query.status = status;
          if (customerPhone) query.customerPhone = customerPhone;
          if (orderNumber) query.orderNumber = orderNumber;

          results = await PaymentVerificationModel.find(query)
            .sort({ createdAt: -1 })
            .lean();
        }
      } else {
        // Fallback to in-memory storage
        results = paymentVerifications.filter(pv => {
          if (status && pv.status !== status) return false;
          if (customerPhone && pv.customerPhone !== customerPhone) return false;
          if (orderNumber && pv.orderNumber !== orderNumber) return false;
          return true;
        });
      }
    } catch (dbError) {
      console.log('⚠️ Using in-memory storage for GET:', dbError.message);
      // Use in-memory storage
      results = paymentVerifications.filter(pv => {
        if (status && pv.status !== status) return false;
        if (customerPhone && pv.customerPhone !== customerPhone) return false;
        if (orderNumber && pv.orderNumber !== orderNumber) return false;
        return true;
      });
    }

    console.log(`✅ Found ${results.length} payment verifications`);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ Error fetching payment verifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle PATCH request - Update payment verification
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('verificationId');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment verification ID is required' 
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    console.log('📥 PATCH payment verification:', { id, updateData: body });

    let updatedVerification;

    try {
      await connectToDatabase();
      
      // Try to update in MongoDB if available
      if (mongoose.connections[0].readyState === 1) {
        let PaymentVerificationModel;
        if (mongoose.models.PaymentVerification) {
          PaymentVerificationModel = mongoose.models.PaymentVerification;
        }

        if (PaymentVerificationModel) {
          const verification = await PaymentVerificationModel.findById(id);
          
          if (!verification) {
            return NextResponse.json(
              { success: false, message: 'Payment verification not found' },
              { status: 404 }
            );
          }

          // Update fields
          Object.keys(body).forEach(key => {
            if (body[key] !== undefined) {
              verification[key] = body[key];
            }
          });

          verification.updatedAt = new Date();
          await verification.save();
          updatedVerification = verification.toObject();
        }
      } else {
        // Update in-memory storage
        const index = paymentVerifications.findIndex(pv => pv._id === id);
        
        if (index === -1) {
          return NextResponse.json(
            { success: false, message: 'Payment verification not found' },
            { status: 404 }
          );
        }

        // Update verification
        paymentVerifications[index] = {
          ...paymentVerifications[index],
          ...body,
          updatedAt: new Date()
        };
        updatedVerification = paymentVerifications[index];
      }
    } catch (dbError) {
      console.log('⚠️ Using in-memory storage for PATCH:', dbError.message);
      
      // Update in-memory storage
      const index = paymentVerifications.findIndex(pv => pv._id === id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, message: 'Payment verification not found' },
          { status: 404 }
        );
      }

      paymentVerifications[index] = {
        ...paymentVerifications[index],
        ...body,
        updatedAt: new Date()
      };
      updatedVerification = paymentVerifications[index];
    }

    console.log('✅ Payment verification updated:', updatedVerification._id);

    return NextResponse.json({
      success: true,
      message: 'Payment verification updated successfully',
      data: updatedVerification
    });

  } catch (error) {
    console.error('❌ Error updating payment verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle PUT request - Complete payment verification (for auto-verify)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'verify', 'reject', 'mark-fraud'
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment verification ID is required' 
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    console.log('📥 PUT payment verification:', { id, action, body });

    let updatedVerification;

    try {
      await connectToDatabase();
      
      // Try to update in MongoDB if available
      if (mongoose.connections[0].readyState === 1) {
        let PaymentVerificationModel;
        if (mongoose.models.PaymentVerification) {
          PaymentVerificationModel = mongoose.models.PaymentVerification;
        }

        if (PaymentVerificationModel) {
          const verification = await PaymentVerificationModel.findById(id);
          
          if (!verification) {
            return NextResponse.json(
              { success: false, message: 'Payment verification not found' },
              { status: 404 }
            );
          }

          // Handle different actions
          if (action === 'verify' || body.status === 'verified') {
            verification.status = 'verified';
            verification.verifiedAt = new Date();
            verification.verifiedBy = body.verifiedBy || 'auto-verification';
            
            if (body.confidenceScore) {
              verification.validationResults.confidenceScore = body.confidenceScore;
            }
            
            if (body.verificationResult) {
              verification.validationResults = {
                ...verification.validationResults,
                ...body.verificationResult
              };
            }
          } 
          else if (action === 'reject' || body.status === 'rejected') {
            verification.status = 'rejected';
            verification.rejectedAt = new Date();
            verification.rejectedBy = body.rejectedBy || 'admin';
            verification.rejectionReason = body.reason || body.rejectionReason;
          }
          else if (action === 'mark-fraud' || body.status === 'fraud') {
            verification.status = 'fraud';
            verification.fraudAnalysis = {
              ...verification.fraudAnalysis,
              markedAsFraud: true,
              reasons: body.reasons || ['Marked as fraud by admin']
            };
          }

          verification.updatedAt = new Date();
          await verification.save();
          updatedVerification = verification.toObject();
        }
      } else {
        // Update in-memory storage
        const index = paymentVerifications.findIndex(pv => pv._id === id);
        
        if (index === -1) {
          return NextResponse.json(
            { success: false, message: 'Payment verification not found' },
            { status: 404 }
          );
        }

        let verification = { ...paymentVerifications[index] };

        // Handle different actions
        if (action === 'verify' || body.status === 'verified') {
          verification.status = 'verified';
          verification.verifiedAt = new Date();
          verification.verifiedBy = body.verifiedBy || 'auto-verification';
          
          if (body.confidenceScore) {
            verification.validationResults.confidenceScore = body.confidenceScore;
          }
          
          if (body.verificationResult) {
            verification.validationResults = {
              ...verification.validationResults,
              ...body.verificationResult
            };
          }
        } 
        else if (action === 'reject' || body.status === 'rejected') {
          verification.status = 'rejected';
          verification.rejectedAt = new Date();
          verification.rejectedBy = body.rejectedBy || 'admin';
          verification.rejectionReason = body.reason || body.rejectionReason;
        }
        else if (action === 'mark-fraud' || body.status === 'fraud') {
          verification.status = 'fraud';
          verification.fraudAnalysis = {
            ...verification.fraudAnalysis,
            markedAsFraud: true,
            reasons: body.reasons || ['Marked as fraud by admin']
          };
        }

        verification.updatedAt = new Date();
        paymentVerifications[index] = verification;
        updatedVerification = verification;
      }
    } catch (dbError) {
      console.log('⚠️ Using in-memory storage for PUT:', dbError.message);
      
      // Update in-memory storage
      const index = paymentVerifications.findIndex(pv => pv._id === id);
      
      if (index === -1) {
        return NextResponse.json(
          { success: false, message: 'Payment verification not found' },
          { status: 404 }
        );
      }

      let verification = { ...paymentVerifications[index] };

      // Handle different actions
      if (action === 'verify' || body.status === 'verified') {
        verification.status = 'verified';
        verification.verifiedAt = new Date();
        verification.verifiedBy = body.verifiedBy || 'auto-verification';
        
        if (body.confidenceScore) {
          verification.validationResults.confidenceScore = body.confidenceScore;
        }
        
        if (body.verificationResult) {
          verification.validationResults = {
            ...verification.validationResults,
            ...body.verificationResult
          };
        }
      } 
      else if (action === 'reject' || body.status === 'rejected') {
        verification.status = 'rejected';
        verification.rejectedAt = new Date();
        verification.rejectedBy = body.rejectedBy || 'admin';
        verification.rejectionReason = body.reason || body.rejectionReason;
      }
      else if (action === 'mark-fraud' || body.status === 'fraud') {
        verification.status = 'fraud';
        verification.fraudAnalysis = {
          ...verification.fraudAnalysis,
          markedAsFraud: true,
          reasons: body.reasons || ['Marked as fraud by admin']
        };
      }

      verification.updatedAt = new Date();
      paymentVerifications[index] = verification;
      updatedVerification = verification;
    }

    console.log('✅ Payment verification action completed:', { id, action, status: updatedVerification.status });

    return NextResponse.json({
      success: true,
      message: `Payment verification ${action || 'updated'} successfully`,
      data: updatedVerification
    });

  } catch (error) {
    console.error('❌ Error in PUT payment verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle DELETE request - Remove payment verification
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment verification ID is required' 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ DELETE payment verification:', id);

    let deleted = false;

    try {
      await connectToDatabase();
      
      // Try to delete from MongoDB if available
      if (mongoose.connections[0].readyState === 1) {
        let PaymentVerificationModel;
        if (mongoose.models.PaymentVerification) {
          PaymentVerificationModel = mongoose.models.PaymentVerification;
        }

        if (PaymentVerificationModel) {
          const result = await PaymentVerificationModel.findByIdAndDelete(id);
          deleted = !!result;
        }
      } else {
        // Delete from in-memory storage
        const initialLength = paymentVerifications.length;
        paymentVerifications = paymentVerifications.filter(pv => pv._id !== id);
        deleted = paymentVerifications.length < initialLength;
      }
    } catch (dbError) {
      console.log('⚠️ Using in-memory storage for DELETE:', dbError.message);
      
      // Delete from in-memory storage
      const initialLength = paymentVerifications.length;
      paymentVerifications = paymentVerifications.filter(pv => pv._id !== id);
      deleted = paymentVerifications.length < initialLength;
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Payment verification not found' },
        { status: 404 }
      );
    }

    console.log('✅ Payment verification deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Payment verification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting payment verification:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// ✅ FIXED: Export only once, not duplicate
// The functions are already exported above with 'export async function'
// No need for additional export statement