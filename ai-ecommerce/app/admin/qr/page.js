'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRDashboard() {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('connecting');
    const [statusMessage, setStatusMessage] = useState('Connecting to WhatsApp service...');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalChats: 0,
        totalCustomers: 0,
        totalMessages: 0
    });
    const [botInfo, setBotInfo] = useState({
        pushname: '',
        platform: '',
        version: ''
    });
    
    const ws = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const statsIntervalRef = useRef(null);

    useEffect(() => {
        connectWebSocket();
        
        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (statsIntervalRef.current) {
                clearInterval(statsIntervalRef.current);
            }
        };
    }, []);

    const connectWebSocket = () => {
        // Clear existing connection
        if (ws.current) {
            ws.current.close();
        }

        // Clear pending reconnection
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        try {
            // Use the bot server WebSocket (port 3001)
            const wsUrl = 'ws://localhost:3001/ws';
            
            console.log('🔄 Connecting to WebSocket:', wsUrl);
            
            ws.current = new WebSocket(wsUrl);
            
            ws.current.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                setStatus('connected');
                setStatusMessage('Connected to WhatsApp service');
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message:', data.type);
                    
                    switch (data.type) {
                        case 'qr':
                            setQrCode(data.data);
                            setStatus('qr_required');
                            setStatusMessage('Scan QR code with WhatsApp to connect');
                            break;
                            
                        case 'status':
                            setStatus(data.status);
                            setStatusMessage(data.message);
                            break;

                        case 'stats':
                            setStats(prev => ({ ...prev, ...data.data }));
                            break;
                            
                        case 'bot_info':
                            setBotInfo(data.data);
                            break;
                            
                        case 'connected':
                            setStatus('connected');
                            setStatusMessage('Connected to WhatsApp service');
                            break;
                    }
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            ws.current.onclose = (event) => {
                console.log('🔌 WebSocket disconnected:', event.code, event.reason);
                setStatus('disconnected');
                setStatusMessage('Connection lost - Reconnecting...');
                
                // Auto-reconnect after 2 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connectWebSocket();
                }, 2000);
            };

            ws.current.onerror = (error) => {
                console.log('❌ WebSocket connection error');
                setStatus('error');
                setStatusMessage('Connection error - Retrying...');
            };

        } catch (error) {
            console.error('❌ WebSocket setup failed:', error);
            setStatus('error');
            setStatusMessage('Failed to connect - Retrying...');
            
            // Retry connection after error
            reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
            }, 3000);
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'connected':
            case 'authenticated':
                return 'bg-green-500';
            case 'qr_required':
            case 'qr_ready':
                return 'bg-yellow-500';
            case 'loading':
            case 'reconnecting':
                return 'bg-blue-500';
            case 'disconnected':
            case 'error':
            case 'auth_failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'connected':
            case 'authenticated':
                return '✅';
            case 'qr_required':
            case 'qr_ready':
                return '📱';
            case 'loading':
                return '🔄';
            case 'reconnecting':
                return '🔌';
            case 'disconnected':
                return '🔌';
            case 'error':
            case 'auth_failed':
                return '❌';
            default:
                return '🔄';
        }
    };

    const getStatusDisplayText = () => {
        switch (status) {
            case 'qr_required':
                return 'QR Required';
            case 'qr_ready':
                return 'QR Ready';
            case 'auth_failed':
                return 'Auth Failed';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    const handleManualReconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        connectWebSocket();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        WhatsApp Business Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Real-time monitoring and management of your WhatsApp e-commerce bot
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatNumber(stats.totalOrders)}
                                </div>
                                <div className="text-gray-600 font-medium">Total Orders</div>
                                <div className="text-sm text-gray-500 mt-1">All time orders processed</div>
                            </div>
                            <div className="text-blue-500 text-2xl bg-blue-50 p-3 rounded-full">📦</div>
                        </div>
                    </div>
                    
                    {/* Total Chats */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatNumber(stats.totalChats)}
                                </div>
                                <div className="text-gray-600 font-medium">Total Chats</div>
                                <div className="text-sm text-gray-500 mt-1">Active conversations</div>
                            </div>
                            <div className="text-green-500 text-2xl bg-green-50 p-3 rounded-full">💬</div>
                        </div>
                    </div>
                    
                    {/* Total Customers */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatNumber(stats.totalCustomers)}
                                </div>
                                <div className="text-gray-600 font-medium">Total Customers</div>
                                <div className="text-sm text-gray-500 mt-1">Unique customers served</div>
                            </div>
                            <div className="text-purple-500 text-2xl bg-purple-50 p-3 rounded-full">👥</div>
                        </div>
                    </div>
                    
                    {/* Total Messages */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {formatNumber(stats.totalMessages)}
                                </div>
                                <div className="text-gray-600 font-medium">Total Messages</div>
                                <div className="text-sm text-gray-500 mt-1">Messages processed</div>
                            </div>
                            <div className="text-orange-500 text-2xl bg-orange-50 p-3 rounded-full">✉️</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* QR Code & Connection Status */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    WhatsApp Connection
                                </h2>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {getStatusDisplayText()}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                            ws.current?.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-red-500'
                                        }`}></span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            ws.current?.readyState === WebSocket.OPEN 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {ws.current?.readyState === WebSocket.OPEN ? 'WEBSOCKET LIVE' : 'WEBSOCKET OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* QR Code Display */}
                            {qrCode ? (
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-dashed border-blue-200 mb-6 inline-block">
                                        <div className="bg-white p-6 rounded-lg shadow-inner">
                                            <QRCodeSVG 
                                                value={qrCode} 
                                                size={280}
                                                level="H"
                                                includeMargin={true}
                                                className="mx-auto"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xl text-gray-700 mb-4 font-semibold">
                                        Scan QR Code with WhatsApp
                                    </p>
                                    <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-3">Connection Instructions:</h4>
                                        <ol className="text-sm text-blue-700 space-y-2 text-left">
                                            <li className="flex items-center space-x-2">
                                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                                                <span>Open WhatsApp on your phone</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                                                <span>Go to Settings → Linked Devices</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                                                <span>Tap "Link a Device"</span>
                                            </li>
                                            <li className="flex items-center space-x-2">
                                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                                                <span>Scan the QR code above</span>
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✅</div>
                                    <p className="text-2xl text-gray-700 font-semibold mb-2">WhatsApp is Connected</p>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        Your WhatsApp business account is connected and ready to receive messages and process orders automatically.
                                    </p>
                                </div>
                            )}

                            {/* Status Message */}
                            <div className="text-center mt-8">
                                <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-xl ${
                                    status === 'connected' || status === 'authenticated' 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : status === 'qr_required' || status === 'qr_ready'
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                    <span className="text-2xl">{getStatusIcon()}</span>
                                    <span className="text-lg font-semibold">{statusMessage}</span>
                                </div>
                            </div>

                            {/* Connection Controls */}
                            <div className="flex justify-center mt-6 space-x-4">
                                <button
                                    onClick={handleManualReconnect}
                                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                                >
                                    <span>🔄</span>
                                    <span>Reconnect</span>
                                </button>
                                
                                {(status === 'disconnected' || status === 'error') && (
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
                                    >
                                        <span>🔃</span>
                                        <span>Refresh Page</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bot Information & Quick Stats */}
                    <div className="space-y-6">
                        {/* Bot Information */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Bot Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">WhatsApp Name</span>
                                    <span className="font-semibold text-gray-800">
                                        {botInfo.pushname || 'Not Connected'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Platform</span>
                                    <span className="font-semibold text-gray-800">
                                        {botInfo.platform || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Version</span>
                                    <span className="font-semibold text-gray-800">
                                        {botInfo.version || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => window.open('/admin/orders', '_blank')}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition duration-200 flex items-center space-x-3 group"
                                >
                                    <span className="text-blue-500 text-xl group-hover:scale-110 transition duration-200">📦</span>
                                    <div>
                                        <div className="font-semibold text-gray-800">View Orders</div>
                                        <div className="text-sm text-gray-600">Manage customer orders</div>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => window.open('/admin/products', '_blank')}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition duration-200 flex items-center space-x-3 group"
                                >
                                    <span className="text-green-500 text-xl group-hover:scale-110 transition duration-200">🛍️</span>
                                    <div>
                                        <div className="font-semibold text-gray-800">Products</div>
                                        <div className="text-sm text-gray-600">Manage product catalog</div>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={() => window.open('/admin/analytics', '_blank')}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition duration-200 flex items-center space-x-3 group"
                                >
                                    <span className="text-purple-500 text-xl group-hover:scale-110 transition duration-200">📊</span>
                                    <div>
                                        <div className="font-semibold text-gray-800">Analytics</div>
                                        <div className="text-sm text-gray-600">View performance metrics</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Connection Status */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Connection Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">WebSocket</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        ws.current?.readyState === WebSocket.OPEN 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {ws.current?.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">WhatsApp</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        status === 'connected' || status === 'authenticated'
                                            ? 'bg-green-100 text-green-800' 
                                            : status === 'qr_required' || status === 'qr_ready'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {getStatusDisplayText()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Last Update</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>WhatsApp Business Dashboard • Professional Edition • Real-time Updates</p>
                    <p className="mt-1">Connected to Bot Server: localhost:3001</p>
                </div>
            </div>
        </div>
    );
}