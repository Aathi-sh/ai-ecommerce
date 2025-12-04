"use client";

import React from "react";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";
import { appTheme } from "../../../src/constants/theme";

export default function NotificationsPage() {
  const demoNotifications = [
    {
      id: 1,
      title: "New Order Received",
      message: "Order #1052 has been placed by the customer.",
      time: "2 min ago",
      type: "success",
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: "Only 3 items left for product 'Premium Poster A1'.",
      time: "10 min ago",
      type: "warning",
    },
    {
      id: 3,
      title: "Payment Pending",
      message: "Order #1047 payment still not completed.",
      time: "30 min ago",
      type: "danger",
    },
  ];

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
        Notifications
      </h1>

      {/* Notification List Container */}
      <div
        style={{
          background: appTheme.colors.surface,
          padding: "20px",
          borderRadius: "12px",
          boxShadow: appTheme.shadows.md,
          border: `1px solid ${appTheme.colors.border}`,
        }}
      >
        {demoNotifications.map((note) => (
          <div
            key={note.id}
            style={{
              display: "flex",
              gap: "15px",
              padding: "15px",
              borderBottom: `1px solid ${appTheme.colors.border}`,
              alignItems: "flex-start",
            }}
          >
            {/* Icon */}
            <div style={{ marginTop: "2px" }}>
              {note.type === "success" && (
                <CheckCircle color={appTheme.colors.success} size={24} />
              )}
              {note.type === "warning" && (
                <AlertCircle color={appTheme.colors.warning} size={24} />
              )}
              {note.type === "danger" && (
                <Bell color={appTheme.colors.error} size={24} />
              )}
            </div>

            {/* Text */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                {note.title}
              </h3>
              <p
                style={{
                  color: appTheme.colors.textSecondary,
                  marginBottom: "4px",
                }}
              >
                {note.message}
              </p>
              <span style={{ fontSize: "14px", color: appTheme.colors.textMuted }}>
                {note.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}