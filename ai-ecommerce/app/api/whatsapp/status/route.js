import bot from '../../../../../whatsap/bot';

export async function GET() {
    try {
        const status = bot.getStatus();
        const qrCode = bot.getCurrentQR();
        
        return Response.json({
            success: true,
            data: {
                connected: status.connected,
                authenticated: status.authenticated,
                hasQR: status.hasQR,
                qrCode: qrCode,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Status API error:', error);
        return Response.json({
            success: false,
            error: 'Failed to get bot status'
        }, { status: 500 });
    }
}