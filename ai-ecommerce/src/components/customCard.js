"use client";

import React, { useState } from "react";
import { appTheme } from "../constants/theme";

export default function CustomCard({ order, onDelete, onUpdateField }) {
  const [expandedItems, setExpandedItems] = useState(false);

  // Helper function to format address safely
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    // If it's already a string
    if (typeof address === 'string') return address;
    
    // If it's an object (new schema)
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
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      packed: '#6c757d',
      shipped: '#6f42c1',
      out_for_delivery: '#fd7e14',
      delivered: '#28a745',
      cancelled: '#dc3545',
      returned: '#6c757d',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  // Helper function to get payment status color
  const getPaymentColor = (status) => {
    const colors = {
      pending: '#ffc107',
      partial: '#17a2b8',
      paid: '#28a745',
      failed: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const formattedAddress = formatAddress(order.shippingAddress);
  const displayPhone = formatPhone(order.phoneNumber);
  const displaySecondaryPhone = order.secondaryPhoneNumber ? formatPhone(order.secondaryPhoneNumber) : null;
  const totalAmount = order.totalPrice || 0;
  const paidAmount = order.paidAmount || 0;
  const balanceAmount = order.balanceAmount || (totalAmount - paidAmount);

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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ 
                fontSize: "1.2rem", 
                color: appTheme.colors.textPrimary,
                display: "block"
              }}>
                Order #{order.orderNumber}
              </strong>
              <span style={{
                backgroundColor: getStatusColor(order.status) + "20",
                color: getStatusColor(order.status),
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: "600",
                border: `1px solid ${getStatusColor(order.status)}40`
              }}>
                {order.status?.toUpperCase() || 'PENDING'}
              </span>
              <span style={{
                backgroundColor: getPaymentColor(order.paymentStatus) + "20",
                color: getPaymentColor(order.paymentStatus),
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: "600",
                border: `1px solid ${getPaymentColor(order.paymentStatus)}40`
              }}>
                {order.paymentStatus?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div style={{ 
              fontSize: "0.9rem", 
              color: appTheme.colors.textSecondary,
              marginTop: "4px"
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
            <strong style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>Customer Name:</strong>
            <span style={{ fontSize: "1rem", fontWeight: "500", marginTop: "4px" }}>
              {order.customerName || "N/A"}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>Primary Phone:</strong>
            <span style={{ fontSize: "1rem", fontWeight: "500", marginTop: "4px" }}>
              {displayPhone}
            </span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>Secondary Phone:</strong>
            <span style={{ 
              fontSize: "1rem", 
              fontWeight: "500", 
              marginTop: "4px",
              color: displaySecondaryPhone ? appTheme.colors.textPrimary : appTheme.colors.textSecondary
            }}>
              {displaySecondaryPhone || "Not provided"}
            </span>
          </div>
          
          {order.customerEmail && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>Email:</strong>
              <span style={{ fontSize: "0.95rem", marginTop: "4px" }}>
                {order.customerEmail}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong style={{ fontSize: "0.85rem", color: appTheme.colors.textSecondary }}>Shipping Address:</strong>
          <span style={{ fontSize: "0.95rem", marginTop: "4px", lineHeight: "1.5" }}>
            {formattedAddress}
          </span>
        </div>

        {/* Amount Summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          padding: "15px",
          backgroundColor: `${appTheme.colors.background}80`,
          borderRadius: "8px",
          marginTop: "10px"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Total</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: appTheme.colors.primary }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Paid</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#28a745" }}>
              {formatCurrency(paidAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Balance</div>
            <div style={{ 
              fontSize: "1.1rem", 
              fontWeight: "600", 
              color: balanceAmount > 0 ? "#ffc107" : "#28a745"
            }}>
              {formatCurrency(balanceAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>GST</div>
            <div style={{ fontSize: "1rem", fontWeight: "500", color: appTheme.colors.textSecondary }}>
              {formatCurrency(order.totalGst || 0)}
            </div>
          </div>
        </div>

        {/* Payment and Tracking Info */}
        {(order.paymentMethod || order.transactionId || order.trackingNumber) && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            padding: "10px",
            backgroundColor: `${appTheme.colors.background}40`,
            borderRadius: "8px"
          }}>
            {order.paymentMethod && (
              <div>
                <span style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Payment Method:</span>
                <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{order.paymentMethod.toUpperCase()}</div>
              </div>
            )}
            {order.transactionId && (
              <div>
                <span style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Transaction ID:</span>
                <div style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>{order.transactionId}</div>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <span style={{ fontSize: "0.75rem", color: appTheme.colors.textSecondary }}>Tracking #:</span>
                <div style={{ fontSize: "0.85rem" }}>{order.trackingNumber}</div>
              </div>
            )}
          </div>
        )}

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
              {["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map((s) => (
                <option key={s} value={s}>
                  {s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
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
              {["pending", "partial", "paid", "failed", "refunded"].map((p) => (
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
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "12px"
        }}>
          <strong style={{ fontSize: "1.1rem" }}>
            Order Items ({order.items?.length || 0}):
          </strong>
          {order.items?.length > 3 && (
            <button
              onClick={() => setExpandedItems(!expandedItems)}
              style={{
                background: "none",
                border: "none",
                color: appTheme.colors.primary,
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}
            >
              {expandedItems ? "Show Less" : "Show All"}
            </button>
          )}
        </div>

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
              <th style={{ padding: "12px", textAlign: "center", fontSize: "0.9rem" }}>SKU/HSN</th>
              <th style={{ padding: "12px", textAlign: "center", fontSize: "0.9rem" }}>Qty</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem" }}>Unit Price</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: "0.9rem" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.slice(0, expandedItems ? order.items.length : 3).map((item, index) => (
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
                  <td style={{ padding: "12px", textAlign: "center", fontSize: "0.8rem", fontFamily: "monospace" }}>
                    {item.sku ? `SKU: ${item.sku}` : item.hsnCode ? `HSN: ${item.hsnCode}` : '-'}
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
                <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: appTheme.colors.textSecondary }}>
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
                <td colSpan="4" style={{ 
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
                  {formatCurrency(order.totalPrice || 0)}
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
          {order.gstType && (
            <div>
              <strong>GST Type:</strong> {order.gstType === 'intra-state' ? 'Intra-State' : 'Inter-State'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}