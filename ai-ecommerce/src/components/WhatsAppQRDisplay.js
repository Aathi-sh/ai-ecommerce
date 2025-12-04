import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';

const WhatsAppQRDisplay = () => {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('disconnected');
    const [message, setMessage] = useState('Connecting to WhatsApp...');
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const reconnectTimeout = useRef(null);

    const connectWebSocket = () => {
        // Determine WebSocket URL based on environment
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        try {
            ws.current = new WebSocket(wsUrl);
            
            ws.current.onopen = () => {
                console.log('🔗 Connected to QR WebSocket');
                setMessage('Waiting for QR code...');
                clearTimeout(reconnectTimeout.current);
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'qr_code':
                            setQrCode(data.data);
                            setStatus('qr_required');
                            setMessage('Scan QR code to connect WhatsApp');
                            console.log('📱 QR code received');
                            break;
                            
                        case 'status':
                            setStatus(data.status);
                            setMessage(data.message);
                            
                            if (data.status === 'connected') {
                                setIsConnected(true);
                                setQrCode(null);
                            } else if (data.status === 'disconnected') {
                                setIsConnected(false);
                            }
                            break;
                            
                        default:
                            break;
                    }
                } catch (error) {
                    console.error('❌ WebSocket message error:', error);
                }
            };

            ws.current.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setMessage('Connection lost. Reconnecting...');
                
                // Attempt reconnect after 5 seconds
                reconnectTimeout.current = setTimeout(() => {
                    connectWebSocket();
                }, 5000);
            };

            ws.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
        }
    };

    useEffect(() => {
        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            clearTimeout(reconnectTimeout.current);
        };
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case 'connected':
                return 'bg-green-500';
            case 'qr_required':
                return 'bg-yellow-500';
            case 'authenticated':
                return 'bg-blue-500';
            case 'loading':
                return 'bg-purple-500';
            default:
                return 'bg-red-500';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'qr_required':
                return 'QR Code Required';
            case 'authenticated':
                return 'Authenticated';
            case 'loading':
                return 'Loading';
            default:
                return 'Disconnected';
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
                    <h2 className="text-xl font-bold text-gray-800">WhatsApp Connection</h2>
                </div>
                <p className="text-gray-600 text-sm">{message}</p>
            </div>

            {/* QR Code Display */}
            {qrCode && (
                <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="text-center mb-3">
                            <p className="text-sm font-medium text-gray-700">
                                Scan this QR code with WhatsApp
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Open WhatsApp → Settings → Linked Devices → Link a Device
                            </p>
                        </div>
                        
                        <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-lg shadow-inner">
                                <QRCode 
                                    value={qrCode} 
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                    renderAs="canvas"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-500">
                                QR will refresh automatically when needed
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Status */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {getStatusText()}
                    </span>
                </div>
                
                {isConnected && (
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-700 text-center">
                            ✅ WhatsApp is connected and ready to receive messages
                        </p>
                    </div>
                )}
            </div>

            {/* Instructions */}
            {!isConnected && (
                <div className="mt-4 text-xs text-gray-500">
                    <h4 className="font-medium mb-1">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Open WhatsApp on your phone</li>
                        <li>Tap Menu → Linked Devices</li>
                        <li>Tap Link a Device</li>
                        <li>Scan the QR code above</li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default WhatsAppQRDisplay;