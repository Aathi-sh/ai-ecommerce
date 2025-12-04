"use client";

import React, { useState } from "react";
import Sidebar from "../../src/components/sidebar";
import AppBar from "../../src/components/appbar";
import { Footer } from "../../src/components/footer";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      
      {/* Sidebar */}
      <Sidebar collapsed={!sidebarOpen} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* AppBar */}
        <AppBar
          title="Admin Panel"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onRefresh={() => window.location.reload()}
        />

        {/* Page Content */}
        <main style={{ flex: 1, padding: "25px" }}>
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}