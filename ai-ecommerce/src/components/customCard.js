
// "use client";

// import React, { useState } from "react";
// import { appTheme } from "../constants/theme";

// export default function CustomCard({ order, onDelete, onUpdateField, onProcessPayment, onCancelOrder, isMobile, user }) {
//   const [expandedItems, setExpandedItems] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [transactionId, setTransactionId] = useState("");
//   const [cancelReason, setCancelReason] = useState("");

//   // Helper function to format address safely
//   const formatAddress = (address) => {
//     if (!address) return 'No address provided';
    
//     // If it's already a string
//     if (typeof address === 'string') return address;
    
//     // If it's an object (new schema)
//     if (typeof address === 'object') {
//       const parts = [];
//       if (address.street) parts.push(address.street);
//       if (address.landmark) parts.push(`(${address.landmark})`);
//       if (address.areaLocality) parts.push(address.areaLocality);
//       if (address.cityDistrict || address.city) parts.push(address.cityDistrict || address.city);
//       if (address.state) parts.push(address.state);
//       if (address.pincode) parts.push(address.pincode);
      
//       const formattedAddress = parts.filter(p => p && p.trim()).join(', ');
//       return formattedAddress || 'Address provided';
//     }
    
//     return 'Address provided';
//   };

//   // Helper function to format phone number
//   const formatPhone = (phone) => {
//     if (!phone) return 'N/A';
//     const cleaned = phone.replace(/\D/g, '');
//     if (cleaned.length === 10) {
//       return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
//     }
//     return phone;
//   };

//   // Helper function to format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   // Helper function to get status badge color
//   const getStatusColor = (status) => {
//     const colors = {
//       pending: '#ffc107',
//       confirmed: '#17a2b8',
//       processing: '#007bff',
//       packed: '#6c757d',
//       shipped: '#6f42c1',
//       out_for_delivery: '#fd7e14',
//       delivered: '#28a745',
//       cancelled: '#dc3545',
//       returned: '#6c757d',
//       refunded: '#6c757d'
//     };
//     return colors[status] || '#6c757d';
//   };

//   // Helper function to get payment status color
//   const getPaymentColor = (status) => {
//     const colors = {
//       pending: '#ffc107',
//       partial: '#17a2b8',
//       paid: '#28a745',
//       failed: '#dc3545',
//       refunded: '#6c757d'
//     };
//     return colors[status] || '#6c757d';
//   };

//   const formattedAddress = formatAddress(order.shippingAddress);
//   const displayPhone = formatPhone(order.phoneNumber);
//   const displaySecondaryPhone = order.secondaryPhoneNumber ? formatPhone(order.secondaryPhoneNumber) : null;
//   const totalAmount = order.totalPrice || 0;
//   const paidAmount = order.paidAmount || 0;
//   const balanceAmount = order.balanceAmount || (totalAmount - paidAmount);
//   const isSuperAdmin = user?.isSuperAdmin;
//   const isCompanyAdmin = user?.isCompanyAdmin;

//   const handleProcessPaymentClick = () => {
//     if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
//       alert("Please enter a valid amount");
//       return;
//     }
//     onProcessPayment(order._id, parseFloat(paymentAmount), transactionId);
//     setShowPaymentModal(false);
//     setPaymentAmount("");
//     setTransactionId("");
//   };

//   const handleCancelOrderClick = () => {
//     if (!cancelReason) {
//       alert("Please provide a reason for cancellation");
//       return;
//     }
//     onCancelOrder(order._id, cancelReason);
//     setCancelReason("");
//   };

//   return (
//     <>
//       <div
//         style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "20px" : "25px",
//           borderRadius: "16px",
//           boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
//           border: `1.5px solid ${appTheme.colors.border}30`,
//           transition: "all 0.3s ease",
//         }}
//         onMouseEnter={(e) => {
//           if (!isMobile) {
//             e.currentTarget.style.transform = "translateY(-2px)";
//             e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12)";
//           }
//         }}
//         onMouseLeave={(e) => {
//           if (!isMobile) {
//             e.currentTarget.style.transform = "translateY(0)";
//             e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
//           }
//         }}
//       >
//         {/* Header */}
//         <div style={{ 
//           display: "flex", 
//           justifyContent: "space-between", 
//           alignItems: "center",
//           marginBottom: "20px",
//           paddingBottom: "15px",
//           borderBottom: `1.5px solid ${appTheme.colors.border}30`
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//             <div style={{
//               width: "4px",
//               height: "24px",
//               background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
//               borderRadius: "2px",
//             }}></div>
//             <div>
//               <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                 <strong style={{ 
//                   fontSize: isMobile ? "1rem" : "1.2rem", 
//                   color: appTheme.colors.textPrimary,
//                   display: "block"
//                 }}>
//                   Order #{order.orderNumber}
//                 </strong>
//                 <span style={{
//                   backgroundColor: getStatusColor(order.status) + "20",
//                   color: getStatusColor(order.status),
//                   padding: isMobile ? "4px 8px" : "2px 8px",
//                   borderRadius: "4px",
//                   fontSize: isMobile ? "0.7rem" : "0.7rem",
//                   fontWeight: "600",
//                   border: `1px solid ${getStatusColor(order.status)}40`
//                 }}>
//                   {order.status?.toUpperCase() || 'PENDING'}
//                 </span>
//                 <span style={{
//                   backgroundColor: getPaymentColor(order.paymentStatus) + "20",
//                   color: getPaymentColor(order.paymentStatus),
//                   padding: isMobile ? "4px 8px" : "2px 8px",
//                   borderRadius: "4px",
//                   fontSize: isMobile ? "0.7rem" : "0.7rem",
//                   fontWeight: "600",
//                   border: `1px solid ${getPaymentColor(order.paymentStatus)}40`
//                 }}>
//                   {order.paymentStatus?.toUpperCase() || 'PENDING'}
//                 </span>
//               </div>
//               <div style={{ 
//                 fontSize: isMobile ? "0.8rem" : "0.9rem", 
//                 color: appTheme.colors.textSecondary,
//                 marginTop: "4px"
//               }}>
//                 Customer: {order.customerName || order.createdBy?.name || order.createdBy?.role || "N/A"}
//               </div>
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: "8px" }} className="action-buttons">
//             {/* Company badge for super admin */}
//             {isSuperAdmin && order.companyId && (
//               <div style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 padding: "4px 8px",
//                 background: `${appTheme.colors.primary}10`,
//                 borderRadius: "6px",
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.primary,
//                 border: `1px solid ${appTheme.colors.primary}30`
//               }}>
//                 <span>🏢</span>
//                 {order.companyId?.companyName || 'Company'}
//               </div>
//             )}
//             <button
//               onClick={() => onDelete(order._id)}
//               style={{
//                 backgroundColor: "#ff4d4f",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "8px",
//                 padding: isMobile ? "8px 12px" : "8px 16px",
//                 cursor: "pointer",
//                 fontWeight: "600",
//                 fontSize: isMobile ? "0.8rem" : "0.9rem",
//                 transition: "all 0.3s ease",
//                 minHeight: isMobile ? "40px" : "36px",
//               }}
//               onMouseEnter={(e) => {
//                 if (!isMobile) {
//                   e.target.style.transform = "translateY(-1px)";
//                   e.target.style.boxShadow = "0 4px 12px rgba(255, 77, 79, 0.3)";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isMobile) {
//                   e.target.style.transform = "translateY(0)";
//                   e.target.style.boxShadow = "none";
//                 }
//               }}
//             >
//               Delete
//             </button>
//           </div>
//         </div>

//         {/* Customer Details */}
//         <div style={{ 
//           display: "grid", 
//           gap: "12px",
//           marginBottom: "20px"
//         }}>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "10px" : "20px" }}>
//             <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
//               <strong style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: appTheme.colors.textSecondary }}>Customer Name:</strong>
//               <span style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: "500", marginTop: "4px" }}>
//                 {order.customerName || "N/A"}
//               </span>
//             </div>
            
//             <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 45%" : "1 1 auto" }}>
//               <strong style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: appTheme.colors.textSecondary }}>Primary Phone:</strong>
//               <span style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: "500", marginTop: "4px" }}>
//                 {displayPhone}
//               </span>
//             </div>
            
//             <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 45%" : "1 1 auto" }}>
//               <strong style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: appTheme.colors.textSecondary }}>Secondary Phone:</strong>
//               <span style={{ 
//                 fontSize: isMobile ? "0.9rem" : "1rem", 
//                 fontWeight: "500", 
//                 marginTop: "4px",
//                 color: displaySecondaryPhone ? appTheme.colors.textPrimary : appTheme.colors.textSecondary
//               }}>
//                 {displaySecondaryPhone || "Not provided"}
//               </span>
//             </div>
            
//             {order.customerEmail && (
//               <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
//                 <strong style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: appTheme.colors.textSecondary }}>Email:</strong>
//                 <span style={{ fontSize: isMobile ? "0.85rem" : "0.95rem", marginTop: "4px" }}>
//                   {order.customerEmail}
//                 </span>
//               </div>
//             )}
//           </div>
          
//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <strong style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: appTheme.colors.textSecondary }}>Shipping Address:</strong>
//             <span style={{ fontSize: isMobile ? "0.85rem" : "0.95rem", marginTop: "4px", lineHeight: "1.5" }}>
//               {formattedAddress}
//             </span>
//           </div>

//           {/* Amount Summary */}
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
//             gap: isMobile ? "8px" : "10px",
//             padding: isMobile ? "12px" : "15px",
//             backgroundColor: `${appTheme.colors.background}80`,
//             borderRadius: "8px",
//             marginTop: "10px"
//           }}>
//             <div>
//               <div style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Total</div>
//               <div style={{ fontSize: isMobile ? "0.9rem" : "1.1rem", fontWeight: "600", color: appTheme.colors.primary }}>
//                 {formatCurrency(totalAmount)}
//               </div>
//             </div>
//             <div>
//               <div style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Paid</div>
//               <div style={{ fontSize: isMobile ? "0.9rem" : "1.1rem", fontWeight: "600", color: "#28a745" }}>
//                 {formatCurrency(paidAmount)}
//               </div>
//             </div>
//             <div>
//               <div style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Balance</div>
//               <div style={{ 
//                 fontSize: isMobile ? "0.9rem" : "1.1rem", 
//                 fontWeight: "600", 
//                 color: balanceAmount > 0 ? "#ffc107" : "#28a745"
//               }}>
//                 {formatCurrency(balanceAmount)}
//               </div>
//             </div>
//             <div>
//               <div style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>GST</div>
//               <div style={{ fontSize: isMobile ? "0.85rem" : "1rem", fontWeight: "500", color: appTheme.colors.textSecondary }}>
//                 {formatCurrency(order.totalGst || 0)}
//               </div>
//             </div>
//           </div>

//           {/* Payment and Tracking Info */}
//           {(order.paymentMethod || order.transactionId || order.trackingNumber || order.source) && (
//             <div style={{
//               display: "grid",
//               gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
//               gap: isMobile ? "8px" : "10px",
//               padding: isMobile ? "10px" : "10px",
//               backgroundColor: `${appTheme.colors.background}40`,
//               borderRadius: "8px"
//             }}>
//               {order.source && (
//                 <div>
//                   <span style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Source:</span>
//                   <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: "500" }}>
//                     {order.source === 'whatsapp' ? '📱 WhatsApp' : 
//                      order.source === 'admin' ? '👤 Admin' : 
//                      order.source === 'website' ? '🌐 Website' : 'API'}
//                   </div>
//                 </div>
//               )}
//               {order.paymentMethod && (
//                 <div>
//                   <span style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Payment:</span>
//                   <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: "500", textTransform: "capitalize" }}>
//                     {order.paymentMethod}
//                   </div>
//                 </div>
//               )}
//               {order.transactionId && (
//                 <div>
//                   <span style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Txn ID:</span>
//                   <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", fontFamily: "monospace" }}>
//                     {order.transactionId.slice(-8)}
//                   </div>
//                 </div>
//               )}
//               {order.trackingNumber && (
//                 <div>
//                   <span style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: appTheme.colors.textSecondary }}>Tracking:</span>
//                   <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem" }}>{order.trackingNumber}</div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Status and Payment selectors */}
//           <div style={{ 
//             display: "flex", 
//             flexWrap: "wrap", 
//             gap: isMobile ? "12px" : "20px",
//             paddingTop: "15px",
//             borderTop: `1px solid ${appTheme.colors.border}20`
//           }}>
//             <div className="status-select" style={{ display: "flex", alignItems: "center", gap: "8px", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
//               <strong style={{ minWidth: isMobile ? "50px" : "60px", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Status:</strong>
//               <select
//                 value={order.status}
//                 onChange={(e) => onUpdateField(order._id, "status", e.target.value)}
//                 style={{
//                   padding: isMobile ? "8px 10px" : "6px 12px",
//                   borderRadius: "8px",
//                   border: `1.5px solid ${appTheme.colors.border}`,
//                   cursor: "pointer",
//                   backgroundColor: appTheme.colors.background,
//                   fontSize: isMobile ? "0.85rem" : "0.9rem",
//                   minWidth: isMobile ? "120px" : "140px",
//                   flex: 1,
//                 }}
//               >
//                 {["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
//                   <option key={s} value={s}>
//                     {s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="status-select" style={{ display: "flex", alignItems: "center", gap: "8px", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
//               <strong style={{ minWidth: isMobile ? "50px" : "60px", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Payment:</strong>
//               <select
//                 value={order.paymentStatus}
//                 onChange={(e) => onUpdateField(order._id, "paymentStatus", e.target.value)}
//                 style={{
//                   padding: isMobile ? "8px 10px" : "6px 12px",
//                   borderRadius: "8px",
//                   border: `1.5px solid ${appTheme.colors.border}`,
//                   cursor: "pointer",
//                   backgroundColor: appTheme.colors.background,
//                   fontSize: isMobile ? "0.85rem" : "0.9rem",
//                   minWidth: isMobile ? "120px" : "140px",
//                   flex: 1,
//                 }}
//               >
//                 {["pending", "partial", "paid", "failed", "refunded"].map((p) => (
//                   <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Action Buttons */}
//             {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
//               <div style={{ 
//                 display: "flex", 
//                 gap: "8px", 
//                 marginTop: isMobile ? "8px" : "0",
//                 width: isMobile ? "100%" : "auto"
//               }}>
//                 <button
//                   onClick={() => setShowPaymentModal(true)}
//                   style={{
//                     backgroundColor: "#28a745",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "8px",
//                     padding: isMobile ? "10px" : "8px 16px",
//                     cursor: "pointer",
//                     fontWeight: "600",
//                     fontSize: isMobile ? "0.8rem" : "0.9rem",
//                     flex: isMobile ? 1 : "auto",
//                     minHeight: isMobile ? "40px" : "36px",
//                   }}
//                 >
//                   💰 Record Payment
//                 </button>
//                 {order.status !== 'cancelled' && (
//                   <button
//                     onClick={() => setCancelReason("prompt")}
//                     style={{
//                       backgroundColor: "#dc3545",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "8px",
//                       padding: isMobile ? "10px" : "8px 16px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: isMobile ? "0.8rem" : "0.9rem",
//                       flex: isMobile ? 1 : "auto",
//                       minHeight: isMobile ? "40px" : "36px",
//                     }}
//                   >
//                     ❌ Cancel Order
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Items */}
//         <div style={{ 
//           paddingTop: "15px",
//           borderTop: `1px solid ${appTheme.colors.border}20`
//         }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "center",
//             marginBottom: "12px"
//           }}>
//             <strong style={{ fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
//               Order Items ({order.items?.length || 0}):
//             </strong>
//             {order.items?.length > 3 && (
//               <button
//                 onClick={() => setExpandedItems(!expandedItems)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: appTheme.colors.primary,
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.8rem" : "0.9rem",
//                   fontWeight: "500",
//                   padding: isMobile ? "8px" : "0",
//                   minHeight: isMobile ? "40px" : "auto",
//                 }}
//               >
//                 {expandedItems ? "Show Less" : `Show All (${order.items.length})`}
//               </button>
//             )}
//           </div>

//           {/* Mobile-friendly table */}
//           <div style={{ 
//             overflowX: "auto",
//             WebkitOverflowScrolling: "touch",
//           }}>
//             <table style={{ 
//               width: "100%", 
//               marginTop: "8px", 
//               borderCollapse: "collapse",
//               borderRadius: "8px",
//               overflow: "hidden",
//               minWidth: isMobile ? "600px" : "100%",
//             }}>
//               <thead>
//                 <tr style={{ 
//                   backgroundColor: appTheme.colors.primary, 
//                   color: "#fff"
//                 }}>
//                   <th style={{ padding: isMobile ? "8px" : "12px", textAlign: "left", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Product</th>
//                   <th style={{ padding: isMobile ? "8px" : "12px", textAlign: "center", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>SKU/HSN</th>
//                   <th style={{ padding: isMobile ? "8px" : "12px", textAlign: "center", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Qty</th>
//                   <th style={{ padding: isMobile ? "8px" : "12px", textAlign: "right", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Price</th>
//                   <th style={{ padding: isMobile ? "8px" : "12px", textAlign: "right", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {order.items && order.items.length > 0 ? (
//                   order.items.slice(0, expandedItems ? order.items.length : 3).map((item, index) => (
//                     <tr 
//                       key={item.productId?._id || item.productName || index} 
//                       style={{ 
//                         borderBottom: `1px solid ${appTheme.colors.border}30`,
//                         backgroundColor: index % 2 === 0 ? 'transparent' : `${appTheme.colors.background}50`
//                       }}
//                     >
//                       <td style={{ padding: isMobile ? "8px" : "12px", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
//                         {item.productName || "Unnamed Product"}
//                         {item.options && item.options !== 'No customization' && (
//                           <div style={{ 
//                             fontSize: isMobile ? "0.7rem" : "0.8rem", 
//                             color: appTheme.colors.textSecondary,
//                             marginTop: "4px"
//                           }}>
//                             Options: {item.options}
//                           </div>
//                         )}
//                       </td>
//                       <td style={{ padding: isMobile ? "8px" : "12px", textAlign: "center", fontSize: isMobile ? "0.7rem" : "0.8rem", fontFamily: "monospace" }}>
//                         {item.sku ? `SKU: ${item.sku}` : item.hsnCode ? `HSN: ${item.hsnCode}` : '-'}
//                       </td>
//                       <td style={{ padding: isMobile ? "8px" : "12px", textAlign: "center", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
//                         {item.quantity || 0}
//                       </td>
//                       <td style={{ padding: isMobile ? "8px" : "12px", textAlign: "right", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
//                         ₹{item.price || 0}
//                       </td>
//                       <td style={{ padding: isMobile ? "8px" : "12px", textAlign: "right", fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: "500" }}>
//                         ₹{(item.price || 0) * (item.quantity || 0)}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" style={{ padding: isMobile ? "15px" : "20px", textAlign: "center", color: appTheme.colors.textSecondary }}>
//                       No items in this order
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//               {order.items && order.items.length > 0 && (
//                 <tfoot>
//                   <tr style={{ 
//                     backgroundColor: `${appTheme.colors.background}80`,
//                     borderTop: `2px solid ${appTheme.colors.border}`
//                   }}>
//                     <td colSpan="4" style={{ 
//                       padding: isMobile ? "8px" : "12px", 
//                       textAlign: "right", 
//                       fontWeight: "600",
//                       fontSize: isMobile ? "0.8rem" : "0.9rem"
//                     }}>
//                       Grand Total:
//                     </td>
//                     <td style={{ 
//                       padding: isMobile ? "8px" : "12px", 
//                       textAlign: "right", 
//                       fontWeight: "600",
//                       fontSize: isMobile ? "0.9rem" : "1rem",
//                       color: appTheme.colors.primary
//                     }}>
//                       {formatCurrency(order.totalPrice || 0)}
//                     </td>
//                   </tr>
//                 </tfoot>
//               )}
//             </table>
//           </div>
          
//           {/* Order metadata */}
//           <div style={{ 
//             display: "flex", 
//             flexDirection: isMobile ? "column" : "row",
//             justifyContent: "space-between",
//             alignItems: isMobile ? "flex-start" : "center",
//             marginTop: "15px",
//             paddingTop: "15px",
//             borderTop: `1px solid ${appTheme.colors.border}20`,
//             fontSize: isMobile ? "0.75rem" : "0.85rem",
//             color: appTheme.colors.textSecondary,
//             gap: isMobile ? "8px" : "0",
//           }}>
//             <div>
//               <strong>Created:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
//               {order.createdBy?.name && ` by ${order.createdBy.name}`}
//             </div>
//             <div>
//               <strong>Updated:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "N/A"}
//             </div>
//             <div>
//               <strong>Source:</strong> {order.source === 'whatsapp' ? '📱 WhatsApp' : order.source === 'admin' ? '👤 Admin' : 'Website'}
//             </div>
//             {order.gstType && (
//               <div>
//                 <strong>GST:</strong> {order.gstType === 'intra-state' ? 'Intra-State' : 'Inter-State'}
//               </div>
//             )}
//             {order.invoiceNumber && (
//               <div>
//                 <strong>Invoice:</strong> {order.invoiceNumber}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <div style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "rgba(0,0,0,0.5)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 1000,
//           padding: isMobile ? "16px" : "20px",
//         }}>
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: isMobile ? "20px" : "24px",
//             borderRadius: "16px",
//             maxWidth: "400px",
//             width: "100%",
//             boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//           }}>
//             <h3 style={{ margin: "0 0 16px 0", color: appTheme.colors.textPrimary }}>Record Payment</h3>
            
//             <div style={{ marginBottom: "16px" }}>
//               <label style={{ display: "block", fontSize: "0.8rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
//                 Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(e.target.value)}
//                 placeholder="Enter amount"
//                 style={{
//                   width: "100%",
//                   padding: isMobile ? "12px" : "10px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: isMobile ? "16px" : "0.95rem",
//                 }}
//                 autoFocus
//               />
//             </div>

//             <div style={{ marginBottom: "20px" }}>
//               <label style={{ display: "block", fontSize: "0.8rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
//                 Transaction ID (optional)
//               </label>
//               <input
//                 type="text"
//                 value={transactionId}
//                 onChange={(e) => setTransactionId(e.target.value)}
//                 placeholder="Enter transaction ID"
//                 style={{
//                   width: "100%",
//                   padding: isMobile ? "12px" : "10px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: isMobile ? "16px" : "0.95rem",
//                 }}
//               />
//             </div>

//             <div style={{ display: "flex", gap: "10px" }}>
//               <button
//                 onClick={() => setShowPaymentModal(false)}
//                 style={{
//                   flex: 1,
//                   padding: isMobile ? "12px" : "10px",
//                   backgroundColor: "transparent",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.9rem" : "0.9rem",
//                   color: appTheme.colors.textSecondary,
//                   minHeight: isMobile ? "48px" : "40px",
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleProcessPaymentClick}
//                 style={{
//                   flex: 1,
//                   padding: isMobile ? "12px" : "10px",
//                   backgroundColor: "#28a745",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.9rem" : "0.9rem",
//                   fontWeight: "600",
//                   minHeight: isMobile ? "48px" : "40px",
//                 }}
//               >
//                 Record Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cancel Reason Modal */}
//       {cancelReason === "prompt" && (
//         <div style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "rgba(0,0,0,0.5)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 1000,
//           padding: isMobile ? "16px" : "20px",
//         }}>
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: isMobile ? "20px" : "24px",
//             borderRadius: "16px",
//             maxWidth: "400px",
//             width: "100%",
//             boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//           }}>
//             <h3 style={{ margin: "0 0 16px 0", color: appTheme.colors.textPrimary }}>Cancel Order</h3>
            
//             <div style={{ marginBottom: "20px" }}>
//               <label style={{ display: "block", fontSize: "0.8rem", color: appTheme.colors.textSecondary, marginBottom: "4px" }}>
//                 Reason for cancellation
//               </label>
//               <textarea
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//                 placeholder="Enter cancellation reason"
//                 rows={3}
//                 style={{
//                   width: "100%",
//                   padding: isMobile ? "12px" : "10px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: isMobile ? "16px" : "0.95rem",
//                   resize: "vertical",
//                 }}
//                 autoFocus
//               />
//             </div>

//             <div style={{ display: "flex", gap: "10px" }}>
//               <button
//                 onClick={() => setCancelReason("")}
//                 style={{
//                   flex: 1,
//                   padding: isMobile ? "12px" : "10px",
//                   backgroundColor: "transparent",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.9rem" : "0.9rem",
//                   color: appTheme.colors.textSecondary,
//                   minHeight: isMobile ? "48px" : "40px",
//                 }}
//               >
//                 Back
//               </button>
//               <button
//                 onClick={handleCancelOrderClick}
//                 style={{
//                   flex: 1,
//                   padding: isMobile ? "12px" : "10px",
//                   backgroundColor: "#dc3545",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: isMobile ? "0.9rem" : "0.9rem",
//                   fontWeight: "600",
//                   minHeight: isMobile ? "48px" : "40px",
//                 }}
//               >
//                 Cancel Order
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
























"use client";

import React, { useState } from "react";
import { appTheme } from "../constants/theme";

export default function CustomCard({ order, onDelete, onUpdateField, onProcessPayment, onCancelOrder, isMobile, user }) {
  const [expandedItems, setExpandedItems] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Get theme values with fallbacks
  const surfaceColor = appTheme?.colors?.surface || appTheme?.colors?.backgroundCard || "#FFFFFF";
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const secondaryColor = appTheme?.colors?.secondary || "#8B5CF6";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const successColor = appTheme?.colors?.success || "#10B981";
  const errorColor = appTheme?.colors?.error || "#EF4444";
  const warningColor = appTheme?.colors?.warning || "#F59E0B";
  const infoColor = appTheme?.colors?.info || "#3B82F6";
  
  // Get font values
  const fontFamily = appTheme?.fonts?.families?.primary || "Inter, sans-serif";
  const fontSizes = appTheme?.fonts?.sizes || {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  };
  const fontWeights = appTheme?.fonts?.weights || {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };
  
  // Get transitions
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  const transitionNormal = appTheme?.transitions?.normal || "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  
  // Get radius
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const radiusFull = appTheme?.radius?.full || "9999px";
  
  // Get spacing
  const spacing = appTheme?.spacing || {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
  };

  // Helper function to format address safely
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    if (typeof address === 'string') return address;
    
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.landmark) parts.push(`(${address.landmark})`);
      if (address.areaLocality) parts.push(address.areaLocality);
      if (address.cityDistrict || address.city) parts.push(address.cityDistrict || address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      
      const formattedAddress = parts.filter(p => p && p.trim()).join(', ');
      return formattedAddress || 'Address provided';
    }
    
    return 'Address provided';
  };

  // Helper function to format phone number
  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: warningColor,
      confirmed: infoColor,
      processing: primaryColor,
      packed: textSecondary,
      shipped: '#6f42c1',
      out_for_delivery: '#fd7e14',
      delivered: successColor,
      cancelled: errorColor,
      returned: textSecondary,
      refunded: textSecondary
    };
    return colors[status] || textSecondary;
  };

  // Helper function to get payment status color
  const getPaymentColor = (status) => {
    const colors = {
      pending: warningColor,
      partial: infoColor,
      paid: successColor,
      failed: errorColor,
      refunded: textSecondary
    };
    return colors[status] || textSecondary;
  };

  const formattedAddress = formatAddress(order.shippingAddress);
  const displayPhone = formatPhone(order.phoneNumber);
  const displaySecondaryPhone = order.secondaryPhoneNumber ? formatPhone(order.secondaryPhoneNumber) : null;
  const totalAmount = order.totalPrice || 0;
  const paidAmount = order.paidAmount || 0;
  const balanceAmount = order.balanceAmount || (totalAmount - paidAmount);
  const isSuperAdmin = user?.isSuperAdmin;
  const isCompanyAdmin = user?.isCompanyAdmin;

  const handleProcessPaymentClick = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    onProcessPayment(order._id, parseFloat(paymentAmount), transactionId);
    setShowPaymentModal(false);
    setPaymentAmount("");
    setTransactionId("");
  };

  const handleCancelOrderClick = () => {
    if (!cancelReason) {
      alert("Please provide a reason for cancellation");
      return;
    }
    onCancelOrder(order._id, cancelReason);
    setCancelReason("");
  };

  return (
    <>
      <div
        style={{
          backgroundColor: surfaceColor,
          padding: isMobile ? spacing.md : spacing.lg,
          borderRadius: radiusLg,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: `1.5px solid ${borderColor}30`,
          transition: transitionNormal,
          fontFamily: fontFamily,
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
          }
        }}
      >
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1.5px solid ${borderColor}30`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
            <div style={{
              width: "4px",
              height: "24px",
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              borderRadius: "2px",
            }}></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" }}>
                <strong style={{ 
                  fontSize: isMobile ? fontSizes.base : fontSizes.xl, 
                  color: textPrimary,
                  display: "block",
                  fontWeight: fontWeights.semibold,
                }}>
                  Order #{order.orderNumber}
                </strong>
                <span style={{
                  backgroundColor: getStatusColor(order.status) + "20",
                  color: getStatusColor(order.status),
                  padding: isMobile ? "4px 8px" : "2px 8px",
                  borderRadius: radiusMd,
                  fontSize: fontSizes.xs,
                  fontWeight: fontWeights.semibold,
                  border: `1px solid ${getStatusColor(order.status)}40`
                }}>
                  {order.status?.toUpperCase() || 'PENDING'}
                </span>
                <span style={{
                  backgroundColor: getPaymentColor(order.paymentStatus) + "20",
                  color: getPaymentColor(order.paymentStatus),
                  padding: isMobile ? "4px 8px" : "2px 8px",
                  borderRadius: radiusMd,
                  fontSize: fontSizes.xs,
                  fontWeight: fontWeights.semibold,
                  border: `1px solid ${getPaymentColor(order.paymentStatus)}40`
                }}>
                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <div style={{ 
                fontSize: isMobile ? fontSizes.sm : fontSizes.base, 
                color: textSecondary,
                marginTop: "4px"
              }}>
                Customer: {order.customerName || order.createdBy?.name || order.createdBy?.role || "N/A"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: spacing.xs }} className="action-buttons">
            {/* Company badge for super admin */}
            {isSuperAdmin && order.companyId && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                background: `${primaryColor}10`,
                borderRadius: radiusMd,
                fontSize: fontSizes.xs,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`
              }}>
                <span>🏢</span>
                {order.companyId?.companyName || 'Company'}
              </div>
            )}
            <button
              onClick={() => onDelete(order._id)}
              style={{
                backgroundColor: errorColor,
                color: "#fff",
                border: "none",
                borderRadius: radiusMd,
                padding: isMobile ? "8px 12px" : "8px 16px",
                cursor: "pointer",
                fontWeight: fontWeights.semibold,
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                transition: transitionFast,
                minHeight: isMobile ? "40px" : "36px",
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = `0 4px 12px ${errorColor}4D`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ 
          display: "grid", 
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? spacing.xs : spacing.md }}>
            <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
              <strong style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, fontWeight: fontWeights.medium }}>
                Customer Name:
              </strong>
              <span style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: fontWeights.medium, marginTop: "4px" }}>
                {order.customerName || "N/A"}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 45%" : "1 1 auto" }}>
              <strong style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, fontWeight: fontWeights.medium }}>
                Primary Phone:
              </strong>
              <span style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: fontWeights.medium, marginTop: "4px" }}>
                {displayPhone}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 45%" : "1 1 auto" }}>
              <strong style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, fontWeight: fontWeights.medium }}>
                Secondary Phone:
              </strong>
              <span style={{ 
                fontSize: isMobile ? fontSizes.base : fontSizes.lg, 
                fontWeight: fontWeights.medium, 
                marginTop: "4px",
                color: displaySecondaryPhone ? textPrimary : textSecondary
              }}>
                {displaySecondaryPhone || "Not provided"}
              </span>
            </div>
            
            {order.customerEmail && (
              <div style={{ display: "flex", flexDirection: "column", flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
                <strong style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, fontWeight: fontWeights.medium }}>
                  Email:
                </strong>
                <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, marginTop: "4px" }}>
                  {order.customerEmail}
                </span>
              </div>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, fontWeight: fontWeights.medium }}>
              Shipping Address:
            </strong>
            <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, marginTop: "4px", lineHeight: "1.5" }}>
              {formattedAddress}
            </span>
          </div>

          {/* Amount Summary */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? spacing.xs : spacing.xs,
            padding: isMobile ? spacing.sm : spacing.md,
            backgroundColor: `${backgroundColor}80`,
            borderRadius: radiusMd,
            marginTop: spacing.xs
          }}>
            <div>
              <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Total</div>
              <div style={{ fontSize: isMobile ? fontSizes.base : fontSizes.xl, fontWeight: fontWeights.semibold, color: primaryColor }}>
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Paid</div>
              <div style={{ fontSize: isMobile ? fontSizes.base : fontSizes.xl, fontWeight: fontWeights.semibold, color: successColor }}>
                {formatCurrency(paidAmount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Balance</div>
              <div style={{ 
                fontSize: isMobile ? fontSizes.base : fontSizes.xl, 
                fontWeight: fontWeights.semibold, 
                color: balanceAmount > 0 ? warningColor : successColor
              }}>
                {formatCurrency(balanceAmount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>GST</div>
              <div style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium, color: textSecondary }}>
                {formatCurrency(order.totalGst || 0)}
              </div>
            </div>
          </div>

          {/* Payment and Tracking Info */}
          {(order.paymentMethod || order.transactionId || order.trackingNumber || order.source) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? spacing.xs : spacing.xs,
              padding: isMobile ? spacing.xs : spacing.xs,
              backgroundColor: `${backgroundColor}40`,
              borderRadius: radiusMd
            }}>
              {order.source && (
                <div>
                  <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Source:</span>
                  <div style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium }}>
                    {order.source === 'whatsapp' ? '📱 WhatsApp' : 
                     order.source === 'admin' ? '👤 Admin' : 
                     order.source === 'website' ? '🌐 Website' : 'API'}
                  </div>
                </div>
              )}
              {order.paymentMethod && (
                <div>
                  <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Payment:</span>
                  <div style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium, textTransform: "capitalize" }}>
                    {order.paymentMethod}
                  </div>
                </div>
              )}
              {order.transactionId && (
                <div>
                  <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Txn ID:</span>
                  <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontFamily: appTheme?.fonts?.families?.monospace || "monospace" }}>
                    {order.transactionId.slice(-8)}
                  </div>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>Tracking:</span>
                  <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm }}>{order.trackingNumber}</div>
                </div>
              )}
            </div>
          )}

          {/* Status and Payment selectors */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: isMobile ? spacing.sm : spacing.md,
            paddingTop: spacing.sm,
            borderTop: `1px solid ${borderColor}20`
          }}>
            <div className="status-select" style={{ display: "flex", alignItems: "center", gap: spacing.xs, flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
              <strong style={{ minWidth: isMobile ? "50px" : "60px", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium }}>
                Status:
              </strong>
              <select
                value={order.status}
                onChange={(e) => onUpdateField(order._id, "status", e.target.value)}
                style={{
                  padding: isMobile ? "8px 10px" : "6px 12px",
                  borderRadius: radiusMd,
                  border: `1.5px solid ${borderColor}`,
                  cursor: "pointer",
                  backgroundColor: backgroundColor,
                  fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                  minWidth: isMobile ? "120px" : "140px",
                  flex: 1,
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
              >
                {["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
                  <option key={s} value={s}>
                    {s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="status-select" style={{ display: "flex", alignItems: "center", gap: spacing.xs, flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
              <strong style={{ minWidth: isMobile ? "50px" : "60px", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium }}>
                Payment:
              </strong>
              <select
                value={order.paymentStatus}
                onChange={(e) => onUpdateField(order._id, "paymentStatus", e.target.value)}
                style={{
                  padding: isMobile ? "8px 10px" : "6px 12px",
                  borderRadius: radiusMd,
                  border: `1.5px solid ${borderColor}`,
                  cursor: "pointer",
                  backgroundColor: backgroundColor,
                  fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                  minWidth: isMobile ? "120px" : "140px",
                  flex: 1,
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
              >
                {["pending", "partial", "paid", "failed", "refunded"].map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
              <div style={{ 
                display: "flex", 
                gap: spacing.xs, 
                marginTop: isMobile ? spacing.xs : "0",
                width: isMobile ? "100%" : "auto"
              }}>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  style={{
                    backgroundColor: successColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: radiusMd,
                    padding: isMobile ? "10px" : "8px 16px",
                    cursor: "pointer",
                    fontWeight: fontWeights.semibold,
                    fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                    flex: isMobile ? 1 : "auto",
                    minHeight: isMobile ? "40px" : "36px",
                    transition: transitionFast,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = `0 4px 12px ${successColor}4D`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  💰 Record Payment
                </button>
                {order.status !== 'cancelled' && (
                  <button
                    onClick={() => setCancelReason("prompt")}
                    style={{
                      backgroundColor: errorColor,
                      color: "#fff",
                      border: "none",
                      borderRadius: radiusMd,
                      padding: isMobile ? "10px" : "8px 16px",
                      cursor: "pointer",
                      fontWeight: fontWeights.semibold,
                      fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                      flex: isMobile ? 1 : "auto",
                      minHeight: isMobile ? "40px" : "36px",
                      transition: transitionFast,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = `0 4px 12px ${errorColor}4D`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{ 
          paddingTop: spacing.sm,
          borderTop: `1px solid ${borderColor}20`
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: spacing.sm
          }}>
            <strong style={{ fontSize: isMobile ? fontSizes.base : fontSizes.xl, fontWeight: fontWeights.semibold }}>
              Order Items ({order.items?.length || 0}):
            </strong>
            {order.items?.length > 3 && (
              <button
                onClick={() => setExpandedItems(!expandedItems)}
                style={{
                  background: "none",
                  border: "none",
                  color: primaryColor,
                  cursor: "pointer",
                  fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                  fontWeight: fontWeights.medium,
                  padding: isMobile ? spacing.xs : "0",
                  minHeight: isMobile ? "40px" : "auto",
                  transition: transitionFast,
                }}
                onMouseEnter={(e) => e.target.style.opacity = "0.8"}
                onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                {expandedItems ? "Show Less" : `Show All (${order.items.length})`}
              </button>
            )}
          </div>

          {/* Mobile-friendly table */}
          <div style={{ 
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}>
            <table style={{ 
              width: "100%", 
              marginTop: spacing.xs, 
              borderCollapse: "collapse",
              borderRadius: radiusMd,
              overflow: "hidden",
              minWidth: isMobile ? "600px" : "100%",
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: primaryColor, 
                  color: "#fff"
                }}>
                  <th style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "left", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold }}>Product</th>
                  <th style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "center", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold }}>SKU/HSN</th>
                  <th style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "center", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold }}>Qty</th>
                  <th style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "right", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold }}>Price</th>
                  <th style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "right", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.slice(0, expandedItems ? order.items.length : 3).map((item, index) => (
                    <tr 
                      key={item.productId?._id || item.productName || index} 
                      style={{ 
                        borderBottom: `1px solid ${borderColor}30`,
                        backgroundColor: index % 2 === 0 ? 'transparent' : `${backgroundColor}50`
                      }}
                    >
                      <td style={{ padding: isMobile ? spacing.xs : spacing.sm, fontSize: isMobile ? fontSizes.sm : fontSizes.base }}>
                        {item.productName || "Unnamed Product"}
                        {item.options && item.options !== 'No customization' && (
                          <div style={{ 
                            fontSize: isMobile ? fontSizes.xs : fontSizes.sm, 
                            color: textSecondary,
                            marginTop: "4px"
                          }}>
                            Options: {item.options}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "center", fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontFamily: appTheme?.fonts?.families?.monospace || "monospace" }}>
                        {item.sku ? `SKU: ${item.sku}` : item.hsnCode ? `HSN: ${item.hsnCode}` : '-'}
                      </td>
                      <td style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "center", fontSize: isMobile ? fontSizes.sm : fontSizes.base }}>
                        {item.quantity || 0}
                      </td>
                      <td style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "right", fontSize: isMobile ? fontSizes.sm : fontSizes.base }}>
                        ₹{item.price || 0}
                      </td>
                      <td style={{ padding: isMobile ? spacing.xs : spacing.sm, textAlign: "right", fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.medium }}>
                        ₹{(item.price || 0) * (item.quantity || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: isMobile ? spacing.md : spacing.lg, textAlign: "center", color: textSecondary }}>
                      No items in this order
                    </td>
                  </tr>
                )}
              </tbody>
              {order.items && order.items.length > 0 && (
                <tfoot>
                  <tr style={{ 
                    backgroundColor: `${backgroundColor}80`,
                    borderTop: `2px solid ${borderColor}`
                  }}>
                    <td colSpan="4" style={{ 
                      padding: isMobile ? spacing.xs : spacing.sm, 
                      textAlign: "right", 
                      fontWeight: fontWeights.semibold,
                      fontSize: isMobile ? fontSizes.sm : fontSizes.base
                    }}>
                      Grand Total:
                    </td>
                    <td style={{ 
                      padding: isMobile ? spacing.xs : spacing.sm, 
                      textAlign: "right", 
                      fontWeight: fontWeights.bold,
                      fontSize: isMobile ? fontSizes.base : fontSizes.xl,
                      color: primaryColor
                    }}>
                      {formatCurrency(order.totalPrice || 0)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          {/* Order metadata */}
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTop: `1px solid ${borderColor}20`,
            fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
            color: textSecondary,
            gap: isMobile ? spacing.xs : "0",
          }}>
            <div>
              <strong>Created:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
              {order.createdBy?.name && ` by ${order.createdBy.name}`}
            </div>
            <div>
              <strong>Updated:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "N/A"}
            </div>
            <div>
              <strong>Source:</strong> {order.source === 'whatsapp' ? '📱 WhatsApp' : order.source === 'admin' ? '👤 Admin' : 'Website'}
            </div>
            {order.gstType && (
              <div>
                <strong>GST:</strong> {order.gstType === 'intra-state' ? 'Intra-State' : 'Inter-State'}
              </div>
            )}
            {order.invoiceNumber && (
              <div>
                <strong>Invoice:</strong> {order.invoiceNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: isMobile ? spacing.md : spacing.lg,
        }}>
          <div style={{
            backgroundColor: surfaceColor,
            padding: isMobile ? spacing.md : spacing.lg,
            borderRadius: radiusLg,
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            fontFamily: fontFamily,
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: textPrimary, fontSize: fontSizes.xl, fontWeight: fontWeights.semibold }}>
              Record Payment
            </h3>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ display: "block", fontSize: fontSizes.sm, color: textSecondary, marginBottom: "4px", fontWeight: fontWeights.medium }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: "100%",
                  padding: isMobile ? "12px" : "10px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: radiusMd,
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <label style={{ display: "block", fontSize: fontSizes.sm, color: textSecondary, marginBottom: "4px", fontWeight: fontWeights.medium }}>
                Transaction ID (optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                style={{
                  width: "100%",
                  padding: isMobile ? "12px" : "10px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: radiusMd,
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: spacing.xs }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  padding: isMobile ? "12px" : "10px",
                  backgroundColor: "transparent",
                  border: `1px solid ${borderColor}`,
                  borderRadius: radiusMd,
                  cursor: "pointer",
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  color: textSecondary,
                  minHeight: isMobile ? "48px" : "40px",
                  fontFamily: fontFamily,
                  fontWeight: fontWeights.medium,
                  transition: transitionFast,
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = backgroundColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPaymentClick}
                style={{
                  flex: 1,
                  padding: isMobile ? "12px" : "10px",
                  backgroundColor: successColor,
                  color: "white",
                  border: "none",
                  borderRadius: radiusMd,
                  cursor: "pointer",
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  fontWeight: fontWeights.semibold,
                  minHeight: isMobile ? "48px" : "40px",
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = `0 4px 12px ${successColor}4D`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelReason === "prompt" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: isMobile ? spacing.md : spacing.lg,
        }}>
          <div style={{
            backgroundColor: surfaceColor,
            padding: isMobile ? spacing.md : spacing.lg,
            borderRadius: radiusLg,
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            fontFamily: fontFamily,
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: textPrimary, fontSize: fontSizes.xl, fontWeight: fontWeights.semibold }}>
              Cancel Order
            </h3>
            
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ display: "block", fontSize: fontSizes.sm, color: textSecondary, marginBottom: "4px", fontWeight: fontWeights.medium }}>
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason"
                rows={3}
                style={{
                  width: "100%",
                  padding: isMobile ? "12px" : "10px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: radiusMd,
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  resize: "vertical",
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", gap: spacing.xs }}>
              <button
                onClick={() => setCancelReason("")}
                style={{
                  flex: 1,
                  padding: isMobile ? "12px" : "10px",
                  backgroundColor: "transparent",
                  border: `1px solid ${borderColor}`,
                  borderRadius: radiusMd,
                  cursor: "pointer",
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  color: textSecondary,
                  minHeight: isMobile ? "48px" : "40px",
                  fontFamily: fontFamily,
                  fontWeight: fontWeights.medium,
                  transition: transitionFast,
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = backgroundColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                Back
              </button>
              <button
                onClick={handleCancelOrderClick}
                style={{
                  flex: 1,
                  padding: isMobile ? "12px" : "10px",
                  backgroundColor: errorColor,
                  color: "white",
                  border: "none",
                  borderRadius: radiusMd,
                  cursor: "pointer",
                  fontSize: isMobile ? fontSizes.base : fontSizes.base,
                  fontWeight: fontWeights.semibold,
                  minHeight: isMobile ? "48px" : "40px",
                  fontFamily: fontFamily,
                  transition: transitionFast,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = `0 4px 12px ${errorColor}4D`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}