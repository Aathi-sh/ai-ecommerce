"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appTheme } from "../../../src/constants/theme";
import { DataTable } from "../../../src/components/table";

export default function ProductTablePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

    // Apply stock filter
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
        // "all" - no additional filtering
        break;
    }

    // Apply search filter
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
    console.log("Edit product:", product);
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
        fetchProducts(); // Refresh the list
      } else {
        alert(`Failed to delete product: ${data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  // Toggle product status (active/inactive)
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
        fetchProducts(); // Refresh the list
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

  // Define columns for your DataTable component
  const columns = [
    { 
      header: "Product Info", 
      accessor: "productName",
      cell: (value, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {row.imageUrls?.[0] && (
            <img 
              src={row.imageUrls[0]} 
              alt={value}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                objectFit: "cover",
                border: `1px solid ${appTheme.colors.border}`
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "2px" }}>
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
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "500",
          border: `1px solid ${appTheme.colors.primary}20`
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
          fontSize: "0.875rem"
        }}>
          ₹{parseFloat(value).toFixed(2)}
        </span>
      )
    },
    { 
      header: "Stock", 
      accessor: "stock",
      cell: (value, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
              fontWeight: "500"
            }}>
              Low Stock
            </span>
          )}
          {value === 0 && row.isActive && (
            <span style={{
              fontSize: "0.7rem",
              color: appTheme.colors.error,
              fontWeight: "500"
            }}>
              Out of Stock
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
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: "600",
          backgroundColor: value ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
          color: value ? appTheme.colors.success : appTheme.colors.textSecondary,
          border: `1px solid ${value ? appTheme.colors.success + "40" : appTheme.colors.textSecondary + "40"}`,
        }}>
          {value ? "🟢 Active" : "⚫ Inactive"}
        </span>
      )
    },
    { 
      header: "Last Updated", 
      accessor: "updatedAt",
      cell: (value) => (
        <span style={{
          fontSize: "0.75rem",
          color: appTheme.colors.textSecondary,
        }}>
          {value ? new Date(value).toLocaleDateString() : "N/A"}
        </span>
      )
    },
  ];

  return (
    <div
      style={{
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        padding: "32px",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h1
            style={{
              color: appTheme.colors.primary,
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            Products Management
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "0.875rem",
            margin: 0
          }}>
            Manage your product inventory and stock levels
          </p>
        </div>
        <Link href="/admin/products/productForm">
          <button
            style={{
              backgroundColor: appTheme.colors.primary,
              color: "#fff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem",
              boxShadow: `0 4px 12px ${appTheme.colors.primary}30`,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <span style={{ fontSize: "1.2rem" }}>+</span>
            Add New Product
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          position: "relative",
          maxWidth: "400px"
        }}>
          <input
            type="text"
            placeholder="Search products by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              border: `1px solid ${appTheme.colors.border}`,
              borderRadius: "12px",
              fontSize: "0.875rem",
              backgroundColor: appTheme.colors.surface,
              color: appTheme.colors.textPrimary,
              outline: "none",
              transition: "all 0.2s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = appTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = appTheme.colors.border;
              e.target.style.boxShadow = "none";
            }}
          />
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: appTheme.colors.textSecondary,
            fontSize: "1rem"
          }}>
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: appTheme.colors.textSecondary,
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stock Statistics with Filter Functionality */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* All Products */}
        <div
          onClick={() => setActiveFilter("all")}
          style={{
            backgroundColor: activeFilter === "all" ? appTheme.colors.primary + "15" : appTheme.colors.surface,
            padding: "20px",
            borderRadius: "16px",
            boxShadow: appTheme.shadows.sm,
            border: `2px solid ${activeFilter === "all" ? appTheme.colors.primary : appTheme.colors.border}`,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.primary, marginBottom: "8px" }}>
            {totalProducts}
          </div>
          <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
            All Products
          </div>
        </div>

        {/* Active Products */}
        <div
          onClick={() => setActiveFilter("active")}
          style={{
            backgroundColor: activeFilter === "active" ? appTheme.colors.success + "15" : appTheme.colors.surface,
            padding: "20px",
            borderRadius: "16px",
            boxShadow: appTheme.shadows.sm,
            border: `2px solid ${activeFilter === "active" ? appTheme.colors.success : appTheme.colors.border}`,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.success, marginBottom: "8px" }}>
            {activeProducts}
          </div>
          <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
            Active
          </div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setActiveFilter("low")}
          style={{
            backgroundColor: activeFilter === "low" ? appTheme.colors.warning + "15" : appTheme.colors.surface,
            padding: "20px",
            borderRadius: "16px",
            boxShadow: appTheme.shadows.sm,
            border: `2px solid ${activeFilter === "low" ? appTheme.colors.warning : appTheme.colors.border}`,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.warning, marginBottom: "8px" }}>
            {lowStockProducts}
          </div>
          <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
            Low Stock
          </div>
          <div style={{ fontSize: "0.75rem", color: appTheme.colors.warning, fontWeight: "500", marginTop: "4px" }}>
            (Stock &lt; 5)
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setActiveFilter("out")}
          style={{
            backgroundColor: activeFilter === "out" ? appTheme.colors.error + "15" : appTheme.colors.surface,
            padding: "20px",
            borderRadius: "16px",
            boxShadow: appTheme.shadows.sm,
            border: `2px solid ${activeFilter === "out" ? appTheme.colors.error : appTheme.colors.border}`,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "700", color: appTheme.colors.error, marginBottom: "8px" }}>
            {outOfStockProducts}
          </div>
          <div style={{ fontSize: "0.875rem", color: appTheme.colors.textSecondary, fontWeight: "600" }}>
            Out of Stock
          </div>
        </div>
      </div>

      {/* Filter Info */}
      {activeFilter !== "all" && (
        <div style={{ 
          backgroundColor: appTheme.colors.surface, 
          padding: "16px 20px", 
          borderRadius: "12px", 
          marginBottom: "20px", 
          border: `1px solid ${appTheme.colors.border}`, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ 
              fontSize: "1rem", 
              fontWeight: "600", 
              color: appTheme.colors.textPrimary 
            }}>
              {activeFilter === "active" ? "🟢 Active Products" :
               activeFilter === "low" ? "🟡 Low Stock Products" :
               activeFilter === "out" ? "🔴 Out of Stock Products" :
               "All Products"}
            </span>
            <span style={{ 
              fontSize: "0.875rem", 
              color: appTheme.colors.textSecondary,
              backgroundColor: appTheme.colors.background,
              padding: "4px 8px",
              borderRadius: "8px",
              fontWeight: "500"
            }}>
              {filteredProducts.length} products
            </span>
          </div>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              backgroundColor: "transparent",
              color: appTheme.colors.primary,
              border: `1px solid ${appTheme.colors.primary}`,
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = appTheme.colors.primary;
              e.target.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = appTheme.colors.primary;
            }}
          >
            Show All Products
          </button>
        </div>
      )}

      {/* DataTable Component */}
      <div style={{ 
        backgroundColor: appTheme.colors.surface, 
        padding: "24px", 
        borderRadius: "16px", 
        boxShadow: appTheme.shadows.md,
        border: `1px solid ${appTheme.colors.border}`
      }}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px",
            color: appTheme.colors.textSecondary
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
              <div style={{ fontWeight: "600" }}>Loading products...</div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px",
            color: appTheme.colors.textSecondary,
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
              <div style={{ fontWeight: "600", fontSize: "1.125rem", marginBottom: "8px" }}>
                {searchTerm ? "No products found" : "No products available"}
              </div>
              <div style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
                {searchTerm ? `No products match "${searchTerm}"` : "Get started by adding your first product"}
              </div>
              {!searchTerm && (
                <Link href="/admin/products/productForm">
                  <button
                    style={{
                      backgroundColor: appTheme.colors.primary,
                      color: "#fff",
                      padding: "12px 24px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.875rem"
                    }}
                  >
                    Add Your First Product
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <DataTable
            title={`Product Inventory ${activeFilter !== "all" ? `- ${activeFilter === "active" ? "Active" : activeFilter === "low" ? "Low Stock" : "Out of Stock"}` : ""}`}
            columns={columns}
            data={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            searchable={false} // We have our own search
            pagination={true}
            exportable={true}
            itemsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}








// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { appTheme } from "../../../src/constants/theme";
// import { DataTable } from "../../../src/components/table";

// export default function ProductTablePage() {
//   const router = useRouter();
//   const [products, setProducts] = useState([]);

//   // Fetch all products
//   const fetchProducts = async () => {
//     try {
//       const res = await fetch("/api/products");
//       const data = await res.json();
//       if (data.success) setProducts(data.data);
//     } catch (err) {
//       console.error("Error fetching products:", err);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // Delete handler
//   const handleDelete = async (product) => {
//     if (!confirm(`Are you sure you want to delete "${product.productName}"?`)) return;

//     try {
//       const res = await fetch(`/api/products?id=${product._id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       alert(data.message);
//       fetchProducts();
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete product");
//     }
//   };

//   const columns = [
//     { header: "Name", accessor: "productName" },
//     { header: "Category", accessor: "category" },
//     { header: "Price", accessor: "price" },
//     { header: "Stock", accessor: "stock" },
//   ];

//   return (
//     <div
//       style={{
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         padding: "40px",
//         fontFamily: appTheme.fonts.primary,
//         color: appTheme.colors.textPrimary,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "30px",
//         }}
//       >
//         <h1
//           style={{
//             color: appTheme.colors.primary,
//             fontSize: "2rem",
//             fontWeight: "600",
//           }}
//         >
//           Products Table
//         </h1>
//         <Link href="/admin/products/productForm">
//           <button
//             style={{
//               backgroundColor: appTheme.colors.primary,
//               color: "#fff",
//               padding: "12px 20px",
//               border: "none",
//               borderRadius: appTheme.radius.lg,
//               cursor: "pointer",
//               fontWeight: "500",
//               boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//               transition: "all 0.2s ease",
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.backgroundColor = "#0056b3")
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.backgroundColor = appTheme.colors.primary)
//             }
//           >
//             + Add Product
//           </button>
//         </Link>
//       </div>

//       <div
//         style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: "20px",
//           borderRadius: appTheme.radius.lg,
//           boxShadow: appTheme.shadows.md,
//         }}
//       >
//         <DataTable
//           title="Product List"
//           columns={columns}
//           data={products}
//           onEdit={(product) =>
//             router.push(`/admin/products/productForm?id=${product._id}`)
//           }
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }
