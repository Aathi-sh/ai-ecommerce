"use client";

import React, { useState } from "react";
import Sidebar from "../../src/components/sidebar";
import AppBar from "../../src/components/appbar";
import { Footer } from "../../src/components/footer";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      background: "#f8f9fa",
      position: "relative"
    }}>
      
      {/* Sidebar - Fixed positioned with z-index 1000 */}
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: sidebarOpen ? "240px" : "80px",
        transition: "width 0.3s ease",
        zIndex: 1000, // Sidebar layer
      }}>
        <Sidebar collapsed={!sidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          marginLeft: sidebarOpen ? "240px" : "80px", // Match sidebar width
          transition: "margin-left 0.3s ease", // Smooth transition
          minHeight: "100vh",
          width: "100%", // Ensure it takes full width
          position: "relative",
        }}
      >

        {/* AppBar - With z-index 1100 (higher than sidebar) */}
        <div style={{ position: "relative", zIndex: 1100 }}>
          <AppBar
            title="Admin Panel"
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onRefresh={() => window.location.reload()}
          />
        </div>

        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          padding: "25px",
          background: "#f8f9fa",
          minHeight: "calc(100vh - 120px)", // Adjust for header/footer
          position: "relative",
          zIndex: 1
        }}>
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}