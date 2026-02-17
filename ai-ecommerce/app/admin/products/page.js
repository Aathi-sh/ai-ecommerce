// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { appTheme } from "../../../src/constants/theme";
// import { DataTable } from "../../../src/components/table";

// export default function ProductTablePage() {
//   const router = useRouter();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Fetch all products
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/products");
      
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       if (data.success) {
//         setProducts(data.data || []);
//         setFilteredProducts(data.data || []);
//       } else {
//         console.error("API Error:", data.message);
//         setProducts([]);
//         setFilteredProducts([]);
//       }
//     } catch (err) {
//       console.error("Error fetching products:", err);
//       setProducts([]);
//       setFilteredProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // Filter and search products
//   useEffect(() => {
//     let filtered = products;

//     // Apply stock filter
//     switch (activeFilter) {
//       case "low":
//         filtered = filtered.filter(product => product.stock < 5 && product.stock > 0);
//         break;
//       case "out":
//         filtered = filtered.filter(product => product.stock === 0);
//         break;
//       case "active":
//         filtered = filtered.filter(product => product.isActive === true);
//         break;
//       case "inactive":
//         filtered = filtered.filter(product => product.isActive === false);
//         break;
//       default:
//         // "all" - no additional filtering
//         break;
//     }

//     // Apply search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(product => 
//         product.productName?.toLowerCase().includes(term) ||
//         product.category?.toLowerCase().includes(term) ||
//         product.description?.toLowerCase().includes(term)
//       );
//     }

//     setFilteredProducts(filtered);
//   }, [activeFilter, searchTerm, products]);

//   // Edit handler
//   const handleEdit = (product) => {
//     console.log("Edit product:", product);
//     router.push(`/admin/products/productForm?id=${product._id}`);
//   };

//   // Delete handler
//   const handleDelete = async (product) => {
//     if (!confirm(`Are you sure you want to delete "${product.productName}"? This action cannot be undone.`)) return;

//     try {
//       const res = await fetch(`/api/products?id=${product._id}`, {
//         method: "DELETE",
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         alert(`"${product.productName}" has been deleted successfully.`);
//         fetchProducts(); // Refresh the list
//       } else {
//         alert(`Failed to delete product: ${data.message}`);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete product. Please try again.");
//     }
//   };

//   // Toggle product status (active/inactive)
//   const handleToggleStatus = async (product) => {
//     const newStatus = !product.isActive;
//     const action = newStatus ? "activate" : "deactivate";
    
//     if (!confirm(`Are you sure you want to ${action} "${product.productName}"?`)) return;

//     try {
//       const res = await fetch("/api/products", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           _id: product._id,
//           isActive: newStatus
//         }),
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         alert(`Product ${action}d successfully.`);
//         fetchProducts(); // Refresh the list
//       } else {
//         alert(`Failed to ${action} product: ${data.message}`);
//       }
//     } catch (err) {
//       console.error("Toggle status error:", err);
//       alert(`Failed to ${action} product. Please try again.`);
//     }
//   };

//   // Calculate statistics
//   const totalProducts = products.length;
//   const activeProducts = products.filter(product => product.isActive === true).length;
//   const inactiveProducts = products.filter(product => product.isActive === false).length;
//   const lowStockProducts = products.filter(product => product.stock < 5 && product.stock > 0 && product.isActive).length;
//   const outOfStockProducts = products.filter(product => product.stock === 0 && product.isActive).length;

//   // Define columns for your DataTable component
//   const columns = [
//     { 
//       header: "Product Info", 
//       accessor: "productName",
//       cell: (value, row) => (
//         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//           {row.imageUrls?.[0] && (
//             <img 
//               src={row.imageUrls[0]} 
//               alt={value}
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 borderRadius: "8px",
//                 objectFit: "cover",
//                 border: `1px solid ${appTheme.colors.border}`
//               }}
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <div>
//             <div style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "2px" }}>
//               {value}
//             </div>
//             <div style={{ 
//               fontSize: "0.75rem", 
//               color: appTheme.colors.textSecondary,
//               display: "-webkit-box",
//               WebkitLineClamp: 1,
//               WebkitBoxOrient: "vertical",
//               overflow: "hidden"
//             }}>
//               ID: {row._id?.substring(18) || "N/A"}
//             </div>
//           </div>
//         </div>
//       )
//     },
//     { 
//       header: "Category", 
//       accessor: "category",
//       cell: (value) => (
//         <span style={{
//           backgroundColor: appTheme.colors.primary + "15",
//           color: appTheme.colors.primary,
//           padding: "4px 8px",
//           borderRadius: "12px",
//           fontSize: "0.75rem",
//           fontWeight: "500",
//           border: `1px solid ${appTheme.colors.primary}20`
//         }}>
//           {value || "Uncategorized"}
//         </span>
//       )
//     },
//     { 
//       header: "Price", 
//       accessor: "price",
//       cell: (value) => (
//         <span style={{ 
//           fontWeight: "700", 
//           color: appTheme.colors.primary,
//           fontSize: "0.875rem"
//         }}>
//           ₹{parseFloat(value).toFixed(2)}
//         </span>
//       )
//     },
//     { 
//       header: "Stock", 
//       accessor: "stock",
//       cell: (value, row) => (
//         <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//           <span style={{
//             color: value > 10 ? appTheme.colors.success : 
//                    value > 0 ? appTheme.colors.warning : 
//                    appTheme.colors.error,
//             fontWeight: "600",
//             fontSize: "0.875rem",
//           }}>
//             {value} units
//           </span>
//           {value <= 10 && value > 0 && row.isActive && (
//             <span style={{
//               fontSize: "0.7rem",
//               color: appTheme.colors.warning,
//               fontWeight: "500"
//             }}>
//               Low Stock
//             </span>
//           )}
//           {value === 0 && row.isActive && (
//             <span style={{
//               fontSize: "0.7rem",
//               color: appTheme.colors.error,
//               fontWeight: "500"
//             }}>
//               Out of Stock
//             </span>
//           )}
//         </div>
//       )
//     },
//     { 
//       header: "Status", 
//       accessor: "isActive",
//       cell: (value) => (
//         <span style={{
//           padding: "6px 12px",
//           borderRadius: "20px",
//           fontSize: "0.75rem",
//           fontWeight: "600",
//           backgroundColor: value ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
//           color: value ? appTheme.colors.success : appTheme.colors.textSecondary,
//           border: `1px solid ${value ? appTheme.colors.success + "40" : appTheme.colors.textSecondary + "40"}`,
//         }}>
//           {value ? "🟢 Active" : "⚫ Inactive"}
//         </span>
//       )
//     },
//     { 
//       header: "Last Updated", 
//       accessor: "updatedAt",
//       cell: (value) => (
//         <span style={{
//           fontSize: "0.75rem",
//           color: appTheme.colors.textSecondary,
//         }}>
//           {value ? new Date(value).toLocaleDateString() : "N/A"}
//         </span>
//       )
//     },
//   ];

//   return (
//     <div
//       style={{
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         padding: "32px",
//         fontFamily: appTheme.fonts.primary,
//         color: appTheme.colors.textPrimary,
//       }}
//     >
//       {/* Header Section */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "24px",
//           flexWrap: "wrap",
//           gap: "16px"
//         }}
//       >
//         <div>
//           <h1
//             style={{
//               color: appTheme.colors.primary,
//               fontSize: "2rem",
//               fontWeight: "700",
//               marginBottom: "4px",
//             }}
//           >
//             Products Management
//           </h1>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: "0.875rem",
//             margin: 0
//           }}>
//             Manage your product inventory and stock levels
//           </p>
//         </div>
//         <Link href="/admin/products/productForm">
//           <button
//             style={{
//               backgroundColor: appTheme.colors.primary,
//               color: "#fff",
//               padding: "12px 24px",
//               border: "none",
//               borderRadius: "12px",
//               cursor: "pointer",
//               fontWeight: "600",
//               fontSize: "0.875rem",
//               boxShadow: `0 4px 12px ${appTheme.colors.primary}30`,
//               transition: "all 0.2s ease",
//               display: "flex",
//               alignItems: "center",
//               gap: "8px"
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.transform = "translateY(-2px)")
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.transform = "translateY(0)")
//             }
//           >
//             <span style={{ fontSize: "1.2rem" }}>+</span>
//             Add New Product
//           </button>
//         </Link>
//       </div>

//       {/* Search Bar */}
//       <div style={{ marginBottom: "24px" }}>
//         <div style={{
//           position: "relative",
//           maxWidth: "400px"
//         }}>
//           <input
//             type="text"
//             placeholder="Search products by name, category, or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               width: "100%",
//               padding: "12px 16px 12px 40px",
//               border: `1px solid ${appTheme.colors.border}`,
//               borderRadius: "12px",
//               fontSize: "0.875rem",
//               backgroundColor: appTheme.colors.surface,
//               color: appTheme.colors.textPrimary,
//               outline: "none",
//               transition: "all 0.2s ease"
//             }}
//             onFocus={(e) => {
//               e.target.style.borderColor = appTheme.colors.primary;
//               e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//             }}
//             onBlur={(e) => {
//               e.target.style.borderColor = appTheme.colors.border;
//               e.target.style.boxShadow = "none";
//             }}
//           />
//           <span style={{
//             position: "absolute",
//             left: "12px",
//             top: "50%",
//             transform: "translateY(-50%)",
//             color: appTheme.colors.textSecondary,
//             fontSize: "1rem"
//           }}>
//             🔍
//           </span>
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               style={{
//                 position: "absolute",
//                 right: "12px",
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 background: "none",
//                 border: "none",
//                 color: appTheme.colors.textSecondary,
//                 cursor: "pointer",
//                 fontSize: "1rem"
//               }}
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Stock Statistics with Filter Functionality */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//           gap: "16px",
//           marginBottom: "24px",
//         }}
//       >
//         {/* All Products */}
//         <div
//           onClick={() => setActiveFilter("all")}
//           style={{
//             backgroundColor: activeFilter === "all" ? appTheme.colors.primary + "15" : appTheme.colors.surface,
//             padding: "20px",
//             borderRadius: "16px",
//             boxShadow: appTheme.shadows.sm,
//             border: `2px solid ${activeFilter === "all" ? appTheme.colors.primary : appTheme.colors.border}`,
//             textAlign: "center",
//             cursor: "pointer",
//             transition: "all 0.2s ease",
//           }}
//         >
//           <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.primary, marginBottom: "8px" }}>
//             {totalProducts}
//           </div>
//           <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
//             All Products
//           </div>
//         </div>

//         {/* Active Products */}
//         <div
//           onClick={() => setActiveFilter("active")}
//           style={{
//             backgroundColor: activeFilter === "active" ? appTheme.colors.success + "15" : appTheme.colors.surface,
//             padding: "20px",
//             borderRadius: "16px",
//             boxShadow: appTheme.shadows.sm,
//             border: `2px solid ${activeFilter === "active" ? appTheme.colors.success : appTheme.colors.border}`,
//             textAlign: "center",
//             cursor: "pointer",
//             transition: "all 0.2s ease",
//           }}
//         >
//           <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.success, marginBottom: "8px" }}>
//             {activeProducts}
//           </div>
//           <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
//             Active
//           </div>
//         </div>

//         {/* Low Stock */}
//         <div
//           onClick={() => setActiveFilter("low")}
//           style={{
//             backgroundColor: activeFilter === "low" ? appTheme.colors.warning + "15" : appTheme.colors.surface,
//             padding: "20px",
//             borderRadius: "16px",
//             boxShadow: appTheme.shadows.sm,
//             border: `2px solid ${activeFilter === "low" ? appTheme.colors.warning : appTheme.colors.border}`,
//             textAlign: "center",
//             cursor: "pointer",
//             transition: "all 0.2s ease",
//           }}
//         >
//           <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.warning, marginBottom: "8px" }}>
//             {lowStockProducts}
//           </div>
//           <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
//             Low Stock
//           </div>
//           <div style={{ fontSize: "0.75rem", color: appTheme.colors.warning, fontWeight: "500", marginTop: "4px" }}>
//             (Stock &lt; 5)
//           </div>
//         </div>

//         {/* Out of Stock */}
//         <div
//           onClick={() => setActiveFilter("out")}
//           style={{
//             backgroundColor: activeFilter === "out" ? appTheme.colors.error + "15" : appTheme.colors.surface,
//             padding: "20px",
//             borderRadius: "16px",
//             boxShadow: appTheme.shadows.sm,
//             border: `2px solid ${activeFilter === "out" ? appTheme.colors.error : appTheme.colors.border}`,
//             textAlign: "center",
//             cursor: "pointer",
//             transition: "all 0.2s ease",
//           }}
//         >
//           <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.error, marginBottom: "8px" }}>
//             {outOfStockProducts}
//           </div>
//           <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
//             Out of Stock
//           </div>
//         </div>
//       </div>

//       {/* Filter Info */}
//       {activeFilter !== "all" && (
//         <div style={{ 
//           backgroundColor: appTheme.colors.surface, 
//           padding: "16px 20px", 
//           borderRadius: "12px", 
//           marginBottom: "20px", 
//           border: `1px solid ${appTheme.colors.border}`, 
//           display: "flex", 
//           justifyContent: "space-between", 
//           alignItems: "center" 
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//             <span style={{ 
//               fontSize: "1rem", 
//               fontWeight: "600", 
//               color: appTheme.colors.textPrimary 
//             }}>
//               {activeFilter === "active" ? "🟢 Active Products" :
//                activeFilter === "low" ? "🟡 Low Stock Products" :
//                activeFilter === "out" ? "🔴 Out of Stock Products" :
//                "All Products"}
//             </span>
//             <span style={{ 
//               fontSize: "0.875rem", 
//               color: appTheme.colors.textSecondary,
//               backgroundColor: appTheme.colors.background,
//               padding: "4px 8px",
//               borderRadius: "8px",
//               fontWeight: "500"
//             }}>
//               {filteredProducts.length} products
//             </span>
//           </div>
//           <button
//             onClick={() => setActiveFilter("all")}
//             style={{
//               backgroundColor: "transparent",
//               color: appTheme.colors.primary,
//               border: `1px solid ${appTheme.colors.primary}`,
//               padding: "8px 16px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "0.875rem",
//               fontWeight: "500",
//               transition: "all 0.2s ease"
//             }}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = appTheme.colors.primary;
//               e.target.style.color = "#fff";
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = "transparent";
//               e.target.style.color = appTheme.colors.primary;
//             }}
//           >
//             Show All Products
//           </button>
//         </div>
//       )}

//       {/* DataTable Component */}
//       <div style={{ 
//         backgroundColor: appTheme.colors.surface, 
//         padding: "24px", 
//         borderRadius: "16px", 
//         boxShadow: appTheme.shadows.md,
//         border: `1px solid ${appTheme.colors.border}`
//       }}>
//         {loading ? (
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "center", 
//             alignItems: "center", 
//             padding: "60px",
//             color: appTheme.colors.textSecondary
//           }}>
//             <div style={{ textAlign: "center" }}>
//               <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
//               <div style={{ fontWeight: "600" }}>Loading products...</div>
//             </div>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "center", 
//             alignItems: "center", 
//             padding: "60px",
//             color: appTheme.colors.textSecondary,
//             textAlign: "center"
//           }}>
//             <div>
//               <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
//               <div style={{ fontWeight: "600", fontSize: "1.125rem", marginBottom: "8px" }}>
//                 {searchTerm ? "No products found" : "No products available"}
//               </div>
//               <div style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
//                 {searchTerm ? `No products match "${searchTerm}"` : "Get started by adding your first product"}
//               </div>
//               {!searchTerm && (
//                 <Link href="/admin/products/productForm">
//                   <button
//                     style={{
//                       backgroundColor: appTheme.colors.primary,
//                       color: "#fff",
//                       padding: "12px 24px",
//                       border: "none",
//                       borderRadius: "8px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: "0.875rem"
//                     }}
//                   >
//                     Add Your First Product
//                   </button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         ) : (
//           <DataTable
//             title={`Product Inventory ${activeFilter !== "all" ? `- ${activeFilter === "active" ? "Active" : activeFilter === "low" ? "Low Stock" : "Out of Stock"}` : ""}`}
//             columns={columns}
//             data={filteredProducts}
//             onEdit={handleEdit}
//             onDelete={handleDelete}
//             loading={loading}
//             searchable={false} // We have our own search
//             pagination={true}
//             exportable={true}
//             itemsPerPage={10}
//           />
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appTheme } from "../../../src/constants/theme";
import { DataTable } from "../../../src/components/table";
import { FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

// Mobile Card Component
const MobileProductCard = ({ product, onEdit, onDelete, onToggleStatus, appTheme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      backgroundColor: appTheme.colors.surface,
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: `1px solid ${appTheme.colors.border}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      position: "relative",
    }}>
      {/* Product Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Product Image */}
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: appTheme.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${appTheme.colors.border}`,
        }}>
          {product.imageUrls?.[0] ? (
            <img 
              src={product.imageUrls[0]} 
              alt={product.productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!product.imageUrls?.[0] && (
            <div style={{
              color: appTheme.colors.textSecondary,
              fontSize: "0.7rem",
              fontWeight: "600",
              textAlign: "center"
            }}>
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            marginBottom: "6px" 
          }}>
            <h3 style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: "8px"
            }}>
              {product.productName}
            </h3>
            <span style={{
              backgroundColor: product.isActive ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
              color: product.isActive ? appTheme.colors.success : appTheme.colors.textSecondary,
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "0.7rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            marginBottom: "6px",
            flexWrap: "wrap" 
          }}>
            <span style={{
              backgroundColor: appTheme.colors.primary + "15",
              color: appTheme.colors.primary,
              padding: "2px 8px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: "500",
              border: `1px solid ${appTheme.colors.primary}20`
            }}>
              {product.category || "Uncategorized"}
            </span>
            
            <span style={{
              fontWeight: "700",
              color: appTheme.colors.primary,
              fontSize: "0.85rem"
            }}>
              ₹{parseFloat(product.price || 0).toFixed(2)}
            </span>
          </div>

          {/* Stock and Actions */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                color: product.stock > 10 ? appTheme.colors.success : 
                       product.stock > 0 ? appTheme.colors.warning : 
                       appTheme.colors.error,
                fontWeight: "600",
                fontSize: "0.85rem",
              }}>
                Stock: {product.stock || 0}
              </span>
              {product.stock <= 10 && product.stock > 0 && product.isActive && (
                <span style={{
                  fontSize: "0.7rem",
                  color: appTheme.colors.warning,
                  fontWeight: "500",
                  backgroundColor: appTheme.colors.warning + "15",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}>
                  Low
                </span>
              )}
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: "none",
                border: "none",
                color: appTheme.colors.primary,
                cursor: "pointer",
                fontSize: "0.8rem",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: "500"
              }}
            >
              {isExpanded ? "Less" : "More"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: `1px solid ${appTheme.colors.border}`,
          animation: "slideDown 0.3s ease"
        }}>
          {/* Description */}
          {product.description && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: "4px"
              }}>
                Description:
              </div>
              <div style={{
                fontSize: "0.8rem",
                color: appTheme.colors.textPrimary,
                lineHeight: 1.4,
                maxHeight: "60px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical"
              }}>
                {product.description}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            marginBottom: "12px"
          }}>
            <div>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px"
              }}>
                Product ID:
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "500",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {product._id?.substring(18) || "N/A"}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px"
              }}>
                Updated:
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "500"
              }}>
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }) : "N/A"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => onEdit(product)}
              style={{
                flex: 1,
                backgroundColor: appTheme.colors.primary + "15",
                color: appTheme.colors.primary,
                border: `1px solid ${appTheme.colors.primary}30`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minHeight: "36px"
              }}
            >
              <FaEdit size={12} />
              Edit
            </button>
            
            <button
              onClick={() => onToggleStatus(product)}
              style={{
                flex: 1,
                backgroundColor: product.isActive ? appTheme.colors.warning + "15" : appTheme.colors.success + "15",
                color: product.isActive ? appTheme.colors.warning : appTheme.colors.success,
                border: `1px solid ${product.isActive ? appTheme.colors.warning + "30" : appTheme.colors.success + "30"}`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minHeight: "36px"
              }}
            >
              {product.isActive ? <FaToggleOff size={12} /> : <FaToggleOn size={12} />}
              {product.isActive ? "Deactivate" : "Activate"}
            </button>
            
            <button
              onClick={() => onDelete(product)}
              style={{
                flex: 1,
                backgroundColor: appTheme.colors.error + "15",
                color: appTheme.colors.error,
                border: `1px solid ${appTheme.colors.error}30`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minHeight: "36px"
              }}
            >
              <FaTrash size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductTablePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data || []);
        setFilteredProducts(data.data || []);
      } else {
        console.error("API Error:", data.message);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    switch (activeFilter) {
      case "low":
        filtered = filtered.filter(product => product.stock < 5 && product.stock > 0);
        break;
      case "out":
        filtered = filtered.filter(product => product.stock === 0);
        break;
      case "active":
        filtered = filtered.filter(product => product.isActive === true);
        break;
      case "inactive":
        filtered = filtered.filter(product => product.isActive === false);
        break;
      default:
        break;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.productName?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [activeFilter, searchTerm, products]);

  // Edit handler
  const handleEdit = (product) => {
    router.push(`/admin/products/productForm?id=${product._id}`);
  };

  // Delete handler
  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.productName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/products?id=${product._id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`"${product.productName}" has been deleted successfully.`);
        fetchProducts();
      } else {
        alert(`Failed to delete product: ${data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  // Toggle product status
  const handleToggleStatus = async (product) => {
    const newStatus = !product.isActive;
    const action = newStatus ? "activate" : "deactivate";
    
    if (!confirm(`Are you sure you want to ${action} "${product.productName}"?`)) return;

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: product._id,
          isActive: newStatus
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Product ${action}d successfully.`);
        fetchProducts();
      } else {
        alert(`Failed to ${action} product: ${data.message}`);
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      alert(`Failed to ${action} product. Please try again.`);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(product => product.isActive === true).length;
  const inactiveProducts = products.filter(product => product.isActive === false).length;
  const lowStockProducts = products.filter(product => product.stock < 5 && product.stock > 0 && product.isActive).length;
  const outOfStockProducts = products.filter(product => product.stock === 0 && product.isActive).length;

  // Columns for desktop table
  const columns = [
    { 
      header: "Product Info", 
      accessor: "productName",
      cell: (value, row) => (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          minWidth: "0"
        }}>
          {row.imageUrls?.[0] && (
            <img 
              src={row.imageUrls[0]} 
              alt={value}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "6px",
                objectFit: "cover",
                border: `1px solid ${appTheme.colors.border}`,
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontWeight: "600", 
              fontSize: "0.875rem", 
              marginBottom: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {value}
            </div>
            <div style={{ 
              fontSize: "0.75rem", 
              color: appTheme.colors.textSecondary,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              ID: {row._id?.substring(18) || "N/A"}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Category", 
      accessor: "category",
      cell: (value) => (
        <span style={{
          backgroundColor: appTheme.colors.primary + "15",
          color: appTheme.colors.primary,
          padding: "4px 8px",
          borderRadius: "10px",
          fontSize: "0.75rem",
          fontWeight: "500",
          border: `1px solid ${appTheme.colors.primary}20`,
          display: "inline-block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {value || "Uncategorized"}
        </span>
      )
    },
    { 
      header: "Price", 
      accessor: "price",
      cell: (value) => (
        <span style={{ 
          fontWeight: "700", 
          color: appTheme.colors.primary,
          fontSize: "0.875rem",
          whiteSpace: "nowrap"
        }}>
          ₹{parseFloat(value).toFixed(2)}
        </span>
      )
    },
    { 
      header: "Stock", 
      accessor: "stock",
      cell: (value, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "60px" }}>
          <span style={{
            color: value > 10 ? appTheme.colors.success : 
                   value > 0 ? appTheme.colors.warning : 
                   appTheme.colors.error,
            fontWeight: "600",
            fontSize: "0.875rem",
          }}>
            {value} units
          </span>
          {value <= 10 && value > 0 && row.isActive && (
            <span style={{
              fontSize: "0.7rem",
              color: appTheme.colors.warning,
              fontWeight: "500",
              whiteSpace: "nowrap"
            }}>
              Low Stock
            </span>
          )}
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: "isActive",
      cell: (value) => (
        <span style={{
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "600",
          backgroundColor: value ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
          color: value ? appTheme.colors.success : appTheme.colors.textSecondary,
          border: `1px solid ${value ? appTheme.colors.success + "40" : appTheme.colors.textSecondary + "40"}`,
          whiteSpace: "nowrap",
          display: "inline-block"
        }}>
          {value ? "🟢 Active" : "⚫ Inactive"}
        </span>
      )
    },
  ];

  return (
    <div
      style={{
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        padding: isMobile ? "12px" : "24px",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box"
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? "16px" : "24px",
          gap: isMobile ? "12px" : "16px",
          width: "100%"
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              color: appTheme.colors.primary,
              fontSize: isMobile ? "1.3rem" : "1.8rem",
              fontWeight: "700",
              marginBottom: "4px",
              lineHeight: 1.2
            }}
          >
            Products Management
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: isMobile ? "0.8rem" : "0.875rem",
            margin: 0
          }}>
            Manage your product inventory and stock levels
          </p>
        </div>
        <Link 
          href="/admin/products/productForm" 
          style={{ 
            width: isMobile ? "100%" : "auto",
            textDecoration: "none",
            display: "block"
          }}
        >
          <button
            style={{
              backgroundColor: appTheme.colors.primary,
              color: "#fff",
              padding: isMobile ? "10px 16px" : "12px 20px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              boxShadow: `0 4px 12px ${appTheme.colors.primary}30`,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              minHeight: "44px"
            }}
          >
            <FaPlus size={isMobile ? 14 : 16} />
            {isMobile ? "Add Product" : "Add New Product"}
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: isMobile ? "16px" : "24px",
        position: "relative",
        width: "100%"
      }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder={isMobile ? "Search products..." : "Search products by name, category, or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: isMobile ? "10px 14px 10px 40px" : "12px 16px 12px 44px",
              border: `1px solid ${appTheme.colors.border}`,
              borderRadius: "10px",
              fontSize: isMobile ? "0.9rem" : "0.95rem",
              backgroundColor: appTheme.colors.surface,
              color: appTheme.colors.textPrimary,
              outline: "none",
              minHeight: "44px",
              boxSizing: "border-box"
            }}
          />
          <FaSearch 
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: appTheme.colors.textSecondary
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: appTheme.colors.textSecondary,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stock Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(150px, 1fr))",
          gap: isMobile ? "10px" : "16px",
          marginBottom: isMobile ? "16px" : "24px",
          width: "100%"
        }}
      >
        {[
          { label: "All Products", value: totalProducts, filter: "all", color: appTheme.colors.primary },
          { label: "Active", value: activeProducts, filter: "active", color: appTheme.colors.success },
          { label: "Low Stock", value: lowStockProducts, filter: "low", color: appTheme.colors.warning },
          { label: "Out of Stock", value: outOfStockProducts, filter: "out", color: appTheme.colors.error },
        ].map((stat) => (
          <div
            key={stat.filter}
            onClick={() => setActiveFilter(stat.filter)}
            style={{
              backgroundColor: activeFilter === stat.filter ? stat.color + "15" : appTheme.colors.surface,
              padding: isMobile ? "14px 10px" : "16px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              border: `2px solid ${activeFilter === stat.filter ? stat.color : appTheme.colors.border}`,
              textAlign: "center",
              cursor: "pointer",
              minHeight: "70px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div style={{ 
              fontSize: isMobile ? "1.4rem" : "1.6rem", 
              fontWeight: "700", 
              color: stat.color, 
              marginBottom: "4px",
              lineHeight: 1
            }}>
              {stat.value}
            </div>
            <div style={{ 
              fontSize: isMobile ? "0.75rem" : "0.8rem", 
              color: appTheme.colors.textSecondary, 
              fontWeight: "600",
              lineHeight: 1.2
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Active Filter Info */}
      {activeFilter !== "all" && (
        <div style={{ 
          backgroundColor: appTheme.colors.surface, 
          padding: "12px 16px", 
          borderRadius: "10px", 
          marginBottom: "16px", 
          border: `1px solid ${appTheme.colors.border}`, 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "10px" : "0",
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "6px" : "8px",
            flexWrap: "wrap" 
          }}>
            <span style={{ 
              fontSize: isMobile ? "0.9rem" : "1rem", 
              fontWeight: "600", 
              color: appTheme.colors.textPrimary 
            }}>
              {activeFilter === "active" ? "Active Products" :
               activeFilter === "low" ? "Low Stock Products" :
               "Out of Stock Products"}
            </span>
            <span style={{ 
              fontSize: "0.75rem", 
              color: appTheme.colors.textSecondary,
              backgroundColor: appTheme.colors.background,
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "500",
              whiteSpace: "nowrap"
            }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              backgroundColor: "transparent",
              color: appTheme.colors.primary,
              border: `1px solid ${appTheme.colors.primary}`,
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              minHeight: "36px",
              width: isMobile ? "100%" : "auto"
            }}
          >
            {isMobile ? "Show All" : "Show All Products"}
          </button>
        </div>
      )}

      {/* Products Content */}
      <div style={{ 
        backgroundColor: appTheme.colors.surface, 
        padding: isMobile ? "8px" : "24px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${appTheme.colors.border}`,
        width: "100%",
        boxSizing: "border-box"
      }}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{ 
              width: "50px", 
              height: "50px", 
              border: `3px solid ${appTheme.colors.border}`,
              borderTop: `3px solid ${appTheme.colors.primary}`,
              borderRadius: "50%",
              marginBottom: "16px",
              animation: "spin 1s linear infinite"
            }} />
            <div style={{ 
              fontWeight: "600",
              fontSize: isMobile ? "0.9rem" : "1rem",
              color: appTheme.colors.textPrimary,
              marginBottom: "4px"
            }}>
              Loading products...
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{ 
              fontSize: isMobile ? "3rem" : "4rem", 
              marginBottom: isMobile ? "16px" : "20px",
              color: appTheme.colors.border
            }}>📦</div>
            <div style={{ 
              fontWeight: "600", 
              fontSize: isMobile ? "1rem" : "1.1rem", 
              marginBottom: "8px",
              color: appTheme.colors.textPrimary
            }}>
              {searchTerm ? "No products found" : "No products available"}
            </div>
            <div style={{ 
              fontSize: isMobile ? "0.85rem" : "0.9rem", 
              marginBottom: isMobile ? "16px" : "20px",
              maxWidth: "400px",
              lineHeight: 1.5,
              color: appTheme.colors.textSecondary
            }}>
              {searchTerm ? `No products match "${searchTerm}"` : "Get started by adding your first product"}
            </div>
            {!searchTerm && (
              <Link href="/admin/products/productForm" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    backgroundColor: appTheme.colors.primary,
                    color: "#fff",
                    padding: isMobile ? "10px 20px" : "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: isMobile ? "0.85rem" : "0.875rem",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <FaPlus size={14} />
                  Add Your First Product
                </button>
              </Link>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${appTheme.colors.border}`
            }}>
              Products ({filteredProducts.length})
            </h3>
            <div>
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  appTheme={appTheme}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop Table View
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "8px"
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: appTheme.colors.textPrimary,
                margin: 0
              }}>
                {`Product Inventory ${activeFilter !== "all" ? `- ${activeFilter === "active" ? "Active" : activeFilter === "low" ? "Low Stock" : "Out of Stock"}` : ""}`}
              </h3>
              <div style={{
                fontSize: "0.8rem",
                color: appTheme.colors.textSecondary,
                backgroundColor: appTheme.colors.background,
                padding: "4px 10px",
                borderRadius: "8px",
                fontWeight: "500"
              }}>
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
            <DataTable
              title=""
              columns={columns}
              data={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              loading={loading}
              searchable={false}
              pagination={true}
              exportable={true}
              itemsPerPage={10}
              isMobile={false}
            />
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 767px) {
          body {
            overflow-x: hidden;
          }
          
          * {
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}