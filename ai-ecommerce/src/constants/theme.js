 // src/constants/theme.js

import { appColors } from "./colors"
import { appFonts } from "./fonts";

export const appTheme = {
  colors: {
    primary: appColors.primary,         // Main brand color
    secondary: appColors.secondary,     // Accent color
    background: appColors.background,   // App background
    surface: appColors.surface,         // Card or container background
    textPrimary: appColors.textPrimary, // Primary text color
    textSecondary: appColors.textSecondary, // Secondary text color
    border: appColors.border,           // Border color for cards/tables
    success: appColors.success,         // For success states
    warning: appColors.warning,         // For warnings
    error: appColors.error,             // For errors
  },

  fonts: {
    primary: appFonts.primary,
    secondary: appFonts.secondary,
    monospace: appFonts.monospace,
  },

  radius: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    xl: "32px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },

  shadows: {
    sm: "0 2px 5px rgba(0, 0, 0, 0.05)",
    md: "0 4px 10px rgba(0, 0, 0, 0.1)",
    lg: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },

  transition: {
    fast: "all 0.2s ease-in-out",
    normal: "all 0.3s ease-in-out",
    slow: "all 0.5s ease-in-out",
  },
};