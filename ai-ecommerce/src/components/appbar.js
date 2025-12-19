// "use client";

// import React from "react";
// import { appTheme } from "../constants/theme";
// import { Bell, Search, User, RefreshCw, Menu } from "lucide-react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";

// export default function AppBar({
//   title = "Admin Panel",
//   onToggleSidebar,
//   onRefresh,
// }) {
//   const router = useRouter();

//   return (
//     <motion.div
//       initial={{ y: -20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.4 }}
//       style={{
//         width: "100%",
//         height: "70px",
//         backgroundColor: appTheme.colors.surface,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: "0 25px",
//         boxShadow: appTheme.shadows.lg,
//         borderBottom: `1px solid ${appTheme.colors.border}`,
//         zIndex: 1100, // Increased to be higher than sidebar's zIndex: 1000
//       }}
//     >
//       {/* --------------------------- LEFT SECTION --------------------------- */}
//       <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//         <motion.div
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={onToggleSidebar}
//           style={{
//             backgroundColor: appTheme.colors.background,
//             borderRadius: "10px",
//             padding: "6px",
//             cursor: "pointer",
//             boxShadow: appTheme.shadows.sm,
//           }}
//         >
//           <Menu size={22} color={appTheme.colors.primary} />
//         </motion.div>

//         <div
//           style={{
//             fontWeight: "600",
//             color: appTheme.colors.primary,
//             fontSize: "1.3rem",
//             letterSpacing: "0.5px",
//             userSelect: "none",
//           }}
//         >
//           🛍️ {title}
//         </div>
//       </div>

//       {/* --------------------------- SEARCH BAR --------------------------- */}
//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           justifyContent: "center",
//           maxWidth: "420px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             backgroundColor: appTheme.colors.background,
//             borderRadius: "12px",
//             padding: "6px 12px",
//             boxShadow: appTheme.shadows.sm,
//             width: "100%",
//           }}
//         >
//           <Search size={18} color={appTheme.colors.textSecondary} />
//           <input
//             type="text"
//             placeholder="Search..."
//             style={{
//               flex: 1,
//               border: "none",
//               outline: "none",
//               background: "transparent",
//               color: appTheme.colors.textPrimary,
//               fontSize: "0.9rem",
//               paddingLeft: "8px",
//             }}
//           />
//         </div>
//       </div>

//       {/* --------------------------- RIGHT SECTION --------------------------- */}
//       <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
//         <motion.div
//           whileHover={{ rotate: 90, scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={onRefresh}
//           style={{
//             backgroundColor: appTheme.colors.background,
//             borderRadius: "10px",
//             padding: "6px",
//             cursor: "pointer",
//             boxShadow: appTheme.shadows.sm,
//           }}
//         >
//           <RefreshCw size={20} color={appTheme.colors.primary} />
//         </motion.div>

//         <motion.div
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => router.push("/admin/notification")}
//           style={{
//             position: "relative",
//             backgroundColor: appTheme.colors.background,
//             borderRadius: "10px",
//             padding: "6px",
//             cursor: "pointer",
//             boxShadow: appTheme.shadows.sm,
//           }}
//         >
//           <Bell size={20} color={appTheme.colors.primary} />
//           <span
//             style={{
//               position: "absolute",
//               top: "-4px",
//               right: "-4px",
//               backgroundColor: appTheme.colors.primary,
//               color: "#fff",
//               borderRadius: "50%",
//               fontSize: "0.65rem",
//               padding: "2px 4px",
//             }}
//           >
//             5
//           </span>
//         </motion.div>

//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => router.push("/admin/profile")}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             backgroundColor: appTheme.colors.background,
//             padding: "6px 10px",
//             borderRadius: "10px",
//             cursor: "pointer",
//             boxShadow: appTheme.shadows.sm,
//           }}
//         >
//           <User size={20} color={appTheme.colors.primary} />
//           <span style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary }}>
//             Admin
//           </span>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }


// src/components/appbar.js (COMPLETE PROFESSIONAL VERSION)
"use client";

import React from "react";
import { appTheme } from "../constants/theme";
import { Bell, Search, User, RefreshCw, Menu, Wifi, WifiOff, BellRing, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AppBar({
  title = "Admin Panel",
  onToggleSidebar,
  onRefresh,
  connectionStatus,
  onCheckWebSocket,
  onEnableNotifications,
  onCheckServiceWorker,
  user
}) {
  const router = useRouter();

  // Determine connection status
  const getWebSocketStatus = () => {
    if (!connectionStatus) return { connected: false, status: 'disconnected' };
    
    if (connectionStatus.ws?.connected) {
      return { 
        connected: true, 
        status: connectionStatus.ws.status === 'authenticated' ? 'authenticated' : 'connected',
        text: 'Connected',
        color: '#16a34a',
        bgColor: '#dcfce7',
        textColor: '#166534',
        icon: <Wifi size={12} />
      };
    } else {
      return { 
        connected: false, 
        status: connectionStatus.ws?.status || 'disconnected',
        text: connectionStatus.ws?.status === 'auth_failed' ? 'Auth Failed' : 'Disconnected',
        color: '#dc2626',
        bgColor: '#fee2e2',
        textColor: '#991b1b',
        icon: <WifiOff size={12} />
      };
    }
  };

  const getFCMStatus = () => {
    if (!connectionStatus) return { ready: false, permission: 'default' };
    
    const permission = connectionStatus.fcm?.permission || 'default';
    
    switch (permission) {
      case 'granted':
        return {
          ready: true,
          permission,
          text: 'Ready',
          color: '#16a34a',
          bgColor: '#dcfce7',
          textColor: '#166534',
          icon: <BellRing size={12} />
        };
      case 'denied':
        return {
          ready: false,
          permission,
          text: 'Blocked',
          color: '#dc2626',
          bgColor: '#fee2e2',
          textColor: '#991b1b',
          icon: <BellOff size={12} />
        };
      case 'default':
        return {
          ready: false,
          permission,
          text: 'Pending',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          textColor: '#92400e',
          icon: <Bell size={12} />
        };
      default:
        return {
          ready: false,
          permission,
          text: 'Unknown',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          textColor: '#374151',
          icon: <Bell size={12} />
        };
    }
  };

  const wsStatus = getWebSocketStatus();
  const fcmStatus = getFCMStatus();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "100%",
        height: "70px",
        backgroundColor: appTheme.colors.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
        boxShadow: appTheme.shadows.lg,
        borderBottom: `1px solid ${appTheme.colors.border}`,
        zIndex: 1100,
        position: "relative",
      }}
    >
      {/* --------------------------- LEFT SECTION --------------------------- */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSidebar}
          style={{
            backgroundColor: appTheme.colors.background,
            borderRadius: "10px",
            padding: "6px",
            cursor: "pointer",
            boxShadow: appTheme.shadows.sm,
          }}
        >
          <Menu size={22} color={appTheme.colors.primary} />
        </motion.div>

        <div
          style={{
            fontWeight: "600",
            color: appTheme.colors.primary,
            fontSize: "1.3rem",
            letterSpacing: "0.5px",
            userSelect: "none",
          }}
        >
          🛍️ {title}
        </div>
      </div>

      {/* --------------------------- SEARCH BAR --------------------------- */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          maxWidth: "420px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: appTheme.colors.background,
            borderRadius: "12px",
            padding: "6px 12px",
            boxShadow: appTheme.shadows.sm,
            width: "100%",
          }}
        >
          <Search size={18} color={appTheme.colors.textSecondary} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: appTheme.colors.textPrimary,
              fontSize: "0.9rem",
              paddingLeft: "8px",
            }}
          />
        </div>
      </div>

      {/* --------------------------- RIGHT SECTION --------------------------- */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Connection Status Indicators */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          flexWrap: "nowrap"
        }}>
          {/* WebSocket Status */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckWebSocket}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "8px",
              background: wsStatus.bgColor,
              color: wsStatus.textColor,
              fontSize: "11px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: appTheme.shadows.sm,
              border: `1px solid ${wsStatus.color}30`,
              minWidth: "fit-content",
            }}
            title={`WebSocket: ${wsStatus.status}\nClick to reconnect`}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
            }}>
              {wsStatus.icon}
            </div>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: wsStatus.color,
              animation: wsStatus.connected ? "none" : "pulse 1.5s infinite",
            }}></div>
            <span style={{ whiteSpace: "nowrap" }}>
              WS: {wsStatus.text}
            </span>
          </motion.div>

          {/* FCM Status */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fcmStatus.permission === 'default' ? onEnableNotifications : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "8px",
              background: fcmStatus.bgColor,
              color: fcmStatus.textColor,
              fontSize: "11px",
              fontWeight: "500",
              cursor: fcmStatus.permission === 'default' ? "pointer" : "default",
              boxShadow: appTheme.shadows.sm,
              border: `1px solid ${fcmStatus.color}30`,
              minWidth: "fit-content",
            }}
            title={`Notifications: ${fcmStatus.permission}\n${fcmStatus.permission === 'default' ? 'Click to enable' : ''}`}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
            }}>
              {fcmStatus.icon}
            </div>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: fcmStatus.color,
            }}></div>
            <span style={{ whiteSpace: "nowrap" }}>
              FCM: {fcmStatus.text}
            </span>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          style={{
            backgroundColor: appTheme.colors.background,
            borderRadius: "10px",
            padding: "6px",
            cursor: "pointer",
            boxShadow: appTheme.shadows.sm,
          }}
          title="Refresh Page"
        >
          <RefreshCw size={20} color={appTheme.colors.primary} />
        </motion.div>

        {/* Notifications Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/admin/notification")}
          style={{
            position: "relative",
            backgroundColor: appTheme.colors.background,
            borderRadius: "10px",
            padding: "6px",
            cursor: "pointer",
            boxShadow: appTheme.shadows.sm,
          }}
          title="Notifications"
        >
          <Bell size={20} color={appTheme.colors.primary} />
          {/* Show notification count if any */}
          {connectionStatus?.fcm?.hasToken && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: appTheme.colors.primary,
                color: "#fff",
                borderRadius: "50%",
                fontSize: "0.65rem",
                padding: "2px 4px",
                minWidth: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {connectionStatus?.notificationsCount || 0}
            </span>
          )}
        </motion.div>

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/admin/profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: appTheme.colors.background,
            padding: "6px 10px",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: appTheme.shadows.sm,
          }}
          title="User Profile"
        >
          <User size={20} color={appTheme.colors.primary} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ 
              fontSize: "0.85rem", 
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              lineHeight: "1.1"
            }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ 
              fontSize: "0.7rem", 
              color: appTheme.colors.textSecondary,
              lineHeight: "1.1"
            }}>
              {user?.role || 'Administrator'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </motion.div>
  );
}