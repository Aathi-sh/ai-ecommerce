// import { useState, useEffect, useRef } from 'react';
// import QRCode from 'qrcode.react';

// export default function WhatsAppQRDisplay() {
//     const [qrCode, setQrCode] = useState(null);
//     const [status, setStatus] = useState('disconnected');
//     const [statusMessage, setStatusMessage] = useState('Connecting to WhatsApp...');
//     const [isConnected, setIsConnected] = useState(false);
//     const ws = useRef(null);

//     useEffect(() => {
//         connectWebSocket();
        
//         return () => {
//             if (ws.current) {
//                 ws.current.close();
//             }
//         };
//     }, []);

//     const connectWebSocket = () => {
//         const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//         const wsUrl = `${protocol}//${window.location.host}`;
        
//         ws.current = new WebSocket(wsUrl);
        
//         ws.current.onopen = () => {
//             console.log('🔗 Connected to QR WebSocket');
//             setStatus('connecting');
//             setStatusMessage('Connected to server. Waiting for QR code...');
//         };

//         ws.current.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
                
//                 switch (data.type) {
//                     case 'qr':
//                         setQrCode(data.data);
//                         setStatus('qr_required');
//                         setStatusMessage('Scan the QR code with your WhatsApp');
//                         setIsConnected(false);
//                         break;
                        
//                     case 'status':
//                         setStatus(data.status);
//                         setStatusMessage(data.message);
                        
//                         if (data.status === 'connected') {
//                             setIsConnected(true);
//                             setQrCode(null);
//                         } else if (data.status === 'disconnected') {
//                             setIsConnected(false);
//                         }
//                         break;
                        
//                     default:
//                         console.log('Unknown message type:', data.type);
//                 }
//             } catch (error) {
//                 console.error('❌ WebSocket message error:', error);
//             }
//         };

//         ws.current.onclose = () => {
//             console.log('🔌 WebSocket disconnected');
//             setStatus('disconnected');
//             setStatusMessage('Connection lost. Reconnecting...');
//             setIsConnected(false);
            
//             // Reconnect after 3 seconds
//             setTimeout(() => {
//                 connectWebSocket();
//             }, 3000);
//         };

//         ws.current.onerror = (error) => {
//             console.error('❌ WebSocket error:', error);
//             setStatus('error');
//             setStatusMessage('Connection error. Please refresh the page.');
//         };
//     };

//     const getStatusColor = () => {
//         switch (status) {
//             case 'connected':
//                 return 'bg-green-500';
//             case 'qr_required':
//                 return 'bg-yellow-500';
//             case 'disconnected':
//             case 'error':
//                 return 'bg-red-500';
//             default:
//                 return 'bg-gray-500';
//         }
//     };

//     const getStatusIcon = () => {
//         switch (status) {
//             case 'connected':
//                 return '✅';
//             case 'qr_required':
//                 return '📱';
//             case 'disconnected':
//                 return '🔌';
//             case 'error':
//                 return '❌';
//             default:
//                 return '🔄';
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             const response = await fetch('/api/whatsapp/logout', {
//                 method: 'POST'
//             });
            
//             if (response.ok) {
//                 setStatus('logging_out');
//                 setStatusMessage('Logging out...');
//             }
//         } catch (error) {
//             console.error('❌ Logout error:', error);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
//             {/* Status Header */}
//             <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center space-x-3">
//                     <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
//                     <h2 className="text-xl font-bold text-gray-800">WhatsApp Status</h2>
//                 </div>
//                 <span className="text-2xl">{getStatusIcon()}</span>
//             </div>

//             {/* QR Code Display */}
//             {qrCode && (
//                 <div className="mb-6 text-center">
//                     <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
//                         <QRCode 
//                             value={qrCode} 
//                             size={256}
//                             level="H"
//                             includeMargin={true}
//                             className="mx-auto"
//                         />
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">
//                         Scan this QR code with WhatsApp to connect
//                     </p>
//                     <ol className="text-xs text-gray-500 text-left max-w-xs mx-auto">
//                         <li>1. Open WhatsApp on your phone</li>
//                         <li>2. Tap Settings → Linked Devices</li>
//                         <li>3. Tap "Link a Device"</li>
//                         <li>4. Point your camera at this QR code</li>
//                     </ol>
//                 </div>
//             )}

//             {/* Status Message */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                 <p className="text-center text-gray-700 font-medium">
//                     {statusMessage}
//                 </p>
//             </div>

//             {/* Connection Info */}
//             <div className="grid grid-cols-2 gap-4 text-sm mb-6">
//                 <div className="text-center">
//                     <div className="font-semibold text-gray-600">Status</div>
//                     <div className={`font-bold ${
//                         isConnected ? 'text-green-600' : 'text-yellow-600'
//                     }`}>
//                         {isConnected ? 'Connected' : 'Disconnected'}
//                     </div>
//                 </div>
//                 <div className="text-center">
//                     <div className="font-semibold text-gray-600">QR Code</div>
//                     <div className="font-bold text-gray-800">
//                         {qrCode ? 'Available' : 'Not Required'}
//                     </div>
//                 </div>
//             </div>

//             {/* Actions */}
//             <div className="flex space-x-3">
//                 <button
//                     onClick={() => window.location.reload()}
//                     className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-200"
//                 >
//                     Refresh
//                 </button>
                
//                 {isConnected && (
//                     <button
//                         onClick={handleLogout}
//                         className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200"
//                     >
//                         Logout
//                     </button>
//                 )}
//             </div>

//             {/* Real-time updates indicator */}
//             <div className="mt-4 text-center">
//                 <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
//                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                     <span>Real-time updates active</span>
//                 </div>
//             </div>
//         </div>
//     );
// }