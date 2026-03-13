// "use client";

// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { appTheme } from "../../../src/constants/theme";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";
// import CustomCard from "../../../src/components/customCard";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isMobile, setIsMobile] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [paymentFilter, setPaymentFilter] = useState("all");
//   const [dateRange, setDateRange] = useState({ from: "", to: "" });
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [showFilters, setShowFilters] = useState(false);
//   const [summary, setSummary] = useState({
//     totalOrders: 0,
//     totalRevenue: 0,
//     totalPaid: 0,
//     totalPending: 0,
//     avgOrderValue: 0
//   });
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   const itemsPerPage = 5;

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
    
//     let resizeTimeout;
//     const handleResize = () => {
//       clearTimeout(resizeTimeout);
//       resizeTimeout = setTimeout(checkMobile, 150);
//     };
    
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       clearTimeout(resizeTimeout);
//     };
//   }, []);

//   // Format address for display (safely handle object)
//   const formatAddress = (address) => {
//     if (!address) return '';
//     if (typeof address === 'string') return address;
//     if (typeof address === 'object') {
//       const parts = [];
//       if (address.street) parts.push(address.street);
//       if (address.landmark) parts.push(`(${address.landmark})`);
//       if (address.areaLocality) parts.push(address.areaLocality);
//       if (address.cityDistrict || address.city) parts.push(address.cityDistrict || address.city);
//       if (address.state) parts.push(address.state);
//       if (address.pincode) parts.push(address.pincode);
//       return parts.filter(p => p && p.trim()).join(', ');
//     }
//     return '';
//   };

//   // Format phone number for display
//   const formatPhone = (phone) => {
//     if (!phone) return 'N/A';
//     const cleaned = phone.replace(/\D/g, '');
//     if (cleaned.length === 10) {
//       return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
//     }
//     return phone;
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const fetchOrders = async (showRefreshToast = false) => {
//     try {
//       setLoading(true);
//       if (showRefreshToast) setIsRefreshing(true);
      
//       // Build query params for advanced filtering
//       const params = new URLSearchParams();
//       if (statusFilter !== 'all') params.append('status', statusFilter);
//       if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
//       if (dateRange.from) params.append('fromDate', dateRange.from);
//       if (dateRange.to) params.append('toDate', dateRange.to);
//       params.append('sortBy', sortBy);
//       params.append('sortOrder', sortOrder);
      
//       const res = await fetch(`/api/orders?${params.toString()}`);
//       const data = await res.json();
      
//       if (data.success) {
//         setOrders(data.data);
//         if (data.summary) {
//           setSummary({
//             totalOrders: data.summary.counts?.total || 0,
//             totalRevenue: data.summary.revenue?.total || 0,
//             totalPaid: data.summary.revenue?.paid || 0,
//             totalPending: data.summary.revenue?.pending || 0,
//             avgOrderValue: data.summary.revenue?.average || 0
//           });
//         }
//         if (showRefreshToast) {
//           alert('Orders refreshed successfully');
//         }
//       }
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       alert('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [statusFilter, paymentFilter, dateRange.from, dateRange.to, sortBy, sortOrder]);

//   // Enhanced filter logic for all new fields
//   const filteredOrders = useMemo(() => {
//     if (!searchTerm) return orders;
    
//     return orders.filter((order) => {
//       const searchLower = searchTerm.toLowerCase();
//       const addressStr = formatAddress(order.shippingAddress).toLowerCase();
      
//       // Search in all relevant fields
//       return (
//         order.orderNumber?.toLowerCase().includes(searchLower) ||
//         order.invoiceNumber?.toLowerCase().includes(searchLower) ||
//         order.customerName?.toLowerCase().includes(searchLower) ||
//         order.customerEmail?.toLowerCase().includes(searchLower) ||
//         order.phoneNumber?.includes(searchTerm) ||
//         order.secondaryPhoneNumber?.includes(searchTerm) ||
//         addressStr.includes(searchLower) ||
//         order.trackingNumber?.toLowerCase().includes(searchLower) ||
//         order.transactionId?.toLowerCase().includes(searchLower) ||
//         order.items?.some(item => 
//           item.productName?.toLowerCase().includes(searchLower) ||
//           item.sku?.toLowerCase().includes(searchLower) ||
//           item.hsnCode?.includes(searchTerm)
//         ) ||
//         (order.createdBy?.name?.toLowerCase() || "").includes(searchLower)
//       );
//     });
//   }, [orders, searchTerm]);

//   // Calculate summary for filtered orders
//   const filteredSummary = useMemo(() => {
//     const filtered = filteredOrders;
//     return {
//       total: filtered.length,
//       revenue: filtered.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
//       paid: filtered.reduce((sum, order) => sum + (order.paidAmount || 0), 0),
//       pending: filtered.reduce((sum, order) => sum + (order.balanceAmount || order.totalPrice - (order.paidAmount || 0)), 0),
//       average: filtered.length > 0 
//         ? filtered.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / filtered.length 
//         : 0
//     };
//   }, [filteredOrders]);

//   // Pagination logic
//   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
//   const paginatedOrders = filteredOrders.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Delete order
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this order? This will restore product stock.")) return;

//     try {
//       const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
//       const data = await res.json();
      
//       if (data.success) {
//         alert("Order deleted successfully");
//         fetchOrders();
//       } else {
//         alert(data.message || "Failed to delete order");
//       }
//     } catch (err) {
//       console.error("Delete order error:", err);
//       alert("Failed to delete order");
//     }
//   };

//   // Update status or paymentStatus with history tracking
//   const handleUpdateField = async (id, field, value) => {
//     try {
//       const updateData = { [field]: value };
      
//       // Add comment for status history if needed
//       if (field === 'status') {
//         updateData.statusComment = `Status updated to ${value}`;
//       }
      
//       const res = await fetch(`/api/orders?id=${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updateData),
//       });
      
//       const data = await res.json();
//       if (data.success) {
//         fetchOrders();
//       } else {
//         alert(data.message || "Failed to update order");
//       }
//     } catch (err) {
//       console.error("Update order field error:", err);
//       alert("Failed to update order");
//     }
//   };

//   // Process payment for an order
//   const handleProcessPayment = async (id, amount, transactionId) => {
//     try {
//       const res = await fetch(`/api/orders?id=${id}&action=process-payment`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount, transactionId }),
//       });
      
//       const data = await res.json();
//       if (data.success) {
//         alert("Payment processed successfully");
//         fetchOrders();
//       } else {
//         alert(data.message || "Failed to process payment");
//       }
//     } catch (err) {
//       console.error("Process payment error:", err);
//       alert("Failed to process payment");
//     }
//   };

//   // Cancel order with stock restoration
//   const handleCancelOrder = async (id, reason) => {
//     if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;

//     try {
//       const res = await fetch(`/api/orders?id=${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           status: 'cancelled',
//           cancellationReason: reason || 'Cancelled by user',
//           statusComment: `Order cancelled: ${reason || 'No reason provided'}`
//         }),
//       });
      
//       const data = await res.json();
//       if (data.success) {
//         alert("Order cancelled successfully");
//         fetchOrders();
//       } else {
//         alert(data.message || "Failed to cancel order");
//       }
//     } catch (err) {
//       console.error("Cancel order error:", err);
//       alert("Failed to cancel order");
//     }
//   };

//   // PDF Download with enhanced data
//   const downloadPDF = () => {
//     const doc = new jsPDF('landscape');
    
//     doc.setFontSize(22);
//     doc.setTextColor(
//       parseInt(appTheme.colors.primary.slice(1, 3), 16),
//       parseInt(appTheme.colors.primary.slice(3, 5), 16),
//       parseInt(appTheme.colors.primary.slice(5, 7), 16)
//     );
//     doc.text("Orders Report", 14, 20);
    
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);
//     doc.text(`Total Orders: ${filteredOrders.length} | Total Revenue: ${formatCurrency(filteredSummary.revenue)}`, 14, 35);

//     const tableColumn = [
//       "Order #",
//       "Invoice #",
//       "Customer", 
//       "Contact",
//       "Items",
//       "Subtotal",
//       "GST",
//       "Total",
//       "Paid",
//       "Balance",
//       "Status",
//       "Payment",
//       "Date"
//     ];
    
//     const tableRows = filteredOrders.map((order) => [
//       order.orderNumber || "N/A",
//       order.invoiceNumber || "N/A",
//       order.customerName || "N/A",
//       formatPhone(order.phoneNumber),
//       order.items?.length || 0,
//       formatCurrency(order.subtotal),
//       formatCurrency(order.totalGst),
//       formatCurrency(order.totalPrice),
//       formatCurrency(order.paidAmount),
//       formatCurrency(order.balanceAmount || order.totalPrice - (order.paidAmount || 0)),
//       order.status || "N/A",
//       order.paymentStatus || "N/A",
//       new Date(order.createdAt).toLocaleDateString()
//     ]);

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: 40,
//       theme: 'grid',
//       styles: {
//         fontSize: 8,
//         cellPadding: 3,
//         textColor: [51, 51, 51],
//         lineColor: [200, 200, 200],
//         lineWidth: 0.25,
//       },
//       headStyles: {
//         fillColor: [
//           parseInt(appTheme.colors.primary.slice(1, 3), 16),
//           parseInt(appTheme.colors.primary.slice(3, 5), 16),
//           parseInt(appTheme.colors.primary.slice(5, 7), 16)
//         ],
//         textColor: [255, 255, 255],
//         fontStyle: 'bold',
//       },
//       alternateRowStyles: {
//         fillColor: [248, 248, 248]
//       },
//       margin: { top: 40 },
//       didDrawPage: (data) => {
//         // Add footer with summary
//         doc.setFontSize(8);
//         doc.setTextColor(150);
//         doc.text(
//           `Summary - Total: ${formatCurrency(filteredSummary.revenue)} | Paid: ${formatCurrency(filteredSummary.paid)} | Pending: ${formatCurrency(filteredSummary.pending)}`,
//           14,
//           doc.internal.pageSize.height - 10
//         );
//       }
//     });

//     doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   // Excel Download with comprehensive data
//   const downloadExcel = () => {
//     const worksheetData = filteredOrders.map(order => ({
//       "Order Number": order.orderNumber,
//       "Invoice Number": order.invoiceNumber,
//       "Customer Name": order.customerName,
//       "Customer Email": order.customerEmail,
//       "Primary Phone": formatPhone(order.phoneNumber),
//       "Secondary Phone": order.secondaryPhoneNumber ? formatPhone(order.secondaryPhoneNumber) : "N/A",
//       "Address": formatAddress(order.shippingAddress),
//       "Items Count": order.items?.length || 0,
//       "Subtotal": order.subtotal || 0,
//       "Total Discount": order.totalDiscount || 0,
//       "Total GST": order.totalGst || 0,
//       "Shipping Charge": order.shippingCharge || 0,
//       "Total Price": order.totalPrice || 0,
//       "Paid Amount": order.paidAmount || 0,
//       "Balance Amount": order.balanceAmount || (order.totalPrice - (order.paidAmount || 0)),
//       "Payment Method": order.paymentMethod || "N/A",
//       "Transaction ID": order.transactionId || "N/A",
//       "Status": order.status,
//       "Payment Status": order.paymentStatus,
//       "GST Type": order.gstType || "N/A",
//       "Tracking Number": order.trackingNumber || "N/A",
//       "Courier Name": order.courierName || "N/A",
//       "Delivery Date": order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A",
//       "Order Date": new Date(order.createdAt).toLocaleDateString(),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
//     // Set column widths
//     if (!worksheet['!cols']) {
//       worksheet['!cols'] = [
//         { width: 15 }, // Order #
//         { width: 15 }, // Invoice #
//         { width: 20 }, // Customer Name
//         { width: 25 }, // Customer Email
//         { width: 15 }, // Primary Phone
//         { width: 15 }, // Secondary Phone
//         { width: 40 }, // Address
//         { width: 10 }, // Items Count
//         { width: 12 }, // Subtotal
//         { width: 12 }, // Total Discount
//         { width: 12 }, // Total GST
//         { width: 12 }, // Shipping Charge
//         { width: 12 }, // Total Price
//         { width: 12 }, // Paid Amount
//         { width: 12 }, // Balance Amount
//         { width: 15 }, // Payment Method
//         { width: 20 }, // Transaction ID
//         { width: 12 }, // Status
//         { width: 15 }, // Payment Status
//         { width: 12 }, // GST Type
//         { width: 15 }, // Tracking Number
//         { width: 15 }, // Courier Name
//         { width: 12 }, // Delivery Date
//         { width: 12 }, // Order Date
//       ];
//     }
    
//     XLSX.writeFile(workbook, `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   // Print Table
//   const handlePrint = () => {
//     const printContent = document.getElementById("orders-container").innerHTML;
//     const printWindow = window.open('', '_blank', 'width=1400,height=900');
    
//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Orders Report - ${new Date().toLocaleDateString()}</title>
//           <style>
//             * { margin: 0; padding: 0; box-sizing: border-box; }
//             body { 
//               font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
//               margin: 30px; 
//               color: #1a1a1a; 
//               background: white; 
//             }
//             .print-header { 
//               text-align: center; 
//               margin-bottom: 30px; 
//               padding-bottom: 20px; 
//               border-bottom: 3px solid ${appTheme.colors.primary}; 
//             }
//             .print-header h1 { 
//               color: ${appTheme.colors.primary}; 
//               margin: 0 0 8px 0; 
//               font-size: 28px; 
//               font-weight: 700; 
//             }
//             .print-meta { 
//               display: flex; 
//               justify-content: space-between; 
//               margin-top: 15px; 
//               font-size: 13px; 
//               color: #666; 
//             }
//             .summary-cards {
//               display: grid;
//               grid-template-columns: repeat(5, 1fr);
//               gap: 15px;
//               margin-bottom: 30px;
//             }
//             .summary-card {
//               background: #f8f9fa;
//               border: 1px solid #e9ecef;
//               border-radius: 10px;
//               padding: 15px;
//               text-align: center;
//             }
//             .summary-card .label {
//               font-size: 12px;
//               color: #6c757d;
//               margin-bottom: 5px;
//             }
//             .summary-card .value {
//               font-size: 18px;
//               font-weight: 700;
//               color: ${appTheme.colors.primary};
//             }
//             .order-card { 
//               background: white; 
//               border: 1px solid #e9ecef; 
//               border-radius: 12px; 
//               padding: 20px; 
//               margin-bottom: 20px; 
//               break-inside: avoid; 
//               box-shadow: 0 2px 8px rgba(0,0,0,0.05);
//             }
//             .order-header { 
//               display: flex; 
//               justify-content: space-between; 
//               margin-bottom: 15px; 
//               padding-bottom: 10px; 
//               border-bottom: 2px solid #f1f3f5; 
//             }
//             .order-header-left h3 {
//               color: ${appTheme.colors.primary};
//               margin: 0 0 5px 0;
//             }
//             .order-header-left p {
//               color: #6c757d;
//               font-size: 12px;
//               margin: 0;
//             }
//             .order-header-right {
//               text-align: right;
//             }
//             .status-badge {
//               display: inline-block;
//               padding: 4px 8px;
//               border-radius: 20px;
//               font-size: 11px;
//               font-weight: 600;
//               text-transform: uppercase;
//             }
//             .payment-badge {
//               display: inline-block;
//               padding: 4px 8px;
//               border-radius: 20px;
//               font-size: 11px;
//               font-weight: 600;
//               margin-top: 5px;
//             }
//             .amount-grid {
//               display: grid;
//               grid-template-columns: repeat(4, 1fr);
//               gap: 10px;
//               margin: 15px 0;
//               padding: 10px;
//               background: #f8f9fa;
//               border-radius: 8px;
//             }
//             .amount-item {
//               text-align: center;
//             }
//             .amount-label {
//               font-size: 10px;
//               color: #6c757d;
//             }
//             .amount-value {
//               font-size: 14px;
//               font-weight: 700;
//               color: #212529;
//             }
//             table { 
//               width: 100%; 
//               border-collapse: collapse; 
//               margin-top: 15px; 
//               font-size: 11px;
//             }
//             th { 
//               background: ${appTheme.colors.primary} !important; 
//               color: white !important; 
//               padding: 10px 8px; 
//               text-align: left; 
//               font-weight: 600; 
//             }
//             td { 
//               padding: 8px; 
//               border-bottom: 1px solid #e9ecef; 
//             }
//             .status-select, .action-buttons, .filter-section { 
//               display: none; 
//             }
//             @media print { 
//               body { margin: 15px; } 
//               .order-card { break-inside: avoid; } 
//               .summary-cards { break-inside: avoid; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="print-header">
//             <h1>Orders Report</h1>
//             <p>Comprehensive Order Management Report</p>
//             <div class="print-meta">
//               <span>Total Orders: ${filteredOrders.length}</span>
//               <span>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
//               <span>Filters: ${statusFilter !== 'all' ? `Status: ${statusFilter}` : 'All Orders'}</span>
//             </div>
//           </div>

//           <div class="summary-cards">
//             <div class="summary-card">
//               <div class="label">Total Orders</div>
//               <div class="value">${filteredSummary.total}</div>
//             </div>
//             <div class="summary-card">
//               <div class="label">Total Revenue</div>
//               <div class="value">${formatCurrency(filteredSummary.revenue)}</div>
//             </div>
//             <div class="summary-card">
//               <div class="label">Total Paid</div>
//               <div class="value">${formatCurrency(filteredSummary.paid)}</div>
//             </div>
//             <div class="summary-card">
//               <div class="label">Pending Amount</div>
//               <div class="value">${formatCurrency(filteredSummary.pending)}</div>
//             </div>
//             <div class="summary-card">
//               <div class="label">Avg Order Value</div>
//               <div class="value">${formatCurrency(filteredSummary.average)}</div>
//             </div>
//           </div>

//           <div id="orders-content">
//             ${printContent}
//           </div>
          
//           <script>
//             // Remove interactive elements for printing
//             document.querySelectorAll('.status-select, .action-buttons, button, .filter-section').forEach(el => el.remove());
            
//             // Format status badges
//             document.querySelectorAll('[data-status]').forEach(el => {
//               const status = el.getAttribute('data-status');
//               const colors = {
//                 'pending': '#ffc107',
//                 'confirmed': '#17a2b8',
//                 'processing': '#007bff',
//                 'shipped': '#6f42c1',
//                 'delivered': '#28a745',
//                 'cancelled': '#dc3545'
//               };
//               el.style.backgroundColor = colors[status] || '#6c757d';
//               el.style.color = 'white';
//             });
//           </script>
//         </body>
//       </html>
//     `);
    
//     printWindow.document.close();
//     printWindow.focus();
    
//     setTimeout(() => {
//       printWindow.print();
//       setTimeout(() => printWindow.close(), 500);
//     }, 500);
//   };

//   // Reset all filters
//   const resetFilters = () => {
//     setStatusFilter("all");
//     setPaymentFilter("all");
//     setDateRange({ from: "", to: "" });
//     setSortBy("createdAt");
//     setSortOrder("desc");
//     setSearchTerm("");
//     setCurrentPage(1);
//   };

//   // Auto-refresh every 30 seconds to get latest payment status
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchOrders();
//     }, 30000);
    
//     return () => clearInterval(interval);
//   }, [statusFilter, paymentFilter, dateRange.from, dateRange.to, sortBy, sortOrder]);

//   if (loading && orders.length === 0) {
//     return (
//       <div style={{ 
//         padding: isMobile ? "24px" : "40px",
//         backgroundColor: "transparent",
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center"
//       }}>
//         <div style={{
//           textAlign: "center",
//           color: appTheme.colors.textSecondary
//         }}>
//           <div style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: "1rem" }}>⏳</div>
//           <p style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Loading orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ 
//       padding: isMobile ? "16px" : "24px",
//       backgroundColor: "transparent",
//       minHeight: "100vh",
//       width: "100%",
//     }}>
//       {/* Header Section */}
//       <div style={{
//         display: "flex",
//         flexDirection: isMobile ? "column" : "row",
//         justifyContent: "space-between",
//         alignItems: isMobile ? "flex-start" : "flex-start",
//         marginBottom: isMobile ? "20px" : "24px",
//         gap: isMobile ? "16px" : "20px",
//       }}>
//         <div style={{ width: "100%" }}>
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: isMobile ? "12px" : "15px",
//             marginBottom: "6px",
//           }}>
//             <div style={{
//               width: isMobile ? "3px" : "4px",
//               height: isMobile ? "24px" : "32px",
//               background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
//               borderRadius: "2px",
//             }}></div>
//             <h1 style={{ 
//               color: appTheme.colors.textPrimary, 
//               fontWeight: "700",
//               fontSize: isMobile ? "1.5rem" : "1.75rem",
//               margin: 0,
//               lineHeight: 1.2,
//             }}>
//               Orders
//             </h1>
//           </div>
//           <p style={{ 
//             color: appTheme.colors.textSecondary, 
//             margin: "4px 0 0 15px",
//             fontSize: isMobile ? "0.85rem" : "0.95rem",
//             fontWeight: "500",
//           }}>
//             {filteredOrders.length} orders • Page {currentPage} of {totalPages} • 
//             {formatCurrency(filteredSummary.revenue)} total
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div style={{ 
//           display: "flex", 
//           gap: isMobile ? "10px" : "12px",
//           flexWrap: isMobile ? "nowrap" : "wrap",
//           width: isMobile ? "100%" : "auto",
//           overflowX: isMobile ? "auto" : "visible",
//           paddingBottom: isMobile ? "4px" : "0",
//           WebkitOverflowScrolling: "touch",
//           scrollbarWidth: "none",
//           msOverflowStyle: "none",
//         }}>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             style={{
//               ...glassButtonStyle(appTheme.colors.info, isMobile),
//               background: showFilters ? `${appTheme.colors.info}30` : `${appTheme.colors.info}15`,
//             }}
//           >
//             <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>🔍</span>
//             {!isMobile && "Filters"}
//             {isMobile && "Filters"}
//           </button>
//           <button
//             onClick={() => fetchOrders(true)}
//             disabled={isRefreshing}
//             style={{
//               ...glassButtonStyle(appTheme.colors.primary, isMobile),
//               opacity: isRefreshing ? 0.5 : 1,
//             }}
//           >
//             <span style={{ fontSize: isMobile ? "1.1rem" : "1rem", animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
//             {!isMobile && "Refresh"}
//             {isMobile && "Refresh"}
//           </button>
//           <button
//             onClick={downloadPDF}
//             style={glassButtonStyle(appTheme.colors.secondary, isMobile)}
//           >
//             <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>📄</span>
//             {!isMobile && "PDF"}
//             {isMobile && "PDF"}
//           </button>
//           <button
//             onClick={downloadExcel}
//             style={glassButtonStyle(appTheme.colors.success, isMobile)}
//           >
//             <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>📊</span>
//             {!isMobile && "Excel"}
//             {isMobile && "Excel"}
//           </button>
//           <button
//             onClick={handlePrint}
//             style={glassButtonStyle(appTheme.colors.warning, isMobile)}
//           >
//             <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>🖨️</span>
//             {!isMobile && "Print"}
//             {isMobile && "Print"}
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div style={{
//         display: "grid",
//         gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
//         gap: isMobile ? "10px" : "15px",
//         marginBottom: isMobile ? "20px" : "24px",
//       }}>
//         <SummaryCard 
//           label="Total Orders" 
//           value={filteredSummary.total} 
//           icon="📦"
//           isMobile={isMobile}
//         />
//         <SummaryCard 
//           label="Total Revenue" 
//           value={formatCurrency(filteredSummary.revenue)} 
//           icon="💰"
//           isMobile={isMobile}
//         />
//         {!isMobile && (
//           <>
//             <SummaryCard 
//               label="Total Paid" 
//               value={formatCurrency(filteredSummary.paid)} 
//               icon="✅"
//               isMobile={isMobile}
//             />
//             <SummaryCard 
//               label="Pending" 
//               value={formatCurrency(filteredSummary.pending)} 
//               icon="⏳"
//               isMobile={isMobile}
//             />
//             <SummaryCard 
//               label="Avg Order" 
//               value={formatCurrency(filteredSummary.average)} 
//               icon="📊"
//               isMobile={isMobile}
//             />
//           </>
//         )}
//       </div>

//       {/* Advanced Filters Section */}
//       {showFilters && (
//         <div style={{
//           marginBottom: isMobile ? "20px" : "24px",
//           padding: isMobile ? "16px" : "20px",
//           background: `${appTheme.colors.surface}80`,
//           borderRadius: isMobile ? "12px" : "16px",
//           border: `1.5px solid ${appTheme.colors.border}30`,
//           backdropFilter: "blur(10px)",
//         }}>
//           <div style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "16px",
//           }}>
//             <h3 style={{ 
//               margin: 0, 
//               fontSize: isMobile ? "1rem" : "1.1rem",
//               color: appTheme.colors.textPrimary,
//               fontWeight: "600",
//             }}>
//               Filter Orders
//             </h3>
//             <button
//               onClick={resetFilters}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: appTheme.colors.primary,
//                 cursor: "pointer",
//                 fontSize: isMobile ? "0.9rem" : "0.95rem",
//                 fontWeight: "600",
//                 padding: "6px 12px",
//                 borderRadius: "6px",
//               }}
//             >
//               Reset All
//             </button>
//           </div>

//           <div style={{
//             display: "grid",
//             gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
//             gap: isMobile ? "12px" : "16px",
//           }}>
//             {/* Status Filter */}
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               style={filterSelectStyle(isMobile)}
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="processing">Processing</option>
//               <option value="packed">Packed</option>
//               <option value="shipped">Shipped</option>
//               <option value="out_for_delivery">Out for Delivery</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="returned">Returned</option>
//             </select>

//             {/* Payment Status Filter */}
//             <select
//               value={paymentFilter}
//               onChange={(e) => setPaymentFilter(e.target.value)}
//               style={filterSelectStyle(isMobile)}
//             >
//               <option value="all">All Payment Status</option>
//               <option value="pending">Pending</option>
//               <option value="partial">Partial Paid</option>
//               <option value="paid">Paid</option>
//               <option value="failed">Failed</option>
//               <option value="refunded">Refunded</option>
//             </select>

//             {/* Sort By */}
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               style={filterSelectStyle(isMobile)}
//             >
//               <option value="createdAt">Sort by Date</option>
//               <option value="totalPrice">Sort by Amount</option>
//               <option value="customerName">Sort by Customer</option>
//               <option value="status">Sort by Status</option>
//             </select>

//             {/* Date Range */}
//             <div style={{ display: "flex", gap: "8px" }}>
//               <input
//                 type="date"
//                 value={dateRange.from}
//                 onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
//                 style={{ ...filterSelectStyle(isMobile), width: "50%" }}
//                 placeholder="From"
//               />
//               <input
//                 type="date"
//                 value={dateRange.to}
//                 onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
//                 style={{ ...filterSelectStyle(isMobile), width: "50%" }}
//                 placeholder="To"
//               />
//             </div>

//             {/* Sort Order */}
//             <select
//               value={sortOrder}
//               onChange={(e) => setSortOrder(e.target.value)}
//               style={filterSelectStyle(isMobile)}
//             >
//               <option value="desc">Newest First</option>
//               <option value="asc">Oldest First</option>
//             </select>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div style={{
//         position: "relative",
//         marginBottom: isMobile ? "20px" : "24px",
//         width: "100%",
//       }}>
//         <div style={{
//           position: "absolute",
//           left: isMobile ? "14px" : "16px",
//           top: "50%",
//           transform: "translateY(-50%)",
//           color: appTheme.colors.textSecondary,
//           fontSize: isMobile ? "14px" : "16px",
//           pointerEvents: "none",
//         }}>
//           🔍
//         </div>
//         <input
//           type="text"
//           placeholder={isMobile ? "Search orders..." : "Search by order #, invoice #, customer, phone, email, address, tracking..."}
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={{
//             width: "100%",
//             padding: isMobile ? "14px 14px 14px 44px" : "14px 16px 14px 48px",
//             border: `1.5px solid ${appTheme.colors.border}60`,
//             borderRadius: isMobile ? "10px" : "12px",
//             outline: "none",
//             fontSize: isMobile ? "16px" : "0.95rem",
//             transition: "all 0.3s ease",
//             backgroundColor: `${appTheme.colors.surface}80`,
//             WebkitAppearance: "none",
//           }}
//           onFocus={(e) => {
//             e.target.style.borderColor = appTheme.colors.primary;
//             e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//           }}
//           onBlur={(e) => {
//             e.target.style.borderColor = `${appTheme.colors.border}60`;
//             e.target.style.boxShadow = "none";
//           }}
//         />
//         {searchTerm && (
//           <button
//             onClick={() => setSearchTerm("")}
//             style={{
//               position: "absolute",
//               right: isMobile ? "14px" : "16px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               background: "none",
//               border: "none",
//               color: appTheme.colors.textSecondary,
//               fontSize: isMobile ? "18px" : "16px",
//               cursor: "pointer",
//               padding: "8px",
//               borderRadius: "50%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             ✕
//           </button>
//         )}
//       </div>

//       {/* Orders Container */}
//       <div id="orders-container" style={{ 
//         display: "grid", 
//         gap: isMobile ? "16px" : "20px",
//       }}>
//         {paginatedOrders.length === 0 ? (
//           <div style={{
//             backgroundColor: appTheme.colors.surface,
//             padding: isMobile ? "40px 24px" : "60px 40px",
//             borderRadius: isMobile ? "16px" : "20px",
//             textAlign: "center",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
//             border: `1.5px solid ${appTheme.colors.border}30`
//           }}>
//             <div style={{ 
//               fontSize: isMobile ? "3rem" : "4rem", 
//               marginBottom: "1rem",
//               opacity: 0.5,
//             }}>
//               📭
//             </div>
//             <div style={{ 
//               fontSize: isMobile ? "1.25rem" : "1.5rem", 
//               fontWeight: "600",
//               marginBottom: "0.5rem",
//               color: appTheme.colors.textPrimary
//             }}>
//               No orders found
//             </div>
//             {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to) && (
//               <div style={{ 
//                 fontSize: isMobile ? "0.9rem" : "1rem", 
//                 marginBottom: "1.5rem",
//                 opacity: 0.7,
//                 color: appTheme.colors.textSecondary
//               }}>
//                 No results with current filters
//               </div>
//             )}
//             <button
//               onClick={resetFilters}
//               style={{
//                 padding: isMobile ? "12px 20px" : "12px 24px",
//                 border: `1.5px solid ${appTheme.colors.primary}30`,
//                 background: "transparent",
//                 color: appTheme.colors.primary,
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 fontSize: isMobile ? "0.95rem" : "1rem",
//                 fontWeight: "600",
//                 transition: "all 0.3s ease",
//                 minHeight: isMobile ? "48px" : "44px",
//                 WebkitTapHighlightColor: "transparent",
//               }}
//               onMouseEnter={(e) => {
//                 if (!isMobile) {
//                   e.target.style.background = appTheme.colors.primary;
//                   e.target.style.color = "white";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isMobile) {
//                   e.target.style.background = "transparent";
//                   e.target.style.color = appTheme.colors.primary;
//                 }
//               }}
//             >
//               Clear All Filters
//             </button>
//           </div>
//         ) : (
//           paginatedOrders.map((order) => (
//             <CustomCard
//               key={order._id}
//               order={order}
//               onDelete={handleDelete}
//               onUpdateField={handleUpdateField}
//               onProcessPayment={handleProcessPayment}
//               onCancelOrder={handleCancelOrder}
//               isMobile={isMobile}
//             />
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       {filteredOrders.length > 0 && (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: isMobile ? "column" : "row",
//             justifyContent: isMobile ? "center" : "space-between",
//             alignItems: isMobile ? "stretch" : "center",
//             marginTop: isMobile ? "24px" : "32px",
//             padding: isMobile ? "20px" : "24px",
//             background: appTheme.colors.surface,
//             borderRadius: isMobile ? "16px" : "16px",
//             border: `1.5px solid ${appTheme.colors.border}30`,
//             boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
//             gap: isMobile ? "16px" : "20px",
//           }}
//         >
//           <div style={{ 
//             color: appTheme.colors.textSecondary,
//             fontSize: isMobile ? "0.9rem" : "0.95rem",
//             fontWeight: "500",
//             textAlign: isMobile ? "center" : "left",
//           }}>
//             Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders
//           </div>
          
//           <div style={{ 
//             display: "flex", 
//             flexDirection: isMobile ? "column" : "row",
//             alignItems: "center", 
//             justifyContent: isMobile ? "center" : "flex-end",
//             gap: isMobile ? "12px" : "10px",
//             width: isMobile ? "100%" : "auto",
//           }}>
//             <div style={{ 
//               display: "flex", 
//               gap: isMobile ? "8px" : "6px",
//               justifyContent: "center",
//               order: isMobile ? 2 : 1,
//               width: isMobile ? "100%" : "auto",
//             }}>
//               <button
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(currentPage - 1)}
//                 style={paginationButtonStyle(currentPage === 1, isMobile)}
//               >
//                 ←
//                 {!isMobile && " Previous"}
//               </button>
              
//               <div style={{ 
//                 display: "flex", 
//                 gap: isMobile ? "6px" : "6px",
//                 margin: isMobile ? "0 4px" : "0 12px",
//               }}>
//                 {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
//                   let pageNum;
//                   if (totalPages <= (isMobile ? 3 : 5)) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 2) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 1) {
//                     pageNum = totalPages - (isMobile ? 2 : 4) + i;
//                   } else {
//                     pageNum = currentPage - (isMobile ? 1 : 2) + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       style={{
//                         padding: isMobile ? "10px 14px" : "10px 16px",
//                         border: "none",
//                         borderRadius: "8px",
//                         cursor: "pointer",
//                         fontSize: isMobile ? "0.9rem" : "0.9rem",
//                         fontWeight: "600",
//                         transition: "all 0.3s ease",
//                         background: currentPage === pageNum 
//                           ? appTheme.colors.primary
//                           : "transparent",
//                         color: currentPage === pageNum ? "white" : appTheme.colors.textSecondary,
//                         minWidth: isMobile ? "44px" : "44px",
//                         minHeight: isMobile ? "44px" : "40px",
//                         WebkitTapHighlightColor: "transparent",
//                       }}
//                       onMouseEnter={(e) => {
//                         if (!isMobile && currentPage !== pageNum) {
//                           e.target.style.background = `${appTheme.colors.primary}15`;
//                           e.target.style.color = appTheme.colors.primary;
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         if (!isMobile && currentPage !== pageNum) {
//                           e.target.style.background = "transparent";
//                           e.target.style.color = appTheme.colors.textSecondary;
//                         }
//                       }}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>
              
//               <button
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage(currentPage + 1)}
//                 style={paginationButtonStyle(currentPage === totalPages, isMobile)}
//               >
//                 {!isMobile && "Next "}
//                 →
//               </button>
//             </div>

//             {/* Mobile Page Indicator */}
//             {isMobile && (
//               <div style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: "8px",
//                 order: 1,
//                 marginBottom: "4px",
//               }}>
//                 <span style={{
//                   fontSize: "0.85rem",
//                   color: appTheme.colors.textSecondary,
//                   fontWeight: "500",
//                 }}>
//                   Page {currentPage} of {totalPages}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Global Styles */}
//       <style jsx global>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         @media screen and (max-width: 768px) {
//           div::-webkit-scrollbar {
//             display: none;
//           }
          
//           button, 
//           [role="button"],
//           input[type="button"],
//           input[type="submit"] {
//             min-height: 48px;
//             min-width: 48px;
//           }
          
//           input, select, textarea {
//             font-size: 16px !important;
//           }
          
//           * {
//             -webkit-overflow-scrolling: touch;
//           }
          
//           button:hover {
//             transform: none !important;
//             box-shadow: none !important;
//           }
          
//           * {
//             -webkit-tap-highlight-color: transparent;
//           }
//         }

//         @media screen and (min-width: 769px) {
//           button:not(:disabled):hover {
//             transform: translateY(-1px);
//             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//           }
          
//           button:not(:disabled):active {
//             transform: translateY(0);
//           }
          
//           select:hover, input:hover {
//             border-color: ${appTheme.colors.primary} !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// // Summary Card Component
// const SummaryCard = ({ label, value, icon, isMobile }) => (
//   <div style={{
//     background: `${appTheme.colors.surface}80`,
//     backdropFilter: "blur(10px)",
//     padding: isMobile ? "12px" : "16px",
//     borderRadius: isMobile ? "10px" : "12px",
//     border: `1.5px solid ${appTheme.colors.border}30`,
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
//     transition: "all 0.3s ease",
//     textAlign: "center",
//   }}>
//     <div style={{
//       fontSize: isMobile ? "1.2rem" : "1.5rem",
//       marginBottom: "4px",
//     }}>
//       {icon}
//     </div>
//     <div style={{
//       fontSize: isMobile ? "0.75rem" : "0.8rem",
//       color: appTheme.colors.textSecondary,
//       textTransform: "uppercase",
//       letterSpacing: "0.5px",
//       marginBottom: "4px",
//     }}>
//       {label}
//     </div>
//     <div style={{
//       fontSize: isMobile ? "1rem" : "1.2rem",
//       fontWeight: "700",
//       color: appTheme.colors.textPrimary,
//     }}>
//       {value}
//     </div>
//   </div>
// );

// // Glass Button Style
// const glassButtonStyle = (color, isMobile) => ({
//   backgroundColor: `${color}15`,
//   border: `1.5px solid ${color}30`,
//   color: color,
//   padding: isMobile ? "12px 16px" : "12px 20px",
//   borderRadius: isMobile ? "10px" : "10px",
//   cursor: "pointer",
//   fontSize: isMobile ? "0.9rem" : "0.9rem",
//   fontWeight: "600",
//   transition: "all 0.3s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   gap: isMobile ? "6px" : "8px",
//   backdropFilter: "blur(10px)",
//   whiteSpace: "nowrap",
//   minHeight: isMobile ? "48px" : "44px",
//   minWidth: isMobile ? "80px" : "auto",
//   flex: isMobile ? "0 0 auto" : "none",
//   WebkitTapHighlightColor: "transparent",
// });

// // Filter Select Style
// const filterSelectStyle = (isMobile) => ({
//   padding: isMobile ? "12px 14px" : "10px 14px",
//   border: `1.5px solid ${appTheme.colors.border}60`,
//   borderRadius: isMobile ? "10px" : "8px",
//   fontSize: isMobile ? "16px" : "0.95rem",
//   backgroundColor: `${appTheme.colors.surface}80`,
//   color: appTheme.colors.textPrimary,
//   outline: "none",
//   cursor: "pointer",
//   transition: "all 0.3s ease",
//   width: "100%",
//   minHeight: isMobile ? "48px" : "44px",
//   WebkitAppearance: isMobile ? "none" : "auto",
//   backgroundImage: isMobile ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")' : 'none',
//   backgroundRepeat: 'no-repeat',
//   backgroundPosition: 'right 12px center',
//   paddingRight: isMobile ? '40px' : '14px',
// });

// // Pagination Button Style
// const paginationButtonStyle = (disabled, isMobile) => ({
//   backgroundColor: disabled ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}15`,
//   border: `1.5px solid ${disabled ? appTheme.colors.border : appTheme.colors.primary}30`,
//   color: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
//   padding: isMobile ? "12px 18px" : "10px 16px",
//   borderRadius: "8px",
//   cursor: disabled ? "not-allowed" : "pointer",
//   fontSize: isMobile ? "0.95rem" : "0.9rem",
//   fontWeight: "600",
//   transition: "all 0.3s ease",
//   opacity: disabled ? 0.5 : 1,
//   minHeight: isMobile ? "48px" : "40px",
//   minWidth: isMobile ? "80px" : "auto",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   gap: "4px",
//   WebkitTapHighlightColor: "transparent",
// });





















"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { appTheme } from "../../../src/constants/theme";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import CustomCard from "../../../src/components/customCard";

export default function OrdersPage() {
  const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    avgOrderValue: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const itemsPerPage = 5;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Format address for display (safely handle object)
  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.landmark) parts.push(`(${address.landmark})`);
      if (address.areaLocality) parts.push(address.areaLocality);
      if (address.cityDistrict || address.city) parts.push(address.cityDistrict || address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      return parts.filter(p => p && p.trim()).join(', ');
    }
    return '';
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const fetchOrders = async (showRefreshToast = false) => {
    try {
      setLoading(true);
      if (showRefreshToast) setIsRefreshing(true);
      setApiError(null);
      
      // Build query params for advanced filtering
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (dateRange.from) params.append('fromDate', dateRange.from);
      if (dateRange.to) params.append('toDate', dateRange.to);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You don't have permission to view these orders");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data);
        if (data.summary) {
          setSummary({
            totalOrders: data.summary.counts?.total || 0,
            totalRevenue: data.summary.revenue?.total || 0,
            totalPaid: data.summary.revenue?.paid || 0,
            totalPending: data.summary.revenue?.pending || 0,
            avgOrderValue: data.summary.revenue?.average || 0
          });
        }
        if (showRefreshToast) {
          alert('Orders refreshed successfully');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setApiError(err.message);
      alert('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchOrders();
    }
  }, [statusFilter, paymentFilter, dateRange.from, dateRange.to, sortBy, sortOrder, user]);

  // Enhanced filter logic for all new fields
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const addressStr = formatAddress(order.shippingAddress).toLowerCase();
      
      // Search in all relevant fields
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.invoiceNumber?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower) ||
        order.phoneNumber?.includes(searchTerm) ||
        order.secondaryPhoneNumber?.includes(searchTerm) ||
        addressStr.includes(searchLower) ||
        order.trackingNumber?.toLowerCase().includes(searchLower) ||
        order.transactionId?.toLowerCase().includes(searchLower) ||
        order.items?.some(item => 
          item.productName?.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower) ||
          item.hsnCode?.includes(searchTerm)
        ) ||
        (order.createdBy?.name?.toLowerCase() || "").includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

  // Calculate summary for filtered orders
  const filteredSummary = useMemo(() => {
    const filtered = filteredOrders;
    return {
      total: filtered.length,
      revenue: filtered.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
      paid: filtered.reduce((sum, order) => sum + (order.paidAmount || 0), 0),
      pending: filtered.reduce((sum, order) => sum + (order.balanceAmount || order.totalPrice - (order.paidAmount || 0)), 0),
      average: filtered.length > 0 
        ? filtered.reduce((sum, order) => sum + (order.totalPrice || 0), 0) / filtered.length 
        : 0
    };
  }, [filteredOrders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Delete order
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order? This will restore product stock.")) return;

    try {
      const res = await fetch(`/api/orders?id=${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Order deleted successfully");
        fetchOrders();
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      alert("Failed to delete order");
    }
  };

  // Update status or paymentStatus with history tracking
  const handleUpdateField = async (id, field, value) => {
  try {
    // Prepare update data
    const updateData = { 
      [field]: value,
      // Add user ID to the request body as a fallback
      userId: user?.id,
      updatedBy: user?.id
    };
    
    // Add comment for status history if needed
    if (field === 'status') {
      updateData.statusComment = `Status updated to ${value}`;
    }
    
    // Log what we're sending for debugging
    console.log(`📝 Updating order ${id}:`, { field, value, userId: user?.id });
    
    const res = await fetch(`/api/orders?id=${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        // Add user ID in headers (this is what your API looks for first)
        'x-user-id': user?.id,
        // Include all other auth headers
        ...getAuthHeaders()
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Show success message
      alert(`✅ Order ${field} updated successfully`);
      // Refresh orders list
      fetchOrders();
    } else {
      // Show error message from API
      alert(data.error || data.message || "Failed to update order");
      console.error("Update failed:", data);
    }
  } catch (err) {
    console.error("Update order field error:", err);
    alert("Failed to update order: " + err.message);
  }
};

  // Process payment for an order
const handleProcessPayment = async (id, amount, transactionId, paymentMethod = 'cash') => {
  try {
    // Validate input
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    // Find the current order to check remaining balance
    const currentOrder = orders.find(o => o._id === id);
    if (!currentOrder) {
      alert("Order not found");
      return;
    }

    const remainingBalance = currentOrder.balanceAmount || (currentOrder.totalPrice - (currentOrder.paidAmount || 0));
    
    if (amount > remainingBalance) {
      alert(`Payment amount (${formatCurrency(amount)}) cannot exceed remaining balance (${formatCurrency(remainingBalance)})`);
      return;
    }

    console.log(`💰 Processing payment for order ${id}:`, { 
      amount, 
      transactionId, 
      paymentMethod,
      userId: user?.id,
      remainingBalance 
    });

    const res = await fetch(`/api/orders?id=${id}&action=process-payment`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        // Add user ID in headers (primary method)
        'x-user-id': user?.id,
        // Include all other auth headers
        ...getAuthHeaders()
      },
      body: JSON.stringify({ 
        amount: parseFloat(amount),
        transactionId: transactionId || null,
        method: paymentMethod,
        // Add user ID in body as fallback
        userId: user?.id,
        updatedBy: user?.id,
        paymentDate: new Date().toISOString()
      }),
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Show success message with payment details
      const paidAmount = formatCurrency(amount);
      const newBalance = formatCurrency(data.data?.balanceAmount || 0);
      alert(`✅ Payment of ${paidAmount} processed successfully!\nRemaining balance: ${newBalance}`);
      
      // Refresh orders list
      fetchOrders();
    } else {
      // Show error message from API
      const errorMsg = data.error || data.message || "Failed to process payment";
      alert(`❌ ${errorMsg}`);
      console.error("Payment failed:", data);
    }
  } catch (err) {
    console.error("Process payment error:", err);
    alert("❌ Failed to process payment: " + err.message);
  }
};

  // Cancel order with stock restoration
  const handleCancelOrder = async (id, reason) => {
    if (!confirm("Are you sure you want to cancel this order? Stock will be restored.")) return;

    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellationReason: reason || 'Cancelled by user',
          statusComment: `Order cancelled: ${reason || 'No reason provided'}`
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully");
        fetchOrders();
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order");
    }
  };

  // PDF Download with enhanced data
  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(22);
    doc.setTextColor(
      parseInt(appTheme.colors.primary.slice(1, 3), 16),
      parseInt(appTheme.colors.primary.slice(3, 5), 16),
      parseInt(appTheme.colors.primary.slice(5, 7), 16)
    );
    doc.text("Orders Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 28);
    doc.text(`Total Orders: ${filteredOrders.length} | Total Revenue: ${formatCurrency(filteredSummary.revenue)}`, 14, 35);
    if (user?.companyName) {
      doc.text(`Company: ${user.companyName}`, 14, 42);
    }

    const tableColumn = [
      "Order #",
      "Invoice #",
      "Customer", 
      "Contact",
      "Items",
      "Subtotal",
      "GST",
      "Total",
      "Paid",
      "Balance",
      "Status",
      "Payment",
      "Date"
    ];
    
    const tableRows = filteredOrders.map((order) => [
      order.orderNumber || "N/A",
      order.invoiceNumber || "N/A",
      order.customerName || "N/A",
      formatPhone(order.phoneNumber),
      order.items?.length || 0,
      formatCurrency(order.subtotal),
      formatCurrency(order.totalGst),
      formatCurrency(order.totalPrice),
      formatCurrency(order.paidAmount),
      formatCurrency(order.balanceAmount || order.totalPrice - (order.paidAmount || 0)),
      order.status || "N/A",
      order.paymentStatus || "N/A",
      new Date(order.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [51, 51, 51],
        lineColor: [200, 200, 200],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [
          parseInt(appTheme.colors.primary.slice(1, 3), 16),
          parseInt(appTheme.colors.primary.slice(3, 5), 16),
          parseInt(appTheme.colors.primary.slice(5, 7), 16)
        ],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { top: 45 },
      didDrawPage: (data) => {
        // Add footer with summary
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Summary - Total: ${formatCurrency(filteredSummary.revenue)} | Paid: ${formatCurrency(filteredSummary.paid)} | Pending: ${formatCurrency(filteredSummary.pending)}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }
    });

    doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Excel Download with comprehensive data
  const downloadExcel = () => {
    const worksheetData = filteredOrders.map(order => ({
      "Order Number": order.orderNumber,
      "Invoice Number": order.invoiceNumber,
      "Customer Name": order.customerName,
      "Customer Email": order.customerEmail,
      "Primary Phone": formatPhone(order.phoneNumber),
      "Secondary Phone": order.secondaryPhoneNumber ? formatPhone(order.secondaryPhoneNumber) : "N/A",
      "Address": formatAddress(order.shippingAddress),
      "Items Count": order.items?.length || 0,
      "Subtotal": order.subtotal || 0,
      "Total Discount": order.totalDiscount || 0,
      "Total GST": order.totalGst || 0,
      "Shipping Charge": order.shippingCharge || 0,
      "Total Price": order.totalPrice || 0,
      "Paid Amount": order.paidAmount || 0,
      "Balance Amount": order.balanceAmount || (order.totalPrice - (order.paidAmount || 0)),
      "Payment Method": order.paymentMethod || "N/A",
      "Transaction ID": order.transactionId || "N/A",
      "Status": order.status,
      "Payment Status": order.paymentStatus,
      "GST Type": order.gstType || "N/A",
      "Tracking Number": order.trackingNumber || "N/A",
      "Courier Name": order.courierName || "N/A",
      "Delivery Date": order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A",
      "Order Date": new Date(order.createdAt).toLocaleDateString(),
      "Company": order.companyId?.companyName || user?.companyName || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
    // Set column widths
    if (!worksheet['!cols']) {
      worksheet['!cols'] = [
        { width: 15 }, // Order #
        { width: 15 }, // Invoice #
        { width: 20 }, // Customer Name
        { width: 25 }, // Customer Email
        { width: 15 }, // Primary Phone
        { width: 15 }, // Secondary Phone
        { width: 40 }, // Address
        { width: 10 }, // Items Count
        { width: 12 }, // Subtotal
        { width: 12 }, // Total Discount
        { width: 12 }, // Total GST
        { width: 12 }, // Shipping Charge
        { width: 12 }, // Total Price
        { width: 12 }, // Paid Amount
        { width: 12 }, // Balance Amount
        { width: 15 }, // Payment Method
        { width: 20 }, // Transaction ID
        { width: 12 }, // Status
        { width: 15 }, // Payment Status
        { width: 12 }, // GST Type
        { width: 15 }, // Tracking Number
        { width: 15 }, // Courier Name
        { width: 12 }, // Delivery Date
        { width: 12 }, // Order Date
        { width: 20 }, // Company
      ];
    }
    
    XLSX.writeFile(workbook, `orders_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print Table
  const handlePrint = () => {
    const printContent = document.getElementById("orders-container").innerHTML;
    const printWindow = window.open('', '_blank', 'width=1400,height=900');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Report - ${new Date().toLocaleDateString()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
              margin: 30px; 
              color: #1a1a1a; 
              background: white; 
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid ${appTheme.colors.primary}; 
            }
            .print-header h1 { 
              color: ${appTheme.colors.primary}; 
              margin: 0 0 8px 0; 
              font-size: 28px; 
              font-weight: 700; 
            }
            .company-info {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .print-meta { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 15px; 
              font-size: 13px; 
              color: #666; 
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 10px;
              padding: 15px;
              text-align: center;
            }
            .summary-card .label {
              font-size: 12px;
              color: #6c757d;
              margin-bottom: 5px;
            }
            .summary-card .value {
              font-size: 18px;
              font-weight: 700;
              color: ${appTheme.colors.primary};
            }
            .order-card { 
              background: white; 
              border: 1px solid #e9ecef; 
              border-radius: 12px; 
              padding: 20px; 
              margin-bottom: 20px; 
              break-inside: avoid; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .order-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 15px; 
              padding-bottom: 10px; 
              border-bottom: 2px solid #f1f3f5; 
            }
            .order-header-left h3 {
              color: ${appTheme.colors.primary};
              margin: 0 0 5px 0;
            }
            .order-header-left p {
              color: #6c757d;
              font-size: 12px;
              margin: 0;
            }
            .order-header-right {
              text-align: right;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .payment-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              margin-top: 5px;
            }
            .amount-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin: 15px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .amount-item {
              text-align: center;
            }
            .amount-label {
              font-size: 10px;
              color: #6c757d;
            }
            .amount-value {
              font-size: 14px;
              font-weight: 700;
              color: #212529;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 11px;
            }
            th { 
              background: ${appTheme.colors.primary} !important; 
              color: white !important; 
              padding: 10px 8px; 
              text-align: left; 
              font-weight: 600; 
            }
            td { 
              padding: 8px; 
              border-bottom: 1px solid #e9ecef; 
            }
            .status-select, .action-buttons, .filter-section { 
              display: none; 
            }
            @media print { 
              body { margin: 15px; } 
              .order-card { break-inside: avoid; } 
              .summary-cards { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Orders Report</h1>
            <p>Comprehensive Order Management Report</p>
            ${user?.companyName ? `<div class="company-info">Company: ${user.companyName}</div>` : ''}
            <div class="print-meta">
              <span>Total Orders: ${filteredOrders.length}</span>
              <span>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
              <span>Filters: ${statusFilter !== 'all' ? `Status: ${statusFilter}` : 'All Orders'}</span>
            </div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <div class="label">Total Orders</div>
              <div class="value">${filteredSummary.total}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Revenue</div>
              <div class="value">${formatCurrency(filteredSummary.revenue)}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Paid</div>
              <div class="value">${formatCurrency(filteredSummary.paid)}</div>
            </div>
            <div class="summary-card">
              <div class="label">Pending Amount</div>
              <div class="value">${formatCurrency(filteredSummary.pending)}</div>
            </div>
            <div class="summary-card">
              <div class="label">Avg Order Value</div>
              <div class="value">${formatCurrency(filteredSummary.average)}</div>
            </div>
          </div>

          <div id="orders-content">
            ${printContent}
          </div>
          
          <script>
            // Remove interactive elements for printing
            document.querySelectorAll('.status-select, .action-buttons, button, .filter-section').forEach(el => el.remove());
            
            // Format status badges
            document.querySelectorAll('[data-status]').forEach(el => {
              const status = el.getAttribute('data-status');
              const colors = {
                'pending': '#ffc107',
                'confirmed': '#17a2b8',
                'processing': '#007bff',
                'shipped': '#6f42c1',
                'delivered': '#28a745',
                'cancelled': '#dc3545'
              };
              el.style.backgroundColor = colors[status] || '#6c757d';
              el.style.color = 'white';
            });
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    }, 500);
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange({ from: "", to: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Auto-refresh every 30 seconds to get latest payment status
  useEffect(() => {
    if (user?.companyId) {
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [statusFilter, paymentFilter, dateRange.from, dateRange.to, sortBy, sortOrder, user]);

  // Redirect or show loading if no user
  if (!user) {
    return (
      <div style={{ 
        padding: isMobile ? "24px" : "40px",
        backgroundColor: "transparent",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          color: appTheme.colors.textSecondary
        }}>
          <div style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div style={{ 
        padding: isMobile ? "24px" : "40px",
        backgroundColor: "transparent",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          color: appTheme.colors.textSecondary
        }}>
          <div style={{ fontSize: isMobile ? "2.5rem" : "3rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? "16px" : "24px",
      backgroundColor: "transparent",
      minHeight: "100vh",
      width: "100%",
    }}>
      {/* Company Context Banner */}
      <div style={{
        marginBottom: isMobile ? "20px" : "24px",
        padding: isMobile ? "12px 16px" : "14px 20px",
        background: `linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10)`,
        borderRadius: isMobile ? "12px" : "16px",
        border: `1.5px solid ${appTheme.colors.primary}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: appTheme.colors.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.2rem"
          }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary }}>Current Company</div>
            <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: "600", color: appTheme.colors.textPrimary }}>
              {user?.companyName || 'Your Company'}
            </div>
          </div>
        </div>
        {isSuperAdmin && (
          <div style={{
            padding: "6px 12px",
            background: `${appTheme.colors.warning}20`,
            border: `1px solid ${appTheme.colors.warning}40`,
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: appTheme.colors.warning,
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👑</span>
            Super Admin View
          </div>
        )}
      </div>

      {/* API Error Message */}
      {apiError && (
        <div style={{
          marginBottom: isMobile ? "20px" : "24px",
          padding: isMobile ? "12px 16px" : "14px 20px",
          background: `${appTheme.colors.error}10`,
          border: `1.5px solid ${appTheme.colors.error}`,
          borderRadius: isMobile ? "12px" : "16px",
          color: appTheme.colors.error,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: isMobile ? "0.9rem" : "0.95rem"
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          {apiError}
        </div>
      )}

      {/* Header Section */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "flex-start",
        marginBottom: isMobile ? "20px" : "24px",
        gap: isMobile ? "16px" : "20px",
      }}>
        <div style={{ width: "100%" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "12px" : "15px",
            marginBottom: "6px",
          }}>
            <div style={{
              width: isMobile ? "3px" : "4px",
              height: isMobile ? "24px" : "32px",
              background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
              borderRadius: "2px",
            }}></div>
            <h1 style={{ 
              color: appTheme.colors.textPrimary, 
              fontWeight: "700",
              fontSize: isMobile ? "1.5rem" : "1.75rem",
              margin: 0,
              lineHeight: 1.2,
            }}>
              Orders
            </h1>
          </div>
          <p style={{ 
            color: appTheme.colors.textSecondary, 
            margin: "4px 0 0 15px",
            fontSize: isMobile ? "0.85rem" : "0.95rem",
            fontWeight: "500",
          }}>
            {filteredOrders.length} orders • Page {currentPage} of {totalPages} • 
            {formatCurrency(filteredSummary.revenue)} total
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: isMobile ? "10px" : "12px",
          flexWrap: isMobile ? "nowrap" : "wrap",
          width: isMobile ? "100%" : "auto",
          overflowX: isMobile ? "auto" : "visible",
          paddingBottom: isMobile ? "4px" : "0",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...glassButtonStyle(appTheme.colors.info, isMobile),
              background: showFilters ? `${appTheme.colors.info}30` : `${appTheme.colors.info}15`,
            }}
          >
            <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>🔍</span>
            {!isMobile && "Filters"}
            {isMobile && "Filters"}
          </button>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            style={{
              ...glassButtonStyle(appTheme.colors.primary, isMobile),
              opacity: isRefreshing ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: isMobile ? "1.1rem" : "1rem", animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {!isMobile && "Refresh"}
            {isMobile && "Refresh"}
          </button>
          <button
            onClick={downloadPDF}
            style={glassButtonStyle(appTheme.colors.secondary, isMobile)}
          >
            <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>📄</span>
            {!isMobile && "PDF"}
            {isMobile && "PDF"}
          </button>
          <button
            onClick={downloadExcel}
            style={glassButtonStyle(appTheme.colors.success, isMobile)}
          >
            <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>📊</span>
            {!isMobile && "Excel"}
            {isMobile && "Excel"}
          </button>
          <button
            onClick={handlePrint}
            style={glassButtonStyle(appTheme.colors.warning, isMobile)}
          >
            <span style={{ fontSize: isMobile ? "1.1rem" : "1rem" }}>🖨️</span>
            {!isMobile && "Print"}
            {isMobile && "Print"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
        gap: isMobile ? "10px" : "15px",
        marginBottom: isMobile ? "20px" : "24px",
      }}>
        <SummaryCard 
          label="Total Orders" 
          value={filteredSummary.total} 
          icon="📦"
          isMobile={isMobile}
        />
        <SummaryCard 
          label="Total Revenue" 
          value={formatCurrency(filteredSummary.revenue)} 
          icon="💰"
          isMobile={isMobile}
        />
        {!isMobile && (
          <>
            <SummaryCard 
              label="Total Paid" 
              value={formatCurrency(filteredSummary.paid)} 
              icon="✅"
              isMobile={isMobile}
            />
            <SummaryCard 
              label="Pending" 
              value={formatCurrency(filteredSummary.pending)} 
              icon="⏳"
              isMobile={isMobile}
            />
            <SummaryCard 
              label="Avg Order" 
              value={formatCurrency(filteredSummary.average)} 
              icon="📊"
              isMobile={isMobile}
            />
          </>
        )}
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <div style={{
          marginBottom: isMobile ? "20px" : "24px",
          padding: isMobile ? "16px" : "20px",
          background: `${appTheme.colors.surface}80`,
          borderRadius: isMobile ? "12px" : "16px",
          border: `1.5px solid ${appTheme.colors.border}30`,
          backdropFilter: "blur(10px)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? "1rem" : "1.1rem",
              color: appTheme.colors.textPrimary,
              fontWeight: "600",
            }}>
              Filter Orders
            </h3>
            <button
              onClick={resetFilters}
              style={{
                background: "none",
                border: "none",
                color: appTheme.colors.primary,
                cursor: "pointer",
                fontSize: isMobile ? "0.9rem" : "0.95rem",
                fontWeight: "600",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              Reset All
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? "12px" : "16px",
          }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={filterSelectStyle(isMobile)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              style={filterSelectStyle(isMobile)}
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial Paid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={filterSelectStyle(isMobile)}
            >
              <option value="createdAt">Sort by Date</option>
              <option value="totalPrice">Sort by Amount</option>
              <option value="customerName">Sort by Customer</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* Date Range */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                style={{ ...filterSelectStyle(isMobile), width: "50%" }}
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                style={{ ...filterSelectStyle(isMobile), width: "50%" }}
                placeholder="To"
              />
            </div>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={filterSelectStyle(isMobile)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{
        position: "relative",
        marginBottom: isMobile ? "20px" : "24px",
        width: "100%",
      }}>
        <div style={{
          position: "absolute",
          left: isMobile ? "14px" : "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: appTheme.colors.textSecondary,
          fontSize: isMobile ? "14px" : "16px",
          pointerEvents: "none",
        }}>
          🔍
        </div>
        <input
          type="text"
          placeholder={isMobile ? "Search orders..." : "Search by order #, invoice #, customer, phone, email, address, tracking..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: isMobile ? "14px 14px 14px 44px" : "14px 16px 14px 48px",
            border: `1.5px solid ${appTheme.colors.border}60`,
            borderRadius: isMobile ? "10px" : "12px",
            outline: "none",
            fontSize: isMobile ? "16px" : "0.95rem",
            transition: "all 0.3s ease",
            backgroundColor: `${appTheme.colors.surface}80`,
            WebkitAppearance: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = appTheme.colors.primary;
            e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = `${appTheme.colors.border}60`;
            e.target.style.boxShadow = "none";
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              position: "absolute",
              right: isMobile ? "14px" : "16px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: appTheme.colors.textSecondary,
              fontSize: isMobile ? "18px" : "16px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Orders Container */}
      <div id="orders-container" style={{ 
        display: "grid", 
        gap: isMobile ? "16px" : "20px",
      }}>
        {paginatedOrders.length === 0 ? (
          <div style={{
            backgroundColor: appTheme.colors.surface,
            padding: isMobile ? "40px 24px" : "60px 40px",
            borderRadius: isMobile ? "16px" : "20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            border: `1.5px solid ${appTheme.colors.border}30`
          }}>
            <div style={{ 
              fontSize: isMobile ? "3rem" : "4rem", 
              marginBottom: "1rem",
              opacity: 0.5,
            }}>
              📭
            </div>
            <div style={{ 
              fontSize: isMobile ? "1.25rem" : "1.5rem", 
              fontWeight: "600",
              marginBottom: "0.5rem",
              color: appTheme.colors.textPrimary
            }}>
              No orders found
            </div>
            {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || dateRange.from || dateRange.to) && (
              <div style={{ 
                fontSize: isMobile ? "0.9rem" : "1rem", 
                marginBottom: "1.5rem",
                opacity: 0.7,
                color: appTheme.colors.textSecondary
              }}>
                No results with current filters
              </div>
            )}
            <button
              onClick={resetFilters}
              style={{
                padding: isMobile ? "12px 20px" : "12px 24px",
                border: `1.5px solid ${appTheme.colors.primary}30`,
                background: "transparent",
                color: appTheme.colors.primary,
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: isMobile ? "0.95rem" : "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minHeight: isMobile ? "48px" : "44px",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.background = appTheme.colors.primary;
                  e.target.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.background = "transparent";
                  e.target.style.color = appTheme.colors.primary;
                }
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <CustomCard
              key={order._id}
              order={order}
              onDelete={handleDelete}
              onUpdateField={handleUpdateField}
              onProcessPayment={handleProcessPayment}
              onCancelOrder={handleCancelOrder}
              isMobile={isMobile}
              user={user}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: isMobile ? "stretch" : "center",
            marginTop: isMobile ? "24px" : "32px",
            padding: isMobile ? "20px" : "24px",
            background: appTheme.colors.surface,
            borderRadius: isMobile ? "16px" : "16px",
            border: `1.5px solid ${appTheme.colors.border}30`,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
            gap: isMobile ? "16px" : "20px",
          }}
        >
          <div style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: isMobile ? "0.9rem" : "0.95rem",
            fontWeight: "500",
            textAlign: isMobile ? "center" : "left",
          }}>
            Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders
          </div>
          
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center", 
            justifyContent: isMobile ? "center" : "flex-end",
            gap: isMobile ? "12px" : "10px",
            width: isMobile ? "100%" : "auto",
          }}>
            <div style={{ 
              display: "flex", 
              gap: isMobile ? "8px" : "6px",
              justifyContent: "center",
              order: isMobile ? 2 : 1,
              width: isMobile ? "100%" : "auto",
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={paginationButtonStyle(currentPage === 1, isMobile)}
              >
                ←
                {!isMobile && " Previous"}
              </button>
              
              <div style={{ 
                display: "flex", 
                gap: isMobile ? "6px" : "6px",
                margin: isMobile ? "0 4px" : "0 12px",
              }}>
                {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= (isMobile ? 3 : 5)) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - (isMobile ? 2 : 4) + i;
                  } else {
                    pageNum = currentPage - (isMobile ? 1 : 2) + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: isMobile ? "10px 14px" : "10px 16px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: isMobile ? "0.9rem" : "0.9rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        background: currentPage === pageNum 
                          ? appTheme.colors.primary
                          : "transparent",
                        color: currentPage === pageNum ? "white" : appTheme.colors.textSecondary,
                        minWidth: isMobile ? "44px" : "44px",
                        minHeight: isMobile ? "44px" : "40px",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile && currentPage !== pageNum) {
                          e.target.style.background = `${appTheme.colors.primary}15`;
                          e.target.style.color = appTheme.colors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile && currentPage !== pageNum) {
                          e.target.style.background = "transparent";
                          e.target.style.color = appTheme.colors.textSecondary;
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={paginationButtonStyle(currentPage === totalPages, isMobile)}
              >
                {!isMobile && "Next "}
                →
              </button>
            </div>

            {/* Mobile Page Indicator */}
            {isMobile && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                order: 1,
                marginBottom: "4px",
              }}>
                <span style={{
                  fontSize: "0.85rem",
                  color: appTheme.colors.textSecondary,
                  fontWeight: "500",
                }}>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media screen and (max-width: 768px) {
          div::-webkit-scrollbar {
            display: none;
          }
          
          button, 
          [role="button"],
          input[type="button"],
          input[type="submit"] {
            min-height: 48px;
            min-width: 48px;
          }
          
          input, select, textarea {
            font-size: 16px !important;
          }
          
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          button:hover {
            transform: none !important;
            box-shadow: none !important;
          }
          
          * {
            -webkit-tap-highlight-color: transparent;
          }
        }

        @media screen and (min-width: 769px) {
          button:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          button:not(:disabled):active {
            transform: translateY(0);
          }
          
          select:hover, input:hover {
            border-color: ${appTheme.colors.primary} !important;
          }
        }
      `}</style>
    </div>
  );
}

// Summary Card Component
const SummaryCard = ({ label, value, icon, isMobile }) => (
  <div style={{
    background: `${appTheme.colors.surface}80`,
    backdropFilter: "blur(10px)",
    padding: isMobile ? "12px" : "16px",
    borderRadius: isMobile ? "10px" : "12px",
    border: `1.5px solid ${appTheme.colors.border}30`,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    transition: "all 0.3s ease",
    textAlign: "center",
  }}>
    <div style={{
      fontSize: isMobile ? "1.2rem" : "1.5rem",
      marginBottom: "4px",
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: isMobile ? "0.75rem" : "0.8rem",
      color: appTheme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
    }}>
      {label}
    </div>
    <div style={{
      fontSize: isMobile ? "1rem" : "1.2rem",
      fontWeight: "700",
      color: appTheme.colors.textPrimary,
    }}>
      {value}
    </div>
  </div>
);

// Glass Button Style
const glassButtonStyle = (color, isMobile) => ({
  backgroundColor: `${color}15`,
  border: `1.5px solid ${color}30`,
  color: color,
  padding: isMobile ? "12px 16px" : "12px 20px",
  borderRadius: isMobile ? "10px" : "10px",
  cursor: "pointer",
  fontSize: isMobile ? "0.9rem" : "0.9rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: isMobile ? "6px" : "8px",
  backdropFilter: "blur(10px)",
  whiteSpace: "nowrap",
  minHeight: isMobile ? "48px" : "44px",
  minWidth: isMobile ? "80px" : "auto",
  flex: isMobile ? "0 0 auto" : "none",
  WebkitTapHighlightColor: "transparent",
});

// Filter Select Style
const filterSelectStyle = (isMobile) => ({
  padding: isMobile ? "12px 14px" : "10px 14px",
  border: `1.5px solid ${appTheme.colors.border}60`,
  borderRadius: isMobile ? "10px" : "8px",
  fontSize: isMobile ? "16px" : "0.95rem",
  backgroundColor: `${appTheme.colors.surface}80`,
  color: appTheme.colors.textPrimary,
  outline: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  width: "100%",
  minHeight: isMobile ? "48px" : "44px",
  WebkitAppearance: isMobile ? "none" : "auto",
  backgroundImage: isMobile ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'/></svg>")' : 'none',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: isMobile ? '40px' : '14px',
});

// Pagination Button Style
const paginationButtonStyle = (disabled, isMobile) => ({
  backgroundColor: disabled ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}15`,
  border: `1.5px solid ${disabled ? appTheme.colors.border : appTheme.colors.primary}30`,
  color: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
  padding: isMobile ? "12px 18px" : "10px 16px",
  borderRadius: "8px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: isMobile ? "0.95rem" : "0.9rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  opacity: disabled ? 0.5 : 1,
  minHeight: isMobile ? "48px" : "40px",
  minWidth: isMobile ? "80px" : "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  WebkitTapHighlightColor: "transparent",
});