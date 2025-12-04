import { WebSocketServer } from 'ws';

class QRSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.currentQR = null;
        this.currentStats = {
            totalOrders: 0,
            totalChats: 0,
            totalCustomers: 0,
            totalMessages: 0
        };
    }

    initialize(server) {
        try {
            this.wss = new WebSocketServer({ 
                server,
                path: '/ws'
            });
            
            this.wss.on('connection', (ws) => {
                console.log('🔗 New client connected to WebSocket');
                this.clients.add(ws);

                // Send current QR if exists
                if (this.currentQR) {
                    this.sendToClient(ws, {
                        type: 'qr',
                        data: this.currentQR
                    });
                }

                // Send current stats
                this.sendToClient(ws, {
                    type: 'stats',
                    data: this.currentStats
                });

                // Send connection confirmation
                this.sendToClient(ws, {
                    type: 'connected',
                    message: 'WebSocket connected successfully'
                });

                ws.on('close', () => {
                    console.log('🔌 Client disconnected from WebSocket');
                    this.clients.delete(ws);
                });

                ws.on('error', (error) => {
                    console.error('❌ WebSocket client error:', error.message);
                    this.clients.delete(ws);
                });
            });

            console.log('✅ WebSocket server initialized on path /ws');

        } catch (error) {
            console.error('❌ WebSocket server initialization failed:', error);
        }
    }

    sendToClient(ws, message) {
        if (ws.readyState === 1) { // OPEN state
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('❌ Failed to send message to client:', error);
                this.clients.delete(ws);
            }
        }
    }

    broadcastQR(qrCode) {
        this.currentQR = qrCode;
        this.broadcastToAll({
            type: 'qr',
            data: qrCode
        });
    }

    broadcastStatus(status, message = '') {
        this.broadcastToAll({
            type: 'status',
            status: status,
            message: message
        });
    }

    broadcastStats(stats) {
        this.currentStats = { ...stats };
        this.broadcastToAll({
            type: 'stats',
            data: stats
        });
    }

    broadcastToAll(message) {
        const messageString = JSON.stringify(message);
        this.clients.forEach(client => {
            this.sendToClient(client, message);
        });
    }

    getClientCount() {
        return this.clients.size;
    }
}

export const qrSocketServer = new QRSocketServer();