"use client";

import React from "react";
import { appTheme } from "../constants/theme";
import { Github, Instagram, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: appTheme.colors.surface,
        color: appTheme.colors.textSecondary,
        borderTop: `1px solid ${appTheme.colors.border}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: appTheme.fonts.primary,
        boxShadow: appTheme.shadows.sm,
        marginTop: "40px",
      }}
    >
      {/* Footer Content */}
      <div style={{ marginBottom: "10px" }}>
        <p style={{ fontSize: "15px", fontWeight: 500, color: appTheme.colors.textPrimary }}>
          © {currentYear} Step On Next — All Rights Reserved.
        </p>
      </div>

      {/* Footer Links */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={iconLinkStyle}
        >
          <Github size={20} />
        </a>
        <a
          href="https://www.instagram.com/steponext?igsh=eHBiNm91eTc0NHpr"
          target="_blank"
          rel="noopener noreferrer"
          style={iconLinkStyle}
        >
          <Instagram size={20} />
        </a>
        <a
          href="mailto:jcmoorthy5050@gmail.com"
          style={iconLinkStyle}
        >
          <Mail size={20} />
        </a>
      </div>

      {/* Tagline */}
      <div style={{ marginTop: "10px" }}>
        <p style={{ fontSize: "16px", color: appTheme.colors.textSecondary }}>
          Designed & Developed with ❤️ by Step On Next
        </p>
      </div>
    </footer>
  );
}

// 🔹 Reusable style for icons
const iconLinkStyle = {
  color: appTheme.colors.primary,
  textDecoration: "none",
  transition: "0.3s ease",
  display: "flex",
  alignItems: "center",
};