// app/api/user/activity/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, details, page, companyId } = body;

        console.log('📝 User Activity:', {
            user: session.user.email,
            companyId: companyId || session.user.companyId,
            action,
            page,
            details,
            timestamp: new Date().toISOString()
        });

        // Here you would save to database if needed
        // await ActivityLog.create({ ... })

        return NextResponse.json({
            success: true,
            message: 'Activity logged successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error logging user activity:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}