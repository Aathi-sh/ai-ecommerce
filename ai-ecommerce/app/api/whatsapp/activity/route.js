// app/api/whatsapp/activity/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

export async function GET(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get('companyId') || session.user.companyId;
        const limit = parseInt(searchParams.get('limit') || '8');

        console.log(`📊 Fetching activity log for company: ${companyId}`);

        // Mock activities for now (replace with actual DB query later)
        const activities = [
            {
                id: Date.now() - 30000,
                message: companyId ? `WhatsApp connected for company` : 'WhatsApp connected',
                type: 'success',
                timestamp: new Date(Date.now() - 30000).toLocaleTimeString()
            },
            {
                id: Date.now() - 60000,
                message: 'Ready to receive messages',
                type: 'info',
                timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
            },
            {
                id: Date.now() - 120000,
                message: 'Session restored from MongoDB',
                type: 'info',
                timestamp: new Date(Date.now() - 120000).toLocaleTimeString()
            }
        ];

        return NextResponse.json({
            success: true,
            activities: activities.slice(0, limit),
            companyId,
            count: activities.slice(0, limit).length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error fetching activity log:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}