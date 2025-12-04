"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appTheme } from "../constants/theme";
import { FiHome, FiShoppingCart, FiUsers, FiBox, FiLogOut } from "react-icons/fi";


export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname(); // current path
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const menuItems = [
     { label: "QR Code", icon: <FiHome />, path: "/admin/qr" },
    { label: "Dashboard", icon: <FiHome />, path: "/admin/dashboards" },
    { label: " Add New Products", icon: <FiBox />, path: "/admin/products/productForm" },
    {label:"Products ",icon:<FiBox />,path:"/admin/products"},
    { label: "Orders", icon: <FiShoppingCart />, path: "/admin/orders" },
    { label: "Create your own orders", icon: <FiUsers />, path: "/admin/orders/orderForm" },
    { label: "Transactions", icon: <FiUsers />, path: "/admin/transactions" },
    { label: "Logout", icon: <FiLogOut />, path: "/login" },
  ];

  return (
    <div
      style={{
        width: isCollapsed ? "80px" : "240px",
        backgroundColor: appTheme.colors.surface,
        color: appTheme.colors.textPrimary,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        boxShadow: appTheme.shadows.md,
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: "20px",
          fontWeight: "bold",
          fontSize: "1.2rem",
          color: appTheme.colors.primary,
          borderBottom: `1px solid ${appTheme.colors.border}`,
        }}
      >
        {isCollapsed ? "AI" : "Step On Next"}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          margin: "10px auto",
          padding: "6px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: appTheme.colors.primary,
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {isCollapsed ? "➡️" : "⬅️"}
      </button>

      {/* Menu Items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", padding: "10px" }}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: isActive ? appTheme.colors.primary : "transparent",
                color: isActive ? "#fff" : appTheme.colors.textPrimary,
                fontWeight: isActive ? "600" : "400",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Optional */}
      <div style={{ padding: "20px", borderTop: `1px solid ${appTheme.colors.border}` }}>
        {!isCollapsed && <small style={{ color: appTheme.colors.textSecondary }}>© 2025 Step On Next</small>}
      </div>
    </div>
  );
}