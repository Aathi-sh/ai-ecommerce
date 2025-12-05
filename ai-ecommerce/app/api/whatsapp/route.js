import { NextResponse } from 'next/server';

// WhatsApp bot server URL
const BOT_SERVER_URL = 'http://localhost:3001';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        
        console.log('📱 WhatsApp API Request:', { action });
        
        let response;
        
        switch (action) {
            case 'status':
                // Get bot status from bot server
                response = await fetch(`${BOT_SERVER_URL}/api/status`);
                const statusData = await response.json();
                return NextResponse.json(statusData);
                
            case 'qr':
                // Get current QR code from bot server
                response = await fetch(`${BOT_SERVER_URL}/api/qr`);
                const qrData = await response.json();
                return NextResponse.json(qrData);
                
            case 'stats':
                // Get bot statistics
                response = await fetch(`${BOT_SERVER_URL}/api/stats`);
                const statsData = await response.json();
                return NextResponse.json(statsData);
                
            default:
                // Get full bot information
                response = await fetch(`${BOT_SERVER_URL}/api/bot`);
                const botData = await response.json();
                return NextResponse.json(botData);
        }
        
    } catch (error) {
        console.error('❌ WhatsApp API Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to connect to WhatsApp bot server',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;
        
        console.log('📱 WhatsApp API POST Action:', action);
        
        let endpoint;
        let payload = {};
        
        switch (action) {
            case 'connect':
                endpoint = '/api/connect';
                break;
                
            case 'disconnect':
                endpoint = '/api/disconnect';
                break;
                
            case 'restart':
                endpoint = '/api/restart';
                break;
                
            case 'logout':
                endpoint = '/api/logout';
                break;
                
            case 'send_message':
                endpoint = '/api/send-message';
                payload = {
                    to: body.to,
                    message: body.message
                };
                break;
                
            case 'clear_session':
                endpoint = '/api/clear-session';
                break;
                
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
        
        // Forward request to bot server
        const response = await fetch(`${BOT_SERVER_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('❌ WhatsApp API POST Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to execute action',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { action } = body;
        
        if (action === 'update_settings') {
            // Update bot settings
            const response = await fetch(`${BOT_SERVER_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body.settings)
            });
            
            const data = await response.json();
            return NextResponse.json(data);
        }
        
        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
        
    } catch (error) {
        console.error('❌ WhatsApp API PUT Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to update settings',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        // Clear all sessions
        const response = await fetch(`${BOT_SERVER_URL}/api/clear-all`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('❌ WhatsApp API DELETE Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to clear sessions',
                message: error.message 
            },
            { status: 500 }
        );
    }
}