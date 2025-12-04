// "use client"

// import { useState, useEffect } from 'react';
// import QRCode from 'qrcode.react';

// export default function WhatsAppConnect() {
//     const [status, setStatus] = useState({
//         isConnected: false,
//         isAuthenticated: false,
//         qrCode: null,
//         status: 'LOADING',
//         timestamp: null,
//         botInfo: null
//     });
//     const [isLoading, setIsLoading] = useState(true);
//     const [isLoggingOut, setIsLoggingOut] = useState(false);
//     const [lastUpdated, setLastUpdated] = useState(null);

//     const fetchStatus = async () => {
//         try {
//             const response = await fetch('/api/whatsapp/status');
//             const data = await response.json();
//             setStatus(data);
//             setLastUpdated(new Date());
//             setIsLoading(false);
//         } catch (error) {
//             console.error('Failed to fetch status:', error);
//             setStatus(prev => ({
//                 ...prev,
//                 status: 'ERROR',
//                 error: 'Failed to connect to server'
//             }));
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchStatus();
        
//         // Poll for status updates every 3 seconds
//         const interval = setInterval(fetchStatus, 3000);

//         return () => clearInterval(interval);
//     }, []);

//     const handleLogout = async () => {
//         if (!window.confirm('Are you sure you want to logout WhatsApp? You will need to scan QR code again to reconnect.')) {
//             return;
//         }

//         setIsLoggingOut(true);
//         try {
//             const response = await fetch('/api/whatsapp/logout', { 
//                 method: 'POST' 
//             });
            
//             if (response.ok) {
//                 // Refresh status after logout
//                 setTimeout(fetchStatus, 1000);
//             } else {
//                 throw new Error('Logout failed');
//             }
//         } catch (error) {
//             console.error('Logout failed:', error);
//             alert('Logout failed. Please try again.');
//         } finally {
//             setIsLoggingOut(false);
//         }
//     };

//     const getStatusDisplay = () => {
//         if (isLoading) {
//             return {
//                 title: "Connecting to WhatsApp Bot...",
//                 description: "Please wait while we check the connection status",
//                 icon: "⏳",
//                 color: "blue",
//                 showQR: false
//             };
//         }

//         switch (status.status) {
//             case 'CONNECTED':
//                 return {
//                     title: "WhatsApp Connected! 🎉",
//                     description: "Your WhatsApp bot is live and ready to receive customer messages",
//                     icon: "✅",
//                     color: "green",
//                     showQR: false
//                 };
//             case 'NEEDS_QR':
//                 return {
//                     title: "Scan QR Code to Connect",
//                     description: "Connect your WhatsApp account to start the e-commerce bot",
//                     icon: "📱",
//                     color: "yellow",
//                     showQR: true
//                 };
//             case 'AUTHENTICATED':
//                 return {
//                     title: "Authentication Successful",
//                     description: "WhatsApp session is authenticated and connecting...",
//                     icon: "🔐",
//                     color: "blue",
//                     showQR: false
//                 };
//             case 'ERROR':
//             case 'AUTH_FAILED':
//                 return {
//                     title: "Connection Error",
//                     description: "Unable to connect to WhatsApp. Please try scanning QR code again",
//                     icon: "❌",
//                     color: "red",
//                     showQR: true
//                 };
//             case 'LOADING':
//             case 'INITIALIZING':
//                 return {
//                     title: "Initializing WhatsApp Bot...",
//                     description: "Setting up your e-commerce automation system",
//                     icon: "⚙️",
//                     color: "blue",
//                     showQR: false
//                 };
//             default:
//                 return {
//                     title: "Waiting for Connection",
//                     description: "WhatsApp bot is starting up...",
//                     icon: "🔍",
//                     color: "gray",
//                     showQR: false
//                 };
//         }
//     };

//     const statusDisplay = getStatusDisplay();

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
//             <div className="max-w-4xl mx-auto">
//                 {/* Header */}
//                 <div className="text-center mb-8">
//                     <h1 className="text-4xl font-bold text-gray-900 mb-4">
//                         WhatsApp E-commerce Bot
//                     </h1>
//                     <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                         Connect your WhatsApp to automate customer orders, product inquiries, and payment processing
//                     </p>
//                 </div>

//                 {/* Main Card */}
//                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
//                     {/* Status Header */}
//                     <div className={`bg-gradient-to-r ${
//                         statusDisplay.color === 'green' ? 'from-green-500 to-green-600' :
//                         statusDisplay.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
//                         statusDisplay.color === 'red' ? 'from-red-500 to-red-600' :
//                         statusDisplay.color === 'blue' ? 'from-blue-500 to-blue-600' :
//                         'from-gray-500 to-gray-600'
//                     } px-8 py-6 text-white`}>
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                                 <div className="text-4xl">
//                                     {statusDisplay.icon}
//                                 </div>
//                                 <div>
//                                     <h2 className="text-2xl font-bold">
//                                         {statusDisplay.title}
//                                     </h2>
//                                     <p className="text-blue-100 mt-1">
//                                         {statusDisplay.description}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div className="text-right">
//                                 <div className="text-sm opacity-90">
//                                     {status.isConnected ? '🟢 Online' : '🔴 Offline'}
//                                 </div>
//                                 {lastUpdated && (
//                                     <div className="text-xs opacity-75 mt-1">
//                                         Updated: {lastUpdated.toLocaleTimeString()}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Content */}
//                     <div className="p-8">
//                         {isLoading ? (
//                             // Loading State
//                             <div className="text-center py-12">
//                                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                                 <p className="text-gray-600">Checking WhatsApp connection status...</p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                                 {/* Left Column - Status Info */}
//                                 <div className="space-y-6">
//                                     {/* Connection Details */}
//                                     <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//                                         <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                                             Connection Details
//                                         </h3>
//                                         <div className="space-y-3">
//                                             <div className="flex justify-between items-center py-2 border-b border-gray-200">
//                                                 <span className="text-gray-600">Status:</span>
//                                                 <span className={`font-semibold ${
//                                                     status.isConnected ? 'text-green-600' : 'text-yellow-600'
//                                                 }`}>
//                                                     {status.isConnected ? 'Connected' : 'Disconnected'}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between items-center py-2 border-b border-gray-200">
//                                                 <span className="text-gray-600">Authentication:</span>
//                                                 <span className={`font-semibold ${
//                                                     status.isAuthenticated ? 'text-green-600' : 'text-yellow-600'
//                                                 }`}>
//                                                     {status.isAuthenticated ? 'Authenticated' : 'Pending'}
//                                                 </span>
//                                             </div>
//                                             {status.botInfo && (
//                                                 <div className="flex justify-between items-center py-2">
//                                                     <span className="text-gray-600">WhatsApp Name:</span>
//                                                     <span className="font-semibold text-gray-800">
//                                                         {status.botInfo.pushname || 'Unknown'}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Bot Features */}
//                                     <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
//                                         <h3 className="text-lg font-semibold text-blue-800 mb-4">
//                                             🤖 Bot Features
//                                         </h3>
//                                         <div className="grid grid-cols-1 gap-2 text-sm">
//                                             <div className="flex items-center space-x-2 text-blue-700">
//                                                 <span>🛍️</span>
//                                                 <span>Product Catalog & Orders</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2 text-blue-700">
//                                                 <span>💬</span>
//                                                 <span>24/7 Customer Support</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2 text-blue-700">
//                                                 <span>💰</span>
//                                                 <span>Payment Processing</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2 text-blue-700">
//                                                 <span>🚚</span>
//                                                 <span>Order Tracking</span>
//                                             </div>
//                                             <div className="flex items-center space-x-2 text-blue-700">
//                                                 <span>📊</span>
//                                                 <span>Sales Analytics</span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Actions */}
//                                     <div className="flex space-x-4">
//                                         <button
//                                             onClick={fetchStatus}
//                                             disabled={isLoading}
//                                             className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
//                                         >
//                                             <span>🔄</span>
//                                             <span>Refresh Status</span>
//                                         </button>
                                        
//                                         {status.isAuthenticated && (
//                                             <button
//                                                 onClick={handleLogout}
//                                                 disabled={isLoggingOut}
//                                                 className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
//                                             >
//                                                 {isLoggingOut ? (
//                                                     <>
//                                                         <span className="animate-spin">⏳</span>
//                                                         <span>Logging out...</span>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <span>🚪</span>
//                                                         <span>Logout</span>
//                                                     </>
//                                                 )}
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Right Column - QR Code */}
//                                 <div className="flex flex-col items-center justify-center">
//                                     {statusDisplay.showQR ? (
//                                         <div className="text-center">
//                                             <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-dashed border-yellow-300 mb-6">
//                                                 <QRCode 
//                                                     value={status.qrCode || ''} 
//                                                     size={280}
//                                                     level="H"
//                                                     includeMargin
//                                                     className="mx-auto"
//                                                 />
//                                             </div>
                                            
//                                             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//                                                 <h4 className="font-bold text-yellow-800 text-lg mb-3">
//                                                     📱 How to Connect
//                                                 </h4>
//                                                 <ol className="text-sm text-yellow-700 space-y-2 text-left">
//                                                     <li className="flex items-start space-x-2">
//                                                         <span className="font-bold">1.</span>
//                                                         <span>Open <strong>WhatsApp</strong> on your phone</span>
//                                                     </li>
//                                                     <li className="flex items-start space-x-2">
//                                                         <span className="font-bold">2.</span>
//                                                         <span>Tap <strong>Settings</strong> (⚙️) → <strong>Linked Devices</strong></span>
//                                                     </li>
//                                                     <li className="flex items-start space-x-2">
//                                                         <span className="font-bold">3.</span>
//                                                         <span>Tap <strong>Link a Device</strong></span>
//                                                     </li>
//                                                     <li className="flex items-start space-x-2">
//                                                         <span className="font-bold">4.</span>
//                                                         <span>Scan the <strong>QR code</strong> above</span>
//                                                     </li>
//                                                     <li className="flex items-start space-x-2">
//                                                         <span className="font-bold">5.</span>
//                                                         <span>Wait for <strong>connection confirmation</strong></span>
//                                                     </li>
//                                                 </ol>
//                                             </div>
//                                         </div>
//                                     ) : status.isConnected ? (
//                                         <div className="text-center py-8">
//                                             <div className="text-6xl mb-4">🎉</div>
//                                             <h3 className="text-2xl font-bold text-green-600 mb-2">
//                                                 Successfully Connected!
//                                             </h3>
//                                             <p className="text-gray-600 mb-6">
//                                                 Your WhatsApp bot is now active and ready to serve customers.
//                                             </p>
//                                             <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
//                                                 <p className="text-green-700 text-sm">
//                                                     Customers can now message your business number<br />
//                                                     to browse products and place orders automatically.
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-8">
//                                             <div className="text-4xl mb-4">⚙️</div>
//                                             <h3 className="text-xl font-bold text-gray-700 mb-2">
//                                                 Initializing Connection...
//                                             </h3>
//                                             <p className="text-gray-600">
//                                                 Preparing your WhatsApp bot for connection.
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Footer Info */}
//                 <div className="text-center mt-8 text-gray-500 text-sm">
//                     <p>
//                         💡 <strong>Tip:</strong> Keep this page open to maintain WhatsApp connection. 
//                         If you logout or connection drops, scan the QR code again to reconnect.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }