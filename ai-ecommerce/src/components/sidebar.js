"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appTheme } from "../constants/theme";
import { FiHome, FiShoppingCart, FiUsers, FiBox, FiLogOut, FiShoppingBag, FiPlusCircle } from "react-icons/fi";
import { AiOutlineQrcode } from "react-icons/ai";
import { BsReceipt } from "react-icons/bs";

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname(); // current path
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const menuItems = [
    { label: "QR Code", icon: <AiOutlineQrcode />, path: "/admin/qr" },
    { label: "Dashboard", icon: <FiHome />, path: "/admin/dashboards" },
    { label: " Add New Products", icon: <FiPlusCircle />, path: "/admin/products/productForm" },
    { label: "Products ", icon: <FiBox />, path: "/admin/products" },
    { label: "Orders", icon: <FiShoppingCart />, path: "/admin/orders" },
    { label: "Create your own orders", icon: <FiShoppingBag />, path: "/admin/orders/orderForm" },
    { label: "Transactions", icon: <BsReceipt />, path: "/admin/transactions" },
    { label: "Logout", icon: <FiLogOut />, path: "/login" },
  ];

  return (
    <div
      style={{
        width: isCollapsed ? "80px" : "240px",
        backgroundColor: appTheme.colors.surface,
        color: appTheme.colors.textPrimary,
        height: "100vh", // Full viewport height
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        boxShadow: appTheme.shadows.md,
        position: "fixed", // Changed to fixed
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowY: "auto", // Enable scrolling if content is too tall
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
          position: "sticky",
          top: 0,
          backgroundColor: appTheme.colors.surface,
          zIndex: 1001,
        }}
      >
        {isCollapsed ? "AI" : "Step On Next"}
      </div>

      {/* Toggle Button */}
      <div
        style={{
          position: "sticky",
          top: "60px", // Below the logo
          backgroundColor: appTheme.colors.surface,
          zIndex: 1001,
          padding: "10px 0",
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            margin: "0 auto",
            display: "block",
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
      </div>

      {/* Menu Items - This part will scroll if content overflows */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "10px",
          overflowY: "auto", // Enable scrolling for menu items
        }}
      >
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
                flexShrink: 0, // Prevent shrinking
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "20px",
          borderTop: `1px solid ${appTheme.colors.border}`,
          position: "sticky",
          bottom: 0,
          backgroundColor: appTheme.colors.surface,
          zIndex: 1001,
        }}
      >
        {!isCollapsed && <small style={{ color: appTheme.colors.textSecondary }}>© 2025 Step On Next</small>}
      </div>
    </div>
  );
}