// app/api/clear-qr-cache/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Call the bot server to clear QR cache
    const botServerUrl = process.env.BOT_SERVER_URL || 'http://localhost:3001';
    const response = await fetch(`${botServerUrl}/api/clear-qr-cache?companyId=${companyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error clearing QR cache:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}