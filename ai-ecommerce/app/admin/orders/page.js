"use client";

import React, { useEffect, useState, useMemo } from "react";
import { appTheme } from "../../../src/constants/theme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import CustomCard from "../../../src/components/customCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic - updated to include customerName and secondaryPhoneNumber
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    return orders.filter((order) =>
      Object.values(order).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.secondaryPhoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.createdBy?.name?.toLowerCase() || order.createdBy?.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Delete order
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
      alert("Failed to delete order");
    }
  };

  // Update status or paymentStatus
  const handleUpdateField = async (id, field, value) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) fetchOrders();
      else alert(data.message);
    } catch (err) {
      console.error("Update order field error:", err);
      alert("Failed to update order");
    }
  };

  // PDF Download - updated to include customerName and secondaryPhoneNumber
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(
      parseInt(appTheme.colors.primary.slice(1, 3), 16),
      parseInt(appTheme.colors.primary.slice(3, 5), 16),
      parseInt(appTheme.colors.primary.slice(5, 7), 16)
    );
    doc.text("Orders Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data - updated columns
    const tableColumn = ["Order #", "Customer Name", "Primary Phone", "Secondary Phone", "Address", "Total", "Status", "Payment"];
    const tableRows = filteredOrders.map((order) => [
      order.orderNumber || "N/A",
      order.customerName || "N/A",
      order.phoneNumber || "N/A",
      order.secondaryPhoneNumber || "N/A",
      `${order.shippingAddress}, ${order.pincode}`,
      `₹${order.totalPrice}`,
      order.status,
      order.paymentStatus
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
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
      margin: { top: 35 }
    });

    doc.save("orders_report.pdf");
  };

  // Excel Download - updated to include customerName and secondaryPhoneNumber
  const downloadExcel = () => {
    const worksheetData = filteredOrders.map(order => ({
      "Order Number": order.orderNumber,
      "Customer Name": order.customerName,
      "Primary Phone": order.phoneNumber,
      "Secondary Phone": order.secondaryPhoneNumber || "N/A",
      "Address": `${order.shippingAddress}, ${order.pincode}`,
      "Total Price": order.totalPrice,
      "Status": order.status,
      "Payment Status": order.paymentStatus,
      "Items Count": order.items.length
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
    // Add column widths
    if (!worksheet['!cols']) {
      worksheet['!cols'] = [
        { width: 15 }, // Order Number
        { width: 20 }, // Customer Name
        { width: 15 }, // Primary Phone
        { width: 15 }, // Secondary Phone
        { width: 30 }, // Address
        { width: 12 }, // Total Price
        { width: 12 }, // Status
        { width: 15 }, // Payment Status
        { width: 12 }  // Items Count
      ];
    }
    
    XLSX.writeFile(workbook, "orders_report.xlsx");
  };

  // Print Table - updated to include customerName and secondaryPhoneNumber
  const handlePrint = () => {
    const printContent = document.getElementById("orders-container").innerHTML;
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
              margin: 40px;
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
            .print-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 15px;
              font-size: 14px;
              color: #666;
            }
            .order-card {
              background: white;
              border: 2px solid #f0f0f0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
              break-inside: avoid;
            }
            .order-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e8e8e8;
            }
            .order-details {
              display: grid;
              gap: 8px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background: ${appTheme.colors.primary} !important;
              color: white !important;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #e8e8e8;
              font-size: 12px;
            }
            .status-select, .action-buttons {
              display: none;
            }
            @media print {
              body { margin: 15px; }
              .print-header { margin-bottom: 20px; }
              .order-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Orders Report</h1>
            <p>Comprehensive Orders List</p>
            <div class="print-meta">
              <span>Total Orders: ${filteredOrders.length}</span>
              <span>Generated on ${new Date().toLocaleDateString()}</span>
              <span>Page 1</span>
            </div>
          </div>
          <div id="orders-content">
            ${printContent}
          </div>
          <script>
            // Remove action buttons and selects for print
            document.querySelectorAll('.status-select, .action-buttons').forEach(el => el.remove());
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 100);
    }, 500);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "40px", 
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          textAlign: "center",
          color: appTheme.colors.textSecondary
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ fontSize: "1.1rem" }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "40px", 
      backgroundColor: appTheme.colors.background,
      minHeight: "100vh"
    }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "4px",
              height: "32px",
              background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
              borderRadius: "2px",
            }}></div>
            <h1 style={{ 
              color: appTheme.colors.textPrimary, 
              fontWeight: "700",
              fontSize: "2rem",
              margin: 0,
              lineHeight: 1.2,
            }}>
              Orders Management
            </h1>
          </div>
          <p style={{ 
            color: appTheme.colors.textSecondary, 
            margin: "8px 0 0 19px",
            fontSize: "1rem",
            fontWeight: "500",
          }}>
            {filteredOrders.length} orders found • Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Actions */}
        <div style={{ 
          display: "flex", 
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <button
            onClick={downloadPDF}
            style={glassButtonStyle(appTheme.colors.secondary)}
          >
            📄 PDF
          </button>
          <button
            onClick={downloadExcel}
            style={glassButtonStyle(appTheme.colors.success)}
          >
            📊 Excel
          </button>
          <button
            onClick={handlePrint}
            style={glassButtonStyle(appTheme.colors.warning)}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        position: "relative",
        marginBottom: "30px",
        maxWidth: "500px"
      }}>
        <div style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: appTheme.colors.textSecondary,
          fontSize: "16px",
        }}>
          🔍
        </div>
        <input
          type="text"
          placeholder="Search by order number, customer name, phone numbers, address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: "14px 16px 14px 48px",
            border: `1.5px solid ${appTheme.colors.border}60`,
            borderRadius: "12px",
            outline: "none",
            fontSize: "1rem",
            transition: "all 0.3s ease",
            backgroundColor: `${appTheme.colors.surface}80`,
            //backdropFilter: "blur(10px)",
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
      </div>

      {/* Orders Container */}
      <div id="orders-container" style={{ display: "grid", gap: "20px" }}>
        {paginatedOrders.length === 0 ? (
          <div style={{
            backgroundColor: appTheme.colors.surface,
            padding: "60px 40px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: `1.5px solid ${appTheme.colors.border}30`
          }}>
            <div style={{ 
              fontSize: "4rem", 
              marginBottom: "1rem",
              opacity: 0.5,
            }}>
              📭
            </div>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: "600",
              marginBottom: "0.5rem",
              color: appTheme.colors.textPrimary
            }}>
              No orders found
            </div>
            {searchTerm && (
              <div style={{ 
                fontSize: "1rem", 
                marginBottom: "1.5rem",
                opacity: 0.7,
                color: appTheme.colors.textSecondary
              }}>
                No results for "<strong>{searchTerm}</strong>"
              </div>
            )}
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: "12px 24px",
                border: `1.5px solid ${appTheme.colors.primary}30`,
                background: "transparent",
                color: appTheme.colors.primary,
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = appTheme.colors.primary;
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = appTheme.colors.primary;
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <CustomCard
              key={order._id}
              order={order}
              onDelete={handleDelete}
              onUpdateField={handleUpdateField}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
            padding: "25px",
            background: appTheme.colors.surface,
            borderRadius: "16px",
            border: `1.5px solid ${appTheme.colors.border}30`,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "1rem",
            fontWeight: "500",
          }}>
            Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            flexWrap: "wrap",
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={paginationButtonStyle(currentPage === 1)}
            >
              ← Previous
            </button>
            
            <div style={{ 
              display: "flex", 
              gap: "6px",
              margin: "0 12px",
            }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      background: currentPage === pageNum 
                        ? appTheme.colors.primary
                        : "transparent",
                      color: currentPage === pageNum ? "white" : appTheme.colors.textSecondary,
                      minWidth: "44px",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== pageNum) {
                        e.target.style.background = `${appTheme.colors.primary}15`;
                        e.target.style.color = appTheme.colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== pageNum) {
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
              style={paginationButtonStyle(currentPage === totalPages)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Glass Button Style
const glassButtonStyle = (color) => ({
  backgroundColor: `${color}15`,
  border: `1.5px solid ${color}30`,
  color: color,
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backdropFilter: "blur(10px)",
});

const paginationButtonStyle = (disabled) => ({
  backgroundColor: disabled ? `${appTheme.colors.border}20` : `${appTheme.colors.primary}15`,
  border: `1.5px solid ${disabled ? appTheme.colors.border : appTheme.colors.primary}30`,
  color: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "0.9rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  opacity: disabled ? 0.5 : 1,
});

// Add global styles for hover effects
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    button:not(:disabled):active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}


// "use client";

// import React, { useEffect, useState } from "react";
// import { appTheme } from "@/src/constants/theme";
// import { useRouter } from "next/navigation";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import * as XLSX from "xlsx";

// export default function OrdersPage() {
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [search, setSearch] = useState("");

//   // Fetch orders
//   const fetchOrders = async () => {
//     try {
//       const res = await fetch("/api/orders");
//       const data = await res.json();
//       if (data.success) setOrders(data.data);
//     } catch (err) {
//       console.error("Fetch Orders Error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Delete order
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this order?")) return;
//     try {
//       const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
//       const data = await res.json();
//       alert(data.message);
//       fetchOrders();
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete order");
//     }
//   };

//   // Update status
//   const handleStatusChange = async (id, field, value) => {
//     try {
//       const res = await fetch(`/api/orders?id=${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ [field]: value }),
//       });
//       const data = await res.json();
//       if (data.success) fetchOrders();
//     } catch (err) {
//       console.error("Status update error:", err);
//     }
//   };

//   // Export to Excel
//   const exportExcel = () => {
//     const wsData = orders.map((order) => ({
//       OrderNumber: order.orderNumber,
//       TotalPrice: order.totalPrice,
//       PaymentStatus: order.paymentStatus,
//       Status: order.status,
//       Phone: order.phoneNumber,
//       Address: order.shippingAddress,
//       Date: new Date(order.createdAt).toLocaleString(),
//     }));
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(wsData);
//     XLSX.utils.book_append_sheet(wb, ws, "Orders");
//     XLSX.writeFile(wb, "Orders.xlsx");
//   };

//   // Export to PDF
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     const head = [["Order#", "Total", "Payment", "Status", "Phone", "Date"]];
//     const body = orders.map((o) => [
//       o.orderNumber,
//       o.totalPrice,
//       o.paymentStatus,
//       o.status,
//       o.phoneNumber,
//       new Date(o.createdAt).toLocaleString(),
//     ]);
//     doc.autoTable({ head, body, startY: 20 });
//     doc.save("Orders.pdf");
//   };

//   // Filter orders by search
//   const filteredOrders = orders.filter(
//     (o) =>
//       o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
//       o.phoneNumber.includes(search)
//   );

//   return (
//     <div
//       style={{
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         padding: "30px",
//         color: appTheme.colors.textPrimary,
//         fontFamily: appTheme.fonts.primary,
//       }}
//     >
//       <h1 style={{ color: appTheme.colors.primary, marginBottom: "20px" }}>
//         Orders
//       </h1>

//       {/* Top Controls */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "20px",
//           flexWrap: "wrap",
//           gap: "10px",
//         }}
//       >
//         <input
//           type="text"
//           placeholder="Search by Order# or Phone"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{
//             padding: "8px 12px",
//             borderRadius: appTheme.radius.md,
//             border: `1px solid ${appTheme.colors.border}`,
//             flex: "1",
//             minWidth: "220px",
//           }}
//         />
//         <div style={{ display: "flex", gap: "10px" }}>
//           <button
//             onClick={exportExcel}
//             style={{
//               backgroundColor: "#2563eb",
//               color: "#fff",
//               padding: "8px 16px",
//               borderRadius: appTheme.radius.md,
//               cursor: "pointer",
//               border: "none",
//             }}
//           >
//             Export Excel
//           </button>
//           <button
//             onClick={exportPDF}
//             style={{
//               backgroundColor: "#059669",
//               color: "#fff",
//               padding: "8px 16px",
//               borderRadius: appTheme.radius.md,
//               cursor: "pointer",
//               border: "none",
//             }}
//           >
//             Export PDF
//           </button>
//         </div>
//       </div>

//       {/* Orders Grid */}
//       <div
//         style={{
//           display: "grid",
//           gap: "20px",
//           gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//         }}
//       >
//         {filteredOrders.map((order) => (
//           <div
//             key={order._id}
//             style={{
//               backgroundColor: "#fff",
//               padding: "20px",
//               borderRadius: appTheme.radius.lg,
//               boxShadow: appTheme.shadows.md,
//               display: "flex",
//               flexDirection: "column",
//               gap: "10px",
//             }}
//           >
//             {/* Top Actions */}
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: "10px",
//               }}
//             >
//               <select
//                 value={order.status}
//                 onChange={(e) =>
//                   handleStatusChange(order._id, "status", e.target.value)
//                 }
//                 style={{
//                   padding: "4px 8px",
//                   borderRadius: appTheme.radius.md,
//                   border: `1px solid ${appTheme.colors.border}`,
//                 }}
//               >
//                 {["pending", "processing", "shipped", "delivered", "cancelled"].map(
//                   (s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   )
//                 )}
//               </select>

//               <select
//                 value={order.paymentStatus}
//                 onChange={(e) =>
//                   handleStatusChange(order._id, "paymentStatus", e.target.value)
//                 }
//                 style={{
//                   padding: "4px 8px",
//                   borderRadius: appTheme.radius.md,
//                   border: `1px solid ${appTheme.colors.border}`,
//                 }}
//               >
//                 {["pending", "paid", "failed", "refunded"].map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 onClick={() => handleDelete(order._id)}
//                 style={{
//                   backgroundColor: "#ef4444",
//                   color: "#fff",
//                   padding: "4px 10px",
//                   borderRadius: appTheme.radius.md,
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Delete
//               </button>
//             </div>

//             {/* Order Info */}
//             <div style={{ fontSize: "14px", color: "#555" }}>
//               <p>
//                 <strong>Order#: </strong>
//                 {order.orderNumber}
//               </p>
//               <p>
//                 <strong>Total: </strong>${order.totalPrice}
//               </p>
//               <p>
//                 <strong>Phone: </strong>{order.phoneNumber}
//               </p>
//               <p>
//                 <strong>Address: </strong>{order.shippingAddress}
//               </p>
//               <p>
//                 <strong>Date: </strong>
//                 {new Date(order.createdAt).toLocaleString()}
//               </p>

//               {/* Items List */}
//               <div style={{ marginTop: "10px" }}>
//                 <strong>Items:</strong>
//                 {order.items.map((item) => (
//                   <div
//                     key={item.productId || item._id}
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       marginTop: "4px",
//                       padding: "4px 0",
//                       borderBottom: "1px dashed #ccc",
//                     }}
//                   >
//                     <span>{item.productName}</span>
//                     <span>
//                       {item.quantity} x ${item.price}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}

//         {filteredOrders.length === 0 && (
//           <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}>
//             No orders found
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }