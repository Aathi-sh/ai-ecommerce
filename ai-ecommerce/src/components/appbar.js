"use client";

import React from "react";
import { appTheme } from "../constants/theme";
import { Bell, Search, User, RefreshCw, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AppBar({
  title = "Admin Panel",
  onToggleSidebar,
  onRefresh,
}) {
  const router = useRouter();

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
        // Removed sticky positioning
        zIndex: 100,
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
        >
          <RefreshCw size={20} color={appTheme.colors.primary} />
        </motion.div>

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
        >
          <Bell size={20} color={appTheme.colors.primary} />
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
            }}
          >
            5
          </span>
        </motion.div>

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
        >
          <User size={20} color={appTheme.colors.primary} />
          <span style={{ fontSize: "0.9rem", color: appTheme.colors.textSecondary }}>
            Admin
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}