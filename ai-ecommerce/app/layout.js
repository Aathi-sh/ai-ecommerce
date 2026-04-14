
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { Providers } from './providers';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../lib/nextauth';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Steponext Product',
//   description: 'Professional E-commerce Platform',
// };

// export default async function RootLayout({ children }) {
//   const session = await getServerSession(authOptions);
  
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <meta name="theme-color" content="#ffffff" />
//         <meta name="description" content={metadata.description} />
        
//         {/* Open Graph Meta Tags */}
//         <meta property="og:title" content={metadata.title} />
//         <meta property="og:description" content={metadata.description} />
//         <meta property="og:type" content="website" />
        
//         {/* Twitter Card Meta Tags */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={metadata.title} />
//         <meta name="twitter:description" content={metadata.description} />
//       </head>
//       <body className={inter.className}>
//         <Providers session={session}>
//           {children}
//         </Providers>
        
//         {/* Global loading indicator - Clean version */}
//         <div id="global-loader">
//           <div className="loader-spinner"></div>
//         </div>
//       </body>
//     </html>
//   );
// }








// app/layout.js - WITH SPLASH FOR EVERYONE
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { useState, useEffect } from 'react';
import LogoSplash from '../src/components/logoSplash';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get session on client side
    const getSession = async () => {
      const { getSession } = await import('next-auth/react');
      const sessionData = await getSession();
      setSession(sessionData);
    };
    getSession();

    // Check if splash already shown in this browser session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    } else {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash for EVERYONE first
  if (showSplash) {
    return <LogoSplash onComplete={handleSplashComplete} />;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Professional E-commerce Platform" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Steponext Product" />
        <meta property="og:description" content="Professional E-commerce Platform" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Steponext Product" />
        <meta name="twitter:description" content="Professional E-commerce Platform" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
        
        {/* Global loading indicator */}
        <div id="global-loader">
          <div className="loader-spinner"></div>
        </div>
      </body>
    </html>
  );
}