





// // app/layout.js - WITH SPLASH FOR EVERYONE
// 'use client';

// import { Inter } from 'next/font/google';
// import './globals.css';
// import { Providers } from './providers';
// import { useState, useEffect } from 'react';
// import LogoSplash from '../src/components/logoSplash';

// const inter = Inter({ subsets: ['latin'] });

// export default function RootLayout({ children }) {
//   // Start with null to indicate "not yet determined"
//   const [showSplash, setShowSplash] = useState(null);
//   const [session, setSession] = useState(null);

//   useEffect(() => {
//     // Get session on client side
//     const getSession = async () => {
//       try {
//         const { getSession } = await import('next-auth/react');
//         const sessionData = await getSession();
//         setSession(sessionData);
//       } catch (error) {
//         console.error('Failed to get session:', error);
//         setSession(null);
//       }
//     };
//     getSession();

//     // Check if splash already shown in this browser session
//     try {
//       const splashShown = sessionStorage.getItem('splashShown');
//       if (splashShown) {
//         setShowSplash(false);
//       } else {
//         setShowSplash(true);
//         sessionStorage.setItem('splashShown', 'true');
//       }
//     } catch (error) {
//       // sessionStorage might not be available (SSR or private browsing)
//       console.warn('sessionStorage not available, showing splash by default');
//       setShowSplash(true);
//     }
//   }, []);

//   const handleSplashComplete = () => {
//     setShowSplash(false);
//   };

//   // Show loading state while determining if splash should show
//   if (showSplash === null) {
//     return null; // Or a minimal loading indicator
//   }

//   // Show splash for EVERYONE first
//   if (showSplash) {
//     return (
//       <html lang="en" suppressHydrationWarning>
//         <head>
//           <link rel="icon" href="/favicon.ico" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
//           <meta name="theme-color" content="#ffffff" />
//           <meta name="description" content="Professional E-commerce Platform" />
          
//           {/* Open Graph Meta Tags */}
//           <meta property="og:title" content="Steponext Product" />
//           <meta property="og:description" content="Professional E-commerce Platform" />
//           <meta property="og:type" content="website" />
          
//           {/* Twitter Card Meta Tags */}
//           <meta name="twitter:card" content="summary_large_image" />
//           <meta name="twitter:title" content="Steponext Product" />
//           <meta name="twitter:description" content="Professional E-commerce Platform" />
//         </head>
//         <body className={inter.className}>
//           <LogoSplash onComplete={handleSplashComplete} />
//         </body>
//       </html>
//     );
//   }

//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
//         <meta name="theme-color" content="#ffffff" />
//         <meta name="description" content="Professional E-commerce Platform" />
        
//         {/* Open Graph Meta Tags */}
//         <meta property="og:title" content="Steponext Product" />
//         <meta property="og:description" content="Professional E-commerce Platform" />
//         <meta property="og:type" content="website" />
        
//         {/* Twitter Card Meta Tags */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content="Steponext Product" />
//         <meta name="twitter:description" content="Professional E-commerce Platform" />
//       </head>
//       <body className={inter.className}>
//         <Providers session={session}>
//           {children}
//         </Providers>
        
//         {/* Global loading indicator */}
//         <div id="global-loader" style={{ display: 'none' }}>
//           <div className="loader-spinner"></div>
//         </div>
//       </body>
//     </html>
//   );
// }'use client';
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { useState, useEffect } from 'react';
import LogoSplash from '../src/components/logoSplash';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  // ✅ Start with true - show splash immediately for everyone
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if splash already shown in this browser session
    try {
      const splashShown = sessionStorage.getItem('splashShown');
      if (splashShown) {
        // Already shown, skip splash
        setShowSplash(false);
        setIsCheckingSession(false);
      }
      // If not shown, keep showing splash (already true by default)
    } catch (error) {
      // sessionStorage not available, show splash anyway
      console.warn('sessionStorage not available');
    }
  }, []);

  // Fetch session in background while splash is showing
  useEffect(() => {
    const getSession = async () => {
      try {
        const { getSession } = await import('next-auth/react');
        const sessionData = await getSession();
        setSession(sessionData);
      } catch (error) {
        console.error('Failed to get session:', error);
        setSession(null);
      } finally {
        setIsCheckingSession(false);
      }
    };
    getSession();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // ✅ ALWAYS return the same HTML structure
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Professional E-commerce Platform" />
        <meta property="og:title" content="Steponext Product" />
        <meta property="og:description" content="Professional E-commerce Platform" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Steponext Product" />
        <meta name="twitter:description" content="Professional E-commerce Platform" />
      </head>
      <body className={inter.className}>
        {/* ✅ Show splash for everyone first */}
        {showSplash ? (
          <LogoSplash onComplete={handleSplashComplete} />
        ) : (
          /* ✅ After splash, show main content */
          <Providers session={session}>
            {children}
          </Providers>
        )}
        
        {/* Global loading indicator */}
        <div id="global-loader" style={{ display: 'none' }}>
          <div className="loader-spinner"></div>
        </div>
      </body>
    </html>
  );
}