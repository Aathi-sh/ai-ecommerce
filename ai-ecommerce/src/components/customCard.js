"use client";

import React from "react";
import { appTheme } from "../constants/theme";

export default function CustomCard({ order, onDelete, onUpdateField }) {
  return (
    <div
      style={{
        backgroundColor: appTheme.colors.surface,
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        border: `1.5px solid ${appTheme.colors.border}30`,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.08)";
      }}
    >
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "15px",
        borderBottom: `1.5px solid ${appTheme.colors.border}30`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "4px",
            height: "24px",
            background: `linear-gradient(135deg, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`,
            borderRadius: "2px",
          }}></div>
          <div>
            <strong style={{ 
              fontSize: "1.2rem", 
              color: appTheme.colors.textPrimary,
              display: "block",
              marginBottom: "4px"
            }}>
              Order #{order.orderNumber}
            </strong>
            <div style={{ 
              fontSize: "0.9rem", 
              color: appTheme.colors.textSecondary 
            }}>
              Customer: {order.customerName || order.createdBy?.name || order.createdBy?.role || "N/A"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }} className="action-buttons">
          <button
            onClick={() => onDelete(order._id)}
            style={{
              backgroundColor: "#ff4d4f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(255, 77, 79, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Customer Details */}
      <div style={{ 
        display: "grid", 
        gap: "12px",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>Customer Name:</strong>
            <span style={{ fontSize: "1rem", fontWeight: "500", marginTop: "4px" }}>
              {order.customerName || "N/A"}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>Primary Phone:</strong>
            <span style={{ fontSize: "1rem", fontWeight: "500", marginTop: "4px" }}>
              {order.phoneNumber || "N/A"}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>Secondary Phone:</strong>
            <span style={{ 
              fontSize: "1rem", 
              fontWeight: "500", 
              marginTop: "4px",
              color: order.secondaryPhoneNumber ? appTheme.colors.textPrimary : appTheme.colors.textSecondary
            }}>
              {order.secondaryPhoneNumber || "Not provided"}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong>Total Price:</strong>
            <span style={{ 
              fontSize: "1.1rem", 
              fontWeight: "600", 
              marginTop: "4px",
              color: appTheme.colors.primary
            }}>
              ₹{order.totalPrice}
            </span>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong>Shipping Address:</strong>
          <span style={{ fontSize: "0.95rem", marginTop: "4px", lineHeight: "1.4" }}>
            {order.shippingAddress}
          </span>
          <div style={{ 
            fontSize: "0.9rem", 
            color: appTheme.colors.textSecondary,
            marginTop: "2px"
          }}>
            Pincode: {order.pincode}
          </div>
        </div>

        {/* Status and Payment selectors */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "20px",
          paddingTop: "15px",
          borderTop: `1px solid ${appTheme.colors.border}20`
        }}>
          <div className="status-select" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong style={{ minWidth: "60px" }}>Status:</strong>
            <select
              value={order.status}
              onChange={(e) => onUpdateField(order._id, "status", e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${appTheme.colors.border}`,
                cursor: "pointer",
                backgroundColor: appTheme.colors.background,
                fontSize: "0.9rem",
                minWidth: "140px"
              }}
            >
              {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="status-select" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong style={{ minWidth: "60px" }}>Payment:</strong>
            <select
              value={order.paymentStatus}
              onChange={(e) => onUpdateField(order._id, "paymentStatus", e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${appTheme.colors.border}`,
                cursor: "pointer",
                backgroundColor: appTheme.colors.background,
                fontSize: "0.9rem",
                minWidth: "140px"
              }}
            >
              {["pending", "paid", "failed", "refunded"].map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ 
        paddingTop: "15px",
        borderTop: `1px solid ${appTheme.colors.border}20`
      }}>
        <strong style={{ 
          fontSize: "1.1rem", 
          display: "block",
          marginBottom: "12px" 
        }}>
          Order Items ({order.items?.length || 0}):
        </strong>
        <table style={{ 
          width: "100%", 
          marginTop: "8px", 
          borderCollapse: "collapse",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: appTheme.colors.primary, 
              color: "#fff"
            }}>
              <th style={{ padding: "12px", textAlign: "left", fontSize: "0.9rem" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "center", fontSize: "0.9rem" }}>Qty</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem" }}>Unit Price</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <tr 
                  key={item.productId?._id || item.productName || index} 
                  style={{ 
                    borderBottom: `1px solid ${appTheme.colors.border}30`,
                    backgroundColor: index % 2 === 0 ? 'transparent' : `${appTheme.colors.background}50`
                  }}
                >
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                    {item.productName || "Unnamed Product"}
                    {item.options && item.options !== 'No customization' && (
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: appTheme.colors.textSecondary,
                        marginTop: "4px"
                      }}>
                        Options: {item.options}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontSize: "0.9rem" }}>
                    {item.quantity || 0}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem" }}>
                    ₹{item.price || 0}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem", fontWeight: "500" }}>
                    ₹{(item.price || 0) * (item.quantity || 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: appTheme.colors.textSecondary }}>
                  No items in this order
                </td>
              </tr>
            )}
          </tbody>
          {order.items && order.items.length > 0 && (
            <tfoot>
              <tr style={{ 
                backgroundColor: `${appTheme.colors.background}80`,
                borderTop: `2px solid ${appTheme.colors.border}`
              }}>
                <td colSpan="3" style={{ 
                  padding: "12px", 
                  textAlign: "right", 
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                  Grand Total:
                </td>
                <td style={{ 
                  padding: "12px", 
                  textAlign: "right", 
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: appTheme.colors.primary
                }}>
                  ₹{order.totalPrice || 0}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
        
        {/* Order metadata */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          marginTop: "15px",
          paddingTop: "15px",
          borderTop: `1px solid ${appTheme.colors.border}20`,
          fontSize: "0.85rem",
          color: appTheme.colors.textSecondary
        }}>
          <div>
            <strong>Created:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
          </div>
          <div>
            <strong>Last Updated:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "N/A"}
          </div>
          <div>
            <strong>Source:</strong> {order.orderSource || "Manual"}
          </div>
        </div>
      </div>
    </div>
  );
}