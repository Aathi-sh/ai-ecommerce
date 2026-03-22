



"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { appTheme } from "../constants/theme";
import { FiHome, FiShoppingCart, FiUsers, FiBox, FiLogOut, FiShoppingBag, FiCalendar, FiTool, FiSettings, FiPlusCircle } from "react-icons/fi";
import { AiOutlineQrcode } from "react-icons/ai";
import { BsReceipt } from "react-icons/bs";
import { signOut } from "next-auth/react";

export default function Sidebar({ 
  collapsed = false, 
  onCollapseChange,
  isMobile = false 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const menuItems = [
    { label: "Config", icon: <FiBox />, path: "/admin/config" },
    { label: "Company Profile", icon: <FiBox />, path: "/admin/companyProfile" },
    { label: "QR Code", icon: <AiOutlineQrcode />, path: "/admin/qr" },
    { label: "Dashboard", icon: <FiHome />, path: "/admin/dashboards" },
    { label: "Add New Products", icon: <FiPlusCircle />, path: "/admin/products/productForm" },
    { label: "Products", icon: <FiBox />, path: "/admin/products" },
    { label: "Orders", icon: <FiShoppingCart />, path: "/admin/orders" },
    { label: "Create your own orders", icon: <FiShoppingBag />, path: "/admin/orders/orderForm" },
    { label: "Transactions", icon: <BsReceipt />, path: "/admin/transactions" },
    { label: "Categories", icon: <BsReceipt />, path: "/admin/masters" },
    { label: "Booking Manager", icon: <FiCalendar />, path: "/admin/bookingService/bookingmng" },
    { label: "Booking Create", icon: <FiSettings />, path: "/admin/bookingService/bookingmng/create" },
    { label: "Service", icon: <FiTool />, path: "/admin/bookingService/service" },
    { label: "Service Create", icon: <FiPlusCircle />, path: "/admin/bookingService/service/create" },
    { label: "Bookings ", icon: <FiPlusCircle />, path: "/admin/bookingService/bookings/" },
    { label: "Create Bookings", icon: <FiPlusCircle />, path: "/admin/bookingService/bookings/create" },
    
    
  ];

  // Handle internal collapse state
  useEffect(() => {
    // On mobile, sidebar should behave differently
    if (isMobile && !collapsed) {
      // Mobile sidebar is expanded (overlay)
    }
  }, [collapsed, isMobile]);

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    if (onCollapseChange) {
      onCollapseChange(!collapsed);
    }
  };

  // Handle menu item click on mobile
  const handleMenuItemClick = () => {
    if (isMobile) {
      // On mobile, close sidebar when item is clicked
      if (onCollapseChange) {
        onCollapseChange(true);
      }
    }
  };

  // ✅ FIXED: Professional logout function with NextAuth signOut
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    // Confirm logout
    if (!window.confirm('Are you sure you want to logout?\n\nYou will be redirected to the login page.')) {
      return;
    }
    
    setIsLoggingOut(true);
    setLogoutError(null);
    
    try {
      // ✅ METHOD 1: Use NextAuth signOut (Primary - Most Reliable)
      console.log('🚪 [Logout] Attempting logout via NextAuth signOut...');
      
      const result = await signOut({ 
        redirect: false,
        callbackUrl: '/login?logout=success'
      });
      
      console.log('✅ [Logout] NextAuth signOut successful');
      
      // Clear FCM device token if exists
      try {
        const deviceId = localStorage.getItem('fcm_device_id');
        if (deviceId) {
          await fetch('/api/auth/fcm-token', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, clearAll: false })
          }).catch(() => {});
          localStorage.removeItem('fcm_device_id');
        }
      } catch (fcmError) {
        console.warn('⚠️ [Logout] FCM token cleanup failed:', fcmError);
      }
      
      // ✅ Clear ALL client storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ [Logout] Storage clear failed:', storageError);
      }
      
      // ✅ Clear ALL cookies from client side
      clearAllCookies();
      
      // ✅ Force redirect to login page
      console.log('🔄 [Logout] Redirecting to login page...');
      
      // Use window.location.replace for hard redirect (clears all state)
      setTimeout(() => {
        window.location.replace('/login?logout=success');
      }, 100);
      
    } catch (error) {
      console.error('❌ [Logout] Error during logout:', error);
      setLogoutError(error.message);
      
      // ✅ FALLBACK: Try API logout if NextAuth fails
      try {
        console.log('⚠️ [Logout] Attempting fallback API logout...');
        
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('API logout failed');
        }
        
        console.log('✅ [Logout] Fallback API logout successful');
        
      } catch (fallbackError) {
        console.error('❌ [Logout] Fallback logout also failed:', fallbackError);
      }
      
      // ✅ Even on error, clear everything and redirect
      try {
        localStorage.clear();
        sessionStorage.clear();
        clearAllCookies();
      } catch (cleanupError) {
        console.error('❌ [Logout] Cleanup failed:', cleanupError);
      }
      
      // Force redirect with error flag
      setTimeout(() => {
        window.location.replace('/login?logout=error');
      }, 100);
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ Helper function to clear all cookies from client side
  const clearAllCookies = () => {
    if (typeof document === 'undefined') return;
    
    const cookies = document.cookie.split(';');
    
    // Comprehensive list of cookies to clear
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.pkce.code_verifier',
      'auth_token',
      'refresh_token',
      'user_session',
      'user_preferences',
      'remember_me',
      'user_id',
      'user_role',
      'session',
      'connect.sid'
    ];
    
    // Clear specific cookies
    cookieNames.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/auth;`;
    });
    
    // Clear any remaining cookies
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName && !cookieNames.includes(cookieName)) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    console.log('✅ [Logout] Client-side cookies cleared');
  };

  // ✅ Direct logout confirmation handler
  const confirmLogout = () => {
    handleLogout();
  };

  // On mobile, we want overlay behavior, not collapsed
  const showCollapsed = isMobile ? false : collapsed;

  return (
    <div className="sidebar" style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: appTheme.colors.surface,
      color: appTheme.colors.textPrimary,
    }}>
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ 
          opacity: showCollapsed ? 0 : 1, 
          transition: 'opacity 0.2s',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {showCollapsed ? "" : "Steponext"}
        </span>
        
        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button
            className="sidebar-toggle"
            onClick={handleCollapseToggle}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: appTheme.colors.primary,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
              flexShrink: 0,
            }}
            title={showCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {showCollapsed ? "➡️" : "⬅️"}
          </button>
        )}
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
              onClick={handleMenuItemClick}
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
                overflow: "hidden",
              }}
              title={showCollapsed ? item.label : ""}
            >
              <span style={{ 
                fontSize: "1.2rem",
                flexShrink: 0,
                width: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {item.icon}
              </span>
              <span style={{ 
                opacity: showCollapsed ? 0 : 1, 
                transition: 'opacity 0.2s',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {showCollapsed ? "" : item.label}
              </span>
            </Link>
          );
        })}
        
        {/* ✅ FIXED: LOGOUT BUTTON with proper styling and loading states */}
        <button
          onClick={confirmLogout}
          disabled={isLoggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 10px",
            borderRadius: "8px",
            backgroundColor: isLoggingOut ? "#9ca3af" : "#dc262620",
            color: isLoggingOut ? "#6b7280" : "#dc2626",
            fontWeight: "600",
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            opacity: isLoggingOut ? 0.7 : 1,
            marginTop: "auto",
            border: "1px solid #dc262630",
            overflow: "hidden",
            position: "relative",
            width: "100%",
            outline: "none",
          }}
          title={showCollapsed ? "Logout" : ""}
          onMouseEnter={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = "#dc262640";
              e.currentTarget.style.borderColor = "#dc2626";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoggingOut) {
              e.currentTarget.style.backgroundColor = "#dc262620";
              e.currentTarget.style.borderColor = "#dc262630";
            }
          }}
        >
          <span style={{ 
            fontSize: "1.2rem",
            flexShrink: 0,
            width: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FiLogOut />
          </span>
          <span style={{ 
            opacity: showCollapsed ? 0 : 1, 
            transition: 'opacity 0.2s',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: "0.95rem",
            flex: 1,
            textAlign: "left"
          }}>
            {showCollapsed ? "" : (isLoggingOut ? "Logging out..." : "Logout")}
          </span>
          
          {/* Loading spinner */}
          {isLoggingOut && (
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid #dc2626",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginLeft: "4px",
            }} />
          )}
        </button>

        {/* Error message if logout fails */}
        {logoutError && !showCollapsed && (
          <div style={{
            marginTop: "8px",
            padding: "8px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "6px",
            fontSize: "0.75rem",
            textAlign: "center",
          }}>
            Logout failed. Redirecting...
          </div>
        )}
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
          textAlign: "center",
        }}
      >
        {!showCollapsed && (
          <small style={{ 
            color: appTheme.colors.textSecondary,
            fontSize: "0.75rem",
            display: "block",
            opacity: showCollapsed ? 0 : 1,
            transition: 'opacity 0.2s'
          }}>
            © {new Date().getFullYear()} Steponext
          </small>
        )}
        {isLoggingOut && !showCollapsed && (
          <div style={{
            marginTop: "8px",
            fontSize: "0.7rem",
            color: appTheme.colors.warning,
            textAlign: "center",
            opacity: showCollapsed ? 0 : 1,
            transition: 'opacity 0.2s'
          }}>
            Clearing session...
          </div>
        )}
      </div>

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .sidebar button:focus-visible {
          outline: 2px solid ${appTheme.colors.primary};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}