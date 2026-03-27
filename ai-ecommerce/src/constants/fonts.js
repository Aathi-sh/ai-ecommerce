// //src/constants/fonts.js

// export const appFonts = {
//   primary: "'Emerald', sans-serif",
//   secondary: "'Poppins', sans-serif", // optional fallback
//   monospace: "'Roboto Mono', monospace", // for code or numbers if needed
// };







// src/constants/fonts.js

export const appFonts = {
  // 🖋️ Font Families
  families: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monospace: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Courier New', monospace",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },

  // 📏 Font Sizes (rem based for accessibility)
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
  },

  // 💪 Font Weights
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // 📐 Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // ✍️ Letter Spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // 📝 Text Variants
  variants: {
    heading: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.025em",
    },
    body: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "normal",
    },
    caption: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.25,
      letterSpacing: "normal",
    },
    code: {
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1,
      letterSpacing: "0.025em",
    },
  },

  // 📱 Responsive Font Scale
  responsive: {
    mobile: {
      heading: "1.5rem",
      subheading: "1.25rem",
      body: "1rem",
      small: "0.875rem",
    },
    tablet: {
      heading: "1.875rem",
      subheading: "1.5rem",
      body: "1rem",
      small: "0.875rem",
    },
    desktop: {
      heading: "2.25rem",
      subheading: "1.75rem",
      body: "1rem",
      small: "0.875rem",
    },
  },

  // 🎨 Font Loading URLs (for adding to layout.js)
  googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
  
  preconnect: [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],

  // 🎯 Common Text Utilities
  utilities: {
    heading1: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    heading2: {
      fontSize: "1.875rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
    },
    heading3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    heading4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    bodyLarge: {
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodyRegular: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.25,
    },
  },
};