"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appTheme } from "../constants/theme";
import { FiHome, FiShoppingCart, FiUsers, FiBox, FiLogOut, FiShoppingBag,FiCalendar,FiTool,FiSettings,FiPlusCircle } from "react-icons/fi";
import { AiOutlineQrcode } from "react-icons/ai";
import { BsReceipt } from "react-icons/bs";

export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { label: "QR Code", icon: <AiOutlineQrcode />, path: "/admin/qr" },
    { label: "Dashboard", icon: <FiHome />, path: "/admin/dashboards" },
    { label: "Add New Products", icon: <FiPlusCircle />, path: "/admin/products/productForm" },
    { label: "Products", icon: <FiBox />, path: "/admin/products" },
    { label: "Orders", icon: <FiShoppingCart />, path: "/admin/orders" },
    { label: "Create your own orders", icon: <FiShoppingBag />, path: "/admin/orders/orderForm" },
    { label: "Transactions", icon: <BsReceipt />, path: "/admin/transactions" },
    { label: "Booking Manager", icon: <FiCalendar />, path: "/admin/bookingService/bookingmng" },
    { label: "Transact", icon: <FiTool />, path: "/admin/bookingService/service" },
    { label: "Create Booking Service", icon: <FiPlusCircle />, path: "/admin/bookingservice/service/create" },
    { label: "Tran", icon: <FiSettings />, path: "/admin/bookingService/serviceCreate" },
    
    // Removed: Logout from menuItems - handled separately
  ];

  // Logout function
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Clear any FCM device token from localStorage
      const deviceId = localStorage.getItem('fcm_device_id');
      if (deviceId) {
        // Optionally call API to delete device token
        try {
          await fetch('/api/auth/fcm-token', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, clearAll: false })
          });
        } catch (fcmError) {
          console.warn('Could not delete FCM token:', fcmError);
        }
      }
      
      // Call logout API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      // Clear client-side storage
      const storageKeys = [
        'token', 'auth-token', 'refresh-token', 'user',
        'fcm_token', 'fcm_device_id', 'pending_fcm_tokens',
        'session', 'userId', 'userRole', 'userEmail'
      ];
      
      storageKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear all localStorage items (optional safety measure)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('fcm') || key.startsWith('auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Logout successful, redirecting to login...');
      
      // Force redirect to login page
      router.push('/login');
      router.refresh();
      
      // Force hard reload to clear all state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Still try to redirect even if error
      const storageKeys = ['token', 'user', 'auth-token'];
      storageKeys.forEach(key => localStorage.removeItem(key));
      
      // Force redirect anyway
      setTimeout(() => {
        window.location.href = 'api/auth/login';
      }, 500);
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Logout confirmation modal
  const confirmLogout = () => {
    if (window.confirm('Are you sure you want to logout?\n\nYou will be redirected to the login page.')) {
      handleLogout();
    }
  };

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
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowY: "auto",
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
        {isCollapsed ? "AI" : "Steponext"}
      </div>

      {/* Toggle Button */}
      <div
        style={{
          position: "sticky",
          top: "60px",
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

      {/* Menu Items */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "10px",
          overflowY: "auto",
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
                flexShrink: 0,
              }}
               >
              <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        
        {/* LOGOUT BUTTON - Separated from other menu items */}
        <div
          onClick={confirmLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#dc262620", // Light red background
            color: "#dc2626", // Red text
            fontWeight: "600",
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            opacity: isLoggingOut ? 0.7 : 1,
            marginTop: "auto", // Push to bottom
            border: "1px solid #dc262630",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>
            <FiLogOut />
          </span>
          {!isCollapsed && (
            <span>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          )}
        </div>
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
        {!isCollapsed && (
          <small style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "0.75rem",
            display: "block",
            textAlign: "center"
          }}>
            © 2025 Steponext
          </small>
        )}
        {isLoggingOut && !isCollapsed && (
          <div style={{
            marginTop: "8px",
            fontSize: "0.7rem",
            color: appTheme.colors.warning,
            textAlign: "center"
          }}>
            Logging out...
          </div>
        )}
      </div>
    </div>
  );
}