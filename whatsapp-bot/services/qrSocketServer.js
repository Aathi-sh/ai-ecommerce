// import WebSocket from 'ws';

// class QRSocketServer {
//     constructor() {
//         this.wss = null;
//         this.clients = new Set();
//         this.broadcastQueue = [];
//         this.isProcessingQueue = false;
//     }

//     initialize(server) {
//         this.wss = new WebSocket.Server({ server, path: '/ws' });
        
//         this.wss.on('connection', (ws) => {
//             console.log('🔗 New WebSocket client connected');
//             this.clients.add(ws);
            
//             // Send welcome message
//             ws.send(JSON.stringify({
//                 type: 'connected',
//                 message: 'Connected to WhatsApp bot server',
//                 timestamp: new Date().toISOString()
//             }));
            
//             ws.on('message', (message) => {
//                 try {
//                     const data = JSON.parse(message);
//                     this.handleMessage(ws, data);
//                 } catch (error) {
//                     console.error('❌ WebSocket message error:', error);
//                 }
//             });
            
//             ws.on('close', () => {
//                 console.log('🔌 WebSocket client disconnected');
//                 this.clients.delete(ws);
//             });
            
//             ws.on('error', (error) => {
//                 console.error('❌ WebSocket error:', error);
//                 this.clients.delete(ws);
//             });
//         });
        
//         console.log('📡 WebSocket server initialized');
        
//         // Start processing broadcast queue
//         this.processQueue();
//     }

//     handleMessage(ws, data) {
//         switch (data.type) {
//             case 'get_status':
//                 // You can implement status request handling here
//                 break;
                
//             case 'ping':
//                 ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
//                 break;
//         }
//     }

//     broadcastQR(qr) {
//         this.broadcast({
//             type: 'qr',
//             qr: qr,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastStatus(status, message, data = {}) {
//         this.broadcast({
//             type: 'status',
//             status: status,
//             message: message,
//             data: data,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastStats(stats) {
//         this.broadcast({
//             type: 'stats',
//             stats: stats,
//             timestamp: new Date().toISOString()
//         });
//     }

//     // ADD THIS METHOD - This was missing
//     broadcastBotInfo(botInfo) {
//         this.broadcast({
//             type: 'bot_info',
//             botInfo: botInfo,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastConnected(botInfo = {}) {
//         this.broadcast({
//             type: 'connected',
//             message: 'WhatsApp connected successfully',
//             botInfo: botInfo,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastDisconnected(reason) {
//         this.broadcast({
//             type: 'disconnected',
//             reason: reason,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastError(error, context = '') {
//         this.broadcast({
//             type: 'error',
//             message: error.message || error,
//             context: context,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastMessageSent(phoneNumber, message) {
//         this.broadcast({
//             type: 'message_sent',
//             phoneNumber: phoneNumber,
//             message: message.substring(0, 100), // Truncate long messages
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcastMessageError(phoneNumber, error) {
//         this.broadcast({
//             type: 'message_error',
//             phoneNumber: phoneNumber,
//             error: error.message || error,
//             timestamp: new Date().toISOString()
//         });
//     }

//     broadcast(data) {
//         this.broadcastQueue.push(data);
//     }

//     async processQueue() {
//         if (this.isProcessingQueue || this.broadcastQueue.length === 0) {
//             return;
//         }
        
//         this.isProcessingQueue = true;
        
//         while (this.broadcastQueue.length > 0) {
//             const data = this.broadcastQueue.shift();
//             const message = JSON.stringify(data);
            
//             // Send to all connected clients
//             this.clients.forEach(client => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     try {
//                         client.send(message);
//                     } catch (error) {
//                         console.error('❌ Failed to send WebSocket message:', error);
//                         this.clients.delete(client);
//                     }
//                 }
//             });
//         }
        
//         this.isProcessingQueue = false;
        
//         // Schedule next processing
//         setTimeout(() => this.processQueue(), 100);
//     }

//     getClientCount() {
//         return this.clients.size;
//     }

//     close() {
//         if (this.wss) {
//             this.clients.forEach(client => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.close();
//                 }
//             });
//             this.clients.clear();
//             this.wss.close();
//         }
//     }
// }

// // Create singleton instance
// const qrSocketServer = new QRSocketServer();
// export { qrSocketServer };



import { WebSocketServer } from 'ws';

class QRSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.broadcastQueue = [];
        this.isProcessingQueue = false;
    }

    initialize(server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });
        
        this.wss.on('connection', (ws) => {
            console.log('🔗 New WebSocket client connected');
            this.clients.add(ws);
            
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to WhatsApp bot server',
                timestamp: new Date().toISOString()
            }));
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('❌ WebSocket message error:', error);
                }
            });
            
            ws.on('close', () => {
                console.log('🔌 WebSocket client disconnected');
                this.clients.delete(ws);
            });
            
            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
        
        console.log('📡 WebSocket server initialized');
        
        // Start processing broadcast queue
        this.processQueue();
    }

    handleMessage(ws, data) {
        switch (data.type) {
            case 'get_status':
                // You can implement status request handling here
                break;
                
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                break;
        }
    }

    broadcastQR(qr) {
        this.broadcast({
            type: 'qr',
            qr: qr,
            timestamp: new Date().toISOString()
        });
    }

    broadcastStatus(status, message, data = {}) {
        this.broadcast({
            type: 'status',
            status: status,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        });
    }

    broadcastStats(stats) {
        this.broadcast({
            type: 'stats',
            stats: stats,
            timestamp: new Date().toISOString()
        });
    }

    broadcastBotInfo(botInfo) {
        this.broadcast({
            type: 'bot_info',
            botInfo: botInfo,
            timestamp: new Date().toISOString()
        });
    }

    broadcastConnected(botInfo = {}) {
        this.broadcast({
            type: 'connected',
            message: 'WhatsApp connected successfully',
            botInfo: botInfo,
            timestamp: new Date().toISOString()
        });
    }

    broadcastDisconnected(reason) {
        this.broadcast({
            type: 'disconnected',
            reason: reason,
            timestamp: new Date().toISOString()
        });
    }

    broadcastError(error, context = '') {
        this.broadcast({
            type: 'error',
            message: error.message || error,
            context: context,
            timestamp: new Date().toISOString()
        });
    }

    broadcastMessageSent(phoneNumber, message) {
        this.broadcast({
            type: 'message_sent',
            phoneNumber: phoneNumber,
            message: message.substring(0, 100),
            timestamp: new Date().toISOString()
        });
    }

    broadcastMessageError(phoneNumber, error) {
        this.broadcast({
            type: 'message_error',
            phoneNumber: phoneNumber,
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }

    broadcast(data) {
        this.broadcastQueue.push(data);
    }

    async processQueue() {
        if (this.isProcessingQueue || this.broadcastQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        while (this.broadcastQueue.length > 0) {
            const data = this.broadcastQueue.shift();
            const message = JSON.stringify(data);
            
            // Send to all connected clients
            this.clients.forEach(client => {
                if (client.readyState === 1) { // WebSocket.OPEN
                    try {
                        client.send(message);
                    } catch (error) {
                        console.error('❌ Failed to send WebSocket message:', error);
                        this.clients.delete(client);
                    }
                }
            });
        }
        
        this.isProcessingQueue = false;
        
        // Schedule next processing
        setTimeout(() => this.processQueue(), 100);
    }

    getClientCount() {
        return this.clients.size;
    }

    close() {
        if (this.wss) {
            this.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.close();
                }
            });
            this.clients.clear();
            this.wss.close();
        }
    }
}

// Create singleton instance
const qrSocketServer = new QRSocketServer();
export { qrSocketServer };