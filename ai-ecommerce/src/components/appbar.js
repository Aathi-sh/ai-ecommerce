
// // src/components/appbar.js (PROFESSIONAL VERSION - UPDATED)
// "use client";

// import React, { useState, useEffect } from "react";
// import { appTheme } from "../constants/theme";
// import { Bell, BellRing, User, RefreshCw, Menu, Clock, ChevronDown } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";

// export default function AppBar({
//   title = "Admin Panel",
//   onToggleSidebar,
//   onRefresh,
//   connectionStatus,
//   onEnableNotifications,
//   user
// }) {
//   const router = useRouter();
//   const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
//   const [recentNotifications, setRecentNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch recent notifications
//   const fetchRecentNotifications = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('/api/notifications?limit=5&status=pending');
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setRecentNotifications(data.notifications || []);
//           setUnreadCount(data.statistics?.unread || 0);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       const response = await fetch(`/api/notifications?id=${notificationId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ markAsRead: true })
//       });

//       if (response.ok) {
//         // Update local state
//         setRecentNotifications(prev => 
//           prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
//         );
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//     } catch (error) {
//       console.error("Error marking as read:", error);
//     }
//   };

//   // Mark all as read
//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch('/api/notifications', {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ markAllAsRead: true })
//       });

//       if (response.ok) {
//         setRecentNotifications([]);
//         setUnreadCount(0);
//       }
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//     }
//   };

//   // Format time
//   const formatTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);
      
//       if (diffDays > 0) return `${diffDays}d ago`;
//       if (diffHours > 0) return `${diffHours}h ago`;
//       if (diffMins > 0) return `${diffMins}m ago`;
//       return 'Just now';
//     } catch (error) {
//       return "Recently";
//     }
//   };

//   // Get notification icon
//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'NEW_ORDER': return '🛍️';
//       case 'PAYMENT_RECEIVED': return '💰';
//       case 'PAYMENT_VERIFIED': return '✅';
//       case 'LOW_STOCK_ALERT': return '📦';
//       case 'ORDER_STATUS_CHANGED': return '📦';
//       case 'SYSTEM_ALERT': return '🚨';
//       case 'ADMIN_ALERT': return '🔔';
//       default: return '🔔';
//     }
//   };

//   // Get notification color
//   const getNotificationColor = (type) => {
//     switch (type) {
//       case 'NEW_ORDER': return '#3b82f6';
//       case 'PAYMENT_RECEIVED': return '#10b981';
//       case 'PAYMENT_VERIFIED': return '#059669';
//       case 'LOW_STOCK_ALERT': return '#f59e0b';
//       case 'ORDER_STATUS_CHANGED': return '#8b5cf6';
//       case 'SYSTEM_ALERT': return '#ef4444';
//       case 'ADMIN_ALERT': return '#f97316';
//       default: return '#6b7280';
//     }
//   };

//   // Load notifications on mount
//   useEffect(() => {
//     fetchRecentNotifications();
    
//     // Refresh every 30 seconds
//     const interval = setInterval(fetchRecentNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

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
//         zIndex: 1100,
//         position: "relative",
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

//       {/* --------------------------- RIGHT SECTION --------------------------- */}
//       <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
//         {/* Refresh Button */}
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
//           title="Refresh Page"
//         >
//           <RefreshCw size={20} color={appTheme.colors.primary} />
//         </motion.div>

//         {/* Notifications Button with Dropdown */}
//         <div style={{ position: "relative" }}>
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             onClick={() => {
//               fetchRecentNotifications();
//               setShowNotificationDropdown(!showNotificationDropdown);
//             }}
//             style={{
//               position: "relative",
//               backgroundColor: appTheme.colors.background,
//               borderRadius: "10px",
//               padding: "6px",
//               cursor: "pointer",
//               boxShadow: appTheme.shadows.sm,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               width: "40px",
//               height: "40px",
//             }}
//             title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
//           >
//             {unreadCount > 0 ? (
//               <BellRing size={20} color={appTheme.colors.primary} />
//             ) : (
//               <Bell size={20} color={appTheme.colors.primary} />
//             )}
            
//             {/* Notification Count Badge */}
//             {unreadCount > 0 && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 style={{
//                   position: "absolute",
//                   top: "-4px",
//                   right: "-4px",
//                   backgroundColor: "#ef4444",
//                   color: "#ffffff",
//                   borderRadius: "50%",
//                   fontSize: "10px",
//                   fontWeight: "bold",
//                   minWidth: "18px",
//                   height: "18px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: "2px",
//                   border: "2px solid #ffffff",
//                 }}
//               >
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </motion.div>
//             )}
//           </motion.div>

//           {/* Notifications Dropdown */}
//           <AnimatePresence>
//             {showNotificationDropdown && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                 transition={{ duration: 0.2 }}
//                 style={{
//                   position: "absolute",
//                   top: "55px",
//                   right: "0",
//                   backgroundColor: "#ffffff",
//                   borderRadius: "12px",
//                   boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
//                   width: "380px",
//                   maxHeight: "500px",
//                   overflow: "hidden",
//                   zIndex: 9999,
//                   border: `1px solid ${appTheme.colors.border}`,
//                 }}
//               >
//                 {/* Dropdown Header */}
//                 <div style={{
//                   padding: "16px 20px",
//                   borderBottom: `1px solid ${appTheme.colors.border}`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   backgroundColor: "#f8fafc",
//                 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                     <BellRing size={18} color={appTheme.colors.primary} />
//                     <span style={{ 
//                       fontSize: "16px", 
//                       fontWeight: "600",
//                       color: appTheme.colors.textPrimary 
//                     }}>
//                       Notifications
//                     </span>
//                     {unreadCount > 0 && (
//                       <span style={{
//                         backgroundColor: appTheme.colors.primary,
//                         color: "#ffffff",
//                         fontSize: "11px",
//                         fontWeight: "600",
//                         padding: "2px 8px",
//                         borderRadius: "20px",
//                         marginLeft: "6px",
//                       }}>
//                         {unreadCount} new
//                       </span>
//                     )}
//                   </div>
                  
//                   <div style={{ display: "flex", gap: "8px" }}>
//                     {unreadCount > 0 && (
//                       <button
//                         onClick={markAllAsRead}
//                         style={{
//                           background: "transparent",
//                           border: "none",
//                           color: appTheme.colors.primary,
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           cursor: "pointer",
//                           padding: "4px 8px",
//                           borderRadius: "6px",
//                         }}
//                       >
//                         Mark all read
//                       </button>
//                     )}
//                     <button
//                       onClick={() => router.push("/admin/notification")}
//                       style={{
//                         background: "transparent",
//                         border: "none",
//                         color: appTheme.colors.primary,
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         cursor: "pointer",
//                         padding: "4px 8px",
//                         borderRadius: "6px",
//                       }}
//                     >
//                       View all
//                     </button>
//                   </div>
//                 </div>

//                 {/* Notifications List */}
//                 <div style={{ maxHeight: "350px", overflowY: "auto" }}>
//                   {isLoading ? (
//                     <div style={{ padding: "40px 20px", textAlign: "center" }}>
//                       <div style={{ 
//                         width: "30px", 
//                         height: "30px", 
//                         border: "3px solid #f3f4f6",
//                         borderTop: "3px solid #3b82f6",
//                         borderRadius: "50%",
//                         margin: "0 auto 12px",
//                         animation: "spin 1s linear infinite"
//                       }} />
//                       <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading notifications...</p>
//                     </div>
//                   ) : recentNotifications.length === 0 ? (
//                     <div style={{ padding: "40px 20px", textAlign: "center" }}>
//                       <Bell size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
//                       <p style={{ color: "#6b7280", fontSize: "14px" }}>No new notifications</p>
//                       <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "4px" }}>You're all caught up!</p>
//                     </div>
//                   ) : (
//                     recentNotifications.map((notification) => (
//                       <motion.div
//                         key={notification.id}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         style={{
//                           padding: "16px 20px",
//                           borderBottom: `1px solid ${appTheme.colors.border}`,
//                           cursor: "pointer",
//                           backgroundColor: notification.status === 'pending' ? "#f0f9ff" : "#ffffff",
//                           transition: "background-color 0.2s",
//                         }}
//                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
//                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 
//                           notification.status === 'pending' ? "#f0f9ff" : "#ffffff"
//                         }
//                         onClick={() => {
//                           markAsRead(notification.id);
//                           // You can add navigation to order or notification details here
//                         }}
//                       >
//                         <div style={{ display: "flex", gap: "12px" }}>
//                           {/* Notification Icon */}
//                           <div style={{
//                             width: "36px",
//                             height: "36px",
//                             borderRadius: "8px",
//                             backgroundColor: `${getNotificationColor(notification.type)}15`,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             fontSize: "16px",
//                             flexShrink: 0,
//                           }}>
//                             {getNotificationIcon(notification.type)}
//                           </div>

//                           {/* Notification Content */}
//                           <div style={{ flex: 1 }}>
//                             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                               <span style={{ 
//                                 fontSize: "14px", 
//                                 fontWeight: "600",
//                                 color: appTheme.colors.textPrimary,
//                                 lineHeight: "1.3"
//                               }}>
//                                 {notification.title}
//                               </span>
//                               <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                                 <Clock size={12} color="#9ca3af" />
//                                 <span style={{ 
//                                   fontSize: "11px", 
//                                   color: "#9ca3af",
//                                   whiteSpace: "nowrap"
//                                 }}>
//                                   {formatTime(notification.createdAt)}
//                                 </span>
//                               </div>
//                             </div>
                            
//                             <p style={{ 
//                               fontSize: "13px", 
//                               color: appTheme.colors.textSecondary,
//                               marginBottom: "6px",
//                               lineHeight: "1.4"
//                             }}>
//                               {notification.message}
//                             </p>
                            
//                             {/* Metadata */}
//                             {notification.orderNumber && (
//                               <div style={{ 
//                                 fontSize: "11px", 
//                                 color: "#6b7280",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: "8px",
//                                 marginTop: "4px"
//                               }}>
//                                 <span style={{ 
//                                   backgroundColor: "#f3f4f6",
//                                   padding: "2px 6px",
//                                   borderRadius: "4px",
//                                 }}>
//                                   Order #{notification.orderNumber}
//                                 </span>
//                                 {notification.customerName && (
//                                   <span>• {notification.customerName}</span>
//                                 )}
//                               </div>
//                             )}
                            
//                             {/* Unread indicator */}
//                             {notification.status === 'pending' && (
//                               <div style={{
//                                 display: "inline-block",
//                                 width: "6px",
//                                 height: "6px",
//                                 backgroundColor: "#3b82f6",
//                                 borderRadius: "50%",
//                                 marginTop: "8px",
//                               }} />
//                             )}
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))
//                   )}
//                 </div>

//                 {/* Dropdown Footer */}
//                 {recentNotifications.length > 0 && (
//                   <div style={{
//                     padding: "12px 20px",
//                     borderTop: `1px solid ${appTheme.colors.border}`,
//                     backgroundColor: "#f8fafc",
//                     textAlign: "center",
//                   }}>
//                     <button
//                       onClick={() => router.push("/admin/notification")}
//                       style={{
//                         width: "100%",
//                         padding: "8px 16px",
//                         backgroundColor: "transparent",
//                         border: `1px solid ${appTheme.colors.border}`,
//                         borderRadius: "8px",
//                         color: appTheme.colors.primary,
//                         fontSize: "14px",
//                         fontWeight: "500",
//                         cursor: "pointer",
//                         transition: "all 0.2s",
//                       }}
//                       onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
//                       onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
//                     >
//                       View all notifications
//                     </button>
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Close dropdown when clicking outside */}
//           {showNotificationDropdown && (
//             <div
//               style={{
//                 position: "fixed",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 zIndex: 9998,
//               }}
//               onClick={() => setShowNotificationDropdown(false)}
//             />
//           )}
//         </div>

//         {/* User Profile */}
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
//           title="User Profile"
//         >
//           <User size={20} color={appTheme.colors.primary} />
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//             <span style={{ 
//               fontSize: "0.85rem", 
//               fontWeight: "600",
//               color: appTheme.colors.textPrimary,
//               lineHeight: "1.1"
//             }}>
//               {user?.name || 'Admin'}
//             </span>
//             <span style={{ 
//               fontSize: "0.7rem", 
//               color: appTheme.colors.textSecondary,
//               lineHeight: "1.1"
//             }}>
//               {user?.role || 'Administrator'}
//             </span>
//           </div>
//           <ChevronDown size={16} color={appTheme.colors.textSecondary} />
//         </motion.div>
//       </div>

//       {/* Animation styles */}
//       <style jsx>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//       `}</style>
//     </motion.div>
//   );
// }





"use client";

import React, { useState, useEffect } from "react";
import { appTheme } from "../constants/theme";
import { Bell, BellRing, User, RefreshCw, Menu, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AppBar({
  title = "Admin Panel",
  onToggleSidebar,
  onRefresh,
  connectionStatus,
  onEnableNotifications,
  user,
  isMobile = false,
  sidebarCollapsed = false
}) {
  const router = useRouter();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=5&status=pending');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentNotifications(data.notifications || []);
          setUnreadCount(data.statistics?.unread || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAsRead: true })
      });

      if (response.ok) {
        setRecentNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
        setRecentNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } catch (error) {
      return "Recently";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER': return '🛍️';
      case 'PAYMENT_RECEIVED': return '💰';
      case 'PAYMENT_VERIFIED': return '✅';
      case 'LOW_STOCK_ALERT': return '📦';
      case 'ORDER_STATUS_CHANGED': return '📦';
      case 'SYSTEM_ALERT': return '🚨';
      case 'ADMIN_ALERT': return '🔔';
      default: return '🔔';
    }
  };

  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'NEW_ORDER': return '#3b82f6';
      case 'PAYMENT_RECEIVED': return '#10b981';
      case 'PAYMENT_VERIFIED': return '#059669';
      case 'LOW_STOCK_ALERT': return '#f59e0b';
      case 'ORDER_STATUS_CHANGED': return '#8b5cf6';
      case 'SYSTEM_ALERT': return '#ef4444';
      case 'ADMIN_ALERT': return '#f97316';
      default: return '#6b7280';
    }
  };

  // Load notifications on mount
  useEffect(() => {
    fetchRecentNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle toggle sidebar
  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

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
        padding: isMobile ? "0 15px" : "0 25px",
        boxShadow: appTheme.shadows.lg,
        borderBottom: `1px solid ${appTheme.colors.border}`,
        zIndex: 1100,
        position: "relative",
      }}
    >
      {/* --------------------------- LEFT SECTION --------------------------- */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "15px" }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSidebar}
          className="menu-toggle"
          style={{
            backgroundColor: appTheme.colors.background,
            borderRadius: "10px",
            padding: "6px",
            cursor: "pointer",
            boxShadow: appTheme.shadows.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: isMobile ? "36px" : "40px",
            height: isMobile ? "36px" : "40px",
          }}
          title={isMobile ? (sidebarCollapsed ? "Open menu" : "Close menu") : "Toggle sidebar"}
        >
          <Menu size={isMobile ? 20 : 22} color={appTheme.colors.primary} />
        </motion.div>

        <div
          style={{
            fontWeight: "600",
            color: appTheme.colors.primary,
            fontSize: isMobile ? "1.1rem" : "1.3rem",
            letterSpacing: "0.5px",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🛍️</span>
          <span>{title}</span>
          {isMobile && (
            <span style={{
              fontSize: "0.7rem",
              backgroundColor: sidebarCollapsed ? "#10b981" : "#f59e0b",
              color: "white",
              padding: "2px 6px",
              borderRadius: "4px",
              marginLeft: "6px",
              fontWeight: "500"
            }}>
              {sidebarCollapsed ? "Collapsed" : "Expanded"}
            </span>
          )}
        </div>
      </div>

      {/* --------------------------- RIGHT SECTION --------------------------- */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: isMobile ? "12px" : "20px" 
      }}>
        {/* Refresh Button */}
        {!isMobile && (
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
        )}

        {/* Notifications Button with Dropdown */}
        <div style={{ position: "relative" }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              fetchRecentNotifications();
              setShowNotificationDropdown(!showNotificationDropdown);
            }}
            style={{
              position: "relative",
              backgroundColor: appTheme.colors.background,
              borderRadius: "10px",
              padding: "6px",
              cursor: "pointer",
              boxShadow: appTheme.shadows.sm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
            }}
            title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          >
            {unreadCount > 0 ? (
              <BellRing size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
            ) : (
              <Bell size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
            )}
            
            {/* Notification Count Badge */}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: "bold",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2px",
                  border: "2px solid #ffffff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.div>
            )}
          </motion.div>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotificationDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: "55px",
                  right: "0",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  width: isMobile ? "320px" : "380px",
                  maxHeight: "500px",
                  overflow: "hidden",
                  zIndex: 9999,
                  border: `1px solid ${appTheme.colors.border}`,
                }}
              >
                {/* Dropdown Header */}
                <div style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${appTheme.colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f8fafc",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BellRing size={18} color={appTheme.colors.primary} />
                    <span style={{ 
                      fontSize: "16px", 
                      fontWeight: "600",
                      color: appTheme.colors.textPrimary 
                    }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span style={{
                        backgroundColor: appTheme.colors.primary,
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        marginLeft: "6px",
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px" }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: appTheme.colors.primary,
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        router.push("/admin/notification");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: appTheme.colors.primary,
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      View all
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {isLoading ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ 
                        width: "30px", 
                        height: "30px", 
                        border: "3px solid #f3f4f6",
                        borderTop: "3px solid #3b82f6",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        animation: "spin 1s linear infinite"
                      }} />
                      <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading notifications...</p>
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <Bell size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                      <p style={{ color: "#6b7280", fontSize: "14px" }}>No new notifications</p>
                      <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "4px" }}>You're all caught up!</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          padding: "16px 20px",
                          borderBottom: `1px solid ${appTheme.colors.border}`,
                          cursor: "pointer",
                          backgroundColor: notification.status === 'pending' ? "#f0f9ff" : "#ffffff",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 
                          notification.status === 'pending' ? "#f0f9ff" : "#ffffff"
                        }
                        onClick={() => {
                          markAsRead(notification.id);
                          setShowNotificationDropdown(false);
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px" }}>
                          {/* Notification Icon */}
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: `${getNotificationColor(notification.type)}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            flexShrink: 0,
                          }}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Notification Content */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ 
                                fontSize: "14px", 
                                fontWeight: "600",
                                color: appTheme.colors.textPrimary,
                                lineHeight: "1.3"
                              }}>
                                {notification.title}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Clock size={12} color="#9ca3af" />
                                <span style={{ 
                                  fontSize: "11px", 
                                  color: "#9ca3af",
                                  whiteSpace: "nowrap"
                                }}>
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            <p style={{ 
                              fontSize: "13px", 
                              color: appTheme.colors.textSecondary,
                              marginBottom: "6px",
                              lineHeight: "1.4"
                            }}>
                              {notification.message}
                            </p>
                            
                            {/* Metadata */}
                            {notification.orderNumber && (
                              <div style={{ 
                                fontSize: "11px", 
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "4px"
                              }}>
                                <span style={{ 
                                  backgroundColor: "#f3f4f6",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}>
                                  Order #{notification.orderNumber}
                                </span>
                                {notification.customerName && (
                                  <span>• {notification.customerName}</span>
                                )}
                              </div>
                            )}
                            
                            {/* Unread indicator */}
                            {notification.status === 'pending' && (
                              <div style={{
                                display: "inline-block",
                                width: "6px",
                                height: "6px",
                                backgroundColor: "#3b82f6",
                                borderRadius: "50%",
                                marginTop: "8px",
                              }} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Dropdown Footer */}
                {recentNotifications.length > 0 && (
                  <div style={{
                    padding: "12px 20px",
                    borderTop: `1px solid ${appTheme.colors.border}`,
                    backgroundColor: "#f8fafc",
                    textAlign: "center",
                  }}>
                    <button
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        router.push("/admin/notification");
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        backgroundColor: "transparent",
                        border: `1px solid ${appTheme.colors.border}`,
                        borderRadius: "8px",
                        color: appTheme.colors.primary,
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close dropdown when clicking outside */}
          {showNotificationDropdown && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
              }}
              onClick={() => setShowNotificationDropdown(false)}
            />
          )}
        </div>

        {/* User Profile - Show on mobile only if there's space */}
        {(!isMobile || window.innerWidth > 400) && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: appTheme.colors.background,
              padding: isMobile ? "4px 8px" : "6px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: appTheme.shadows.sm,
              minWidth: isMobile ? "auto" : "140px",
            }}
            title="User Profile"
          >
            <User size={isMobile ? 18 : 20} color={appTheme.colors.primary} />
            {!isMobile && (
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
            )}
            {!isMobile && <ChevronDown size={16} color={appTheme.colors.textSecondary} />}
          </motion.div>
        )}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}