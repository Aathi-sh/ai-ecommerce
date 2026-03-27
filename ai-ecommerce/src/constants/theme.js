//  // src/constants/theme.js

// import { appColors } from "./colors"
// import { appFonts } from "./fonts";

// export const appTheme = {
//   colors: {
//     primary: appColors.primary,         // Main brand color
//     secondary: appColors.secondary,     // Accent color
//     background: appColors.background,   // App background
//     surface: appColors.surface,         // Card or container background
//     textPrimary: appColors.textPrimary, // Primary text color
//     textSecondary: appColors.textSecondary, // Secondary text color
//     border: appColors.border,           // Border color for cards/tables
//     success: appColors.success,         // For success states
//     warning: appColors.warning,         // For warnings
//     error: appColors.error,             // For errors
//   },

//   fonts: {
//     primary: appFonts.primary,
//     secondary: appFonts.secondary,
//     monospace: appFonts.monospace,
//   },

//   radius: {
//     sm: "6px",
//     md: "12px",
//     lg: "20px",
//     xl: "32px",
//   },

//   spacing: {
//     xs: "4px",
//     sm: "8px",
//     md: "16px",
//     lg: "24px",
//     xl: "32px",
//   },

//   shadows: {
//     sm: "0 2px 5px rgba(0, 0, 0, 0.05)",
//     md: "0 4px 10px rgba(0, 0, 0, 0.1)",
//     lg: "0 6px 20px rgba(0, 0, 0, 0.15)",
//   },

//   transition: {
//     fast: "all 0.2s ease-in-out",
//     normal: "all 0.3s ease-in-out",
//     slow: "all 0.5s ease-in-out",
//   },
// };











// src/constants/theme.js

import { appColors } from "./colors";
import { appFonts } from "./fonts";

export const appTheme = {
  // 🎨 Colors - Complete palette from appColors
  colors: {
    // Brand Colors
    primary: appColors.primary,
    primaryDark: appColors.primaryDark,
    primaryLight: appColors.primaryLight,
    secondary: appColors.secondary,
    secondaryDark: appColors.secondaryDark,
    accent: appColors.accent,
    
    // Background Colors
    background: appColors.backgroundLight,
    backgroundCard: appColors.backgroundCard,
    backgroundDark: appColors.backgroundDark,
    backgroundElevated: appColors.backgroundElevated,
    backgroundDisabled: appColors.backgroundDisabled,
    
    // Text Colors
    textPrimary: appColors.textPrimary,
    textSecondary: appColors.textSecondary,
    textTertiary: appColors.textTertiary,
    textLight: appColors.textLight,
    textDisabled: appColors.textDisabled,
    textLink: appColors.textLink,
    
    // Border Colors
    border: appColors.border,
    borderLight: appColors.borderLight,
    divider: appColors.divider,
    
    // Status Colors
    success: appColors.success,
    successLight: appColors.successLight,
    warning: appColors.warning,
    warningLight: appColors.warningLight,
    error: appColors.error,
    errorLight: appColors.errorLight,
    info: appColors.info,
    infoLight: appColors.infoLight,
    
    // UI States
    hover: appColors.hover,
    active: appColors.active,
    focus: appColors.focus,
    focusRing: appColors.focusRing,
    
    // Shadows & Overlays
    shadow: appColors.shadow,
    shadowMedium: appColors.shadowMedium,
    overlay: appColors.overlay,
    
    // Gradients
    gradientStart: appColors.gradientStart,
    gradientEnd: appColors.gradientEnd,
    
    // Chart Colors
    chartBlue: appColors.chartBlue,
    chartGreen: appColors.chartGreen,
    chartYellow: appColors.chartYellow,
    chartRed: appColors.chartRed,
    chartPurple: appColors.chartPurple,
    
    // Semantic Colors
    destructive: appColors.destructive,
    destructiveLight: appColors.destructiveLight,
    muted: appColors.muted,
    mutedBackground: appColors.mutedBackground,
  },

  // 🖋️ Typography
  fonts: {
    families: {
      primary: appFonts.families.primary,
      secondary: appFonts.families.secondary,
      monospace: appFonts.families.monospace,
      system: appFonts.families.system,
    },
    sizes: appFonts.sizes,
    weights: appFonts.weights,
    lineHeights: appFonts.lineHeights,
    letterSpacing: appFonts.letterSpacing,
    variants: appFonts.variants,
    utilities: appFonts.utilities,
  },

  // 📐 Border Radius
  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },

  // 📏 Spacing System (8px base)
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },

  // 🌑 Shadows
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },

  // ⚡ Transitions
  transitions: {
    fast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // 📱 Breakpoints (for responsive design)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // 🎯 Z-Index Layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  // 🔧 Common Component Styles
  components: {
    button: {
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 500,
      transition: "all 0.2s ease",
      variants: {
        primary: {
          backgroundColor: appColors.primary,
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: appColors.primaryDark,
          },
        },
        secondary: {
          backgroundColor: appColors.secondary,
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: appColors.secondaryDark,
          },
        },
        outline: {
          backgroundColor: "transparent",
          border: `1px solid ${appColors.border}`,
          color: appColors.textPrimary,
          "&:hover": {
            backgroundColor: appColors.hover,
          },
        },
        ghost: {
          backgroundColor: "transparent",
          color: appColors.textPrimary,
          "&:hover": {
            backgroundColor: appColors.hover,
          },
        },
      },
    },
    card: {
      padding: "24px",
      borderRadius: "12px",
      backgroundColor: appColors.backgroundCard,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      variants: {
        elevated: {
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        bordered: {
          border: `1px solid ${appColors.border}`,
          boxShadow: "none",
        },
      },
    },
    input: {
      padding: "8px 12px",
      borderRadius: "8px",
      borderWidth: "1px",
      borderColor: appColors.border,
      backgroundColor: "#FFFFFF",
      fontSize: "14px",
      transition: "all 0.2s ease",
      "&:focus": {
        outline: "none",
        borderColor: appColors.primary,
        boxShadow: `0 0 0 3px ${appColors.focusRing}`,
      },
      "&:disabled": {
        backgroundColor: appColors.backgroundDisabled,
        cursor: "not-allowed",
      },
      variants: {
        error: {
          borderColor: appColors.error,
          "&:focus": {
            boxShadow: `0 0 0 3px ${appColors.errorLight}`,
          },
        },
        success: {
          borderColor: appColors.success,
          "&:focus": {
            boxShadow: `0 0 0 3px ${appColors.successLight}`,
          },
        },
      },
    },
    modal: {
      overlay: {
        backgroundColor: appColors.overlay,
        backdropFilter: "blur(4px)",
      },
      container: {
        backgroundColor: appColors.backgroundCard,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        width: "90%",
      },
    },
    toast: {
      success: {
        backgroundColor: appColors.success,
        color: "#FFFFFF",
      },
      error: {
        backgroundColor: appColors.error,
        color: "#FFFFFF",
      },
      warning: {
        backgroundColor: appColors.warning,
        color: "#000000",
      },
      info: {
        backgroundColor: appColors.info,
        color: "#FFFFFF",
      },
    },
  },
};

// Helper function to get theme values
export const getThemeValue = (path, defaultValue = null) => {
  return path.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  }, appTheme);
};

// Export individual sections for easier imports
export const themeColors = appTheme.colors;
export const themeTypography = appTheme.fonts;
export const themeSpacing = appTheme.spacing;
export const themeShadows = appTheme.shadows;
export const themeBreakpoints = appTheme.breakpoints;
export const themeZIndex = appTheme.zIndex;
export const themeComponents = appTheme.components;