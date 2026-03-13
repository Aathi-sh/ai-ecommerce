// app/api/setup/create-super-admin/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: 'athishask2005@gmail.com' 
    });
    
    if (existingSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Super admin already exists!',
        user: {
          email: existingSuperAdmin.email,
          role: existingSuperAdmin.role,
          adminType: existingSuperAdmin.adminType
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Aathish@5265', 12);
    
    // Create super admin with VALID phone number
    const superAdmin = await User.create({
      fullName: 'Super Admin',
      email: 'athishask2005@gmail.com',
      password: hashedPassword,
      role: 'admin',
      adminType: 'super',
      isVerified: true,
      status: 'active',
      phone: '7812815988', // ← ADD A VALID 10-DIGIT PHONE NUMBER
      notificationSettings: {
        pushNotifications: { enabled: true, lastUpdated: new Date() },
        settingsUpdatedAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      loginCount: 0,
      security: {
        failedLoginAttempts: 0,
        loginHistory: []
      }
    });

    return NextResponse.json({
      success: true,
      message: '✅ Super Admin created successfully!',
      credentials: {
        email: 'athishask2005@gmail.com',
        password: 'Aathish@5265',
        role: superAdmin.role,
        adminType: superAdmin.adminType,
        phone: superAdmin.phone
      },
      warning: 'DELETE THIS FILE AFTER USE!'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

//  http://localhost:3000/api/setup/create-super-admin