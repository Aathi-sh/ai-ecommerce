"use client";

import React from "react";
import { User, Mail, Phone, Shield } from "lucide-react";
import { appTheme } from "../../../src/constants/theme";

export default function AdminProfilePage() {
  const adminData = {
    name: "Admin User",
    email: "admin@steponnext.com",
    phone: "+91 98765 43210",
    role: "Super Admin",
  };

  return (
    <div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "600",
          color: appTheme.colors.textPrimary,
          marginBottom: "20px",
        }}
      >
        Admin Profile
      </h1>

      <div
        style={{
          background: appTheme.colors.surface,
          padding: "25px",
          borderRadius: "12px",
          boxShadow: appTheme.shadows.md,
          border: `1px solid ${appTheme.colors.border}`,
          maxWidth: "600px",
        }}
      >
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: appTheme.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "32px",
              fontWeight: "600",
            }}
          >
            A
          </div>

          <div>
            <h2 style={{ fontSize: "22px", marginBottom: "4px" }}>{adminData.name}</h2>
            <p style={{ color: appTheme.colors.textSecondary }}>{adminData.role}</p>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ marginTop: "25px" }}>
          <div style={rowStyle}>
            <User size={20} />
            <p>{adminData.name}</p>
          </div>

          <div style={rowStyle}>
            <Mail size={20} />
            <p>{adminData.email}</p>
          </div>

          <div style={rowStyle}>
            <Phone size={20} />
            <p>{adminData.phone}</p>
          </div>

          <div style={rowStyle}>
            <Shield size={20} />
            <p>{adminData.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Row Style
const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
  fontSize: "16px",
};