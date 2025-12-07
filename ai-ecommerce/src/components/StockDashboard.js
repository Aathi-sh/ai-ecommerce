"use client";

import React, { useEffect, useState } from "react";
import { appTheme } from "@/constants/theme";

export default function StockDashboard() {
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      // Fetch all products
      const res = await fetch("/api/products");
      const data = await res.json();
      
      if (data.success) {
        const products = data.data || [];
        
        // Calculate statistics
        const stats = {
          totalProducts: products.length,
          inStock: products.filter(p => p.stock > 0).length,
          lowStock: products.filter(p => p.stock <= 5 && p.stock > 0).length,
          outOfStock: products.filter(p => p.stock === 0).length,
          totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        };
        
        setStockStats(stats);
        
        // Get low stock products
        const lowStock = products
          .filter(p => p.stock <= 5 && p.stock > 0)
          .sort((a, b) => a.stock - b.stock);
        setLowStockProducts(lowStock);
        
        // Get out of stock products
        const outOfStock = products
          .filter(p => p.stock === 0)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setOutOfStockProducts(outOfStock);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStockData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestock = async (productId, quantity = 10) => {
    try {
      const res = await fetch(`/api/products?id=${productId}&action=restock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Product restocked successfully! Added ${quantity} units.`);
        fetchStockData(); // Refresh data
      } else {
        alert(`Failed to restock: ${data.message}`);
      }
    } catch (error) {
      console.error("Restock error:", error);
      alert("Failed to restock product");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
        <p>Loading stock dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Stock Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
          color: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", opacity: 0.9 }}>TOTAL PRODUCTS</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stockStats.totalProducts}</div>
        </div>
        
        <div style={{
          background: appTheme.colors.success,
          color: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", opacity: 0.9 }}>IN STOCK</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stockStats.inStock}</div>
        </div>
        
        <div style={{
          background: appTheme.colors.warning,
          color: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", opacity: 0.9 }}>LOW STOCK</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stockStats.lowStock}</div>
        </div>
        
        <div style={{
          background: appTheme.colors.error,
          color: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", opacity: 0.9 }}>OUT OF STOCK</h3>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stockStats.outOfStock}</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ 
          background: `${appTheme.colors.warning}15`, 
          border: `1px solid ${appTheme.colors.warning}30`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px"
        }}>
          <h3 style={{ 
            color: appTheme.colors.warning, 
            margin: "0 0 15px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            ⚠️ Low Stock Alert ({lowStockProducts.length} products)
          </h3>
          
          <div style={{ display: "grid", gap: "10px" }}>
            {lowStockProducts.slice(0, 5).map(product => (
              <div key={product._id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "white",
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}`
              }}>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>{product.productName}</div>
                  <div style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>
                    Current Stock: <strong style={{ color: appTheme.colors.warning }}>{product.stock} units</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleRestock(product._id, 10)}
                  style={{
                    background: appTheme.colors.warning,
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  Restock +10
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <div style={{ 
          background: `${appTheme.colors.error}10`, 
          border: `1px solid ${appTheme.colors.error}20`,
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ 
            color: appTheme.colors.error, 
            margin: "0 0 15px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            🔴 Out of Stock ({outOfStockProducts.length} products)
          </h3>
          
          <div style={{ display: "grid", gap: "10px" }}>
            {outOfStockProducts.slice(0, 5).map(product => (
              <div key={product._id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "white",
                borderRadius: "8px",
                border: `1px solid ${appTheme.colors.border}`
              }}>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>{product.productName}</div>
                  <div style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>
                    Price: ₹{product.price} • Last updated: {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRestock(product._id, 20)}
                  style={{
                    background: appTheme.colors.error,
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  Restock +20
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}