import React, { useState } from "react";
import { CalendarEvent } from "@/hooks/useAppointmentCalendar";

interface CustomEventProps {
  event: CalendarEvent;
  title: string;
}

// Status color mapping - matches AppointmentTicketTable status buttons
const statusColors: Record<string, { bg: string; accent: string; text: string }> = {
  Pending: {
    bg: "#FEF3C7", // Yellow-100
    accent: "#F59E0B", // Amber-500
    text: "#92400E", // Amber-800
  },
  Confirmed: {
    bg: "#DBEAFE", // Blue-100
    accent: "#3B82F6", // Blue-500
    text: "#1E40AF", // Blue-800
  },
  Completed: {
    bg: "#D1FAE5", // Green-100
    accent: "#10B981", // Emerald-500
    text: "#065F46", // Emerald-800
  },
  Cancelled: {
    bg: "#FEE2E2", // Red-100
    accent: "#EF4444", // Red-500
    text: "#991B1B", // Red-800
  },
  "No Show": {
    bg: "#F3F4F6", // Gray-100
    accent: "#6B7280", // Gray-500
    text: "#374151", // Gray-700
  },
};

// Helper function to create a lighter version of a color
const lightenColor = (color: string, amount: number = 0.85): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten by mixing with white
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

// Helper function to darken a color
const darkenColor = (color: string, amount: number = 0.3): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

export const CustomEvent: React.FC<CustomEventProps> = ({ event, title }) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = event.status || "Pending";
  
  // Determine colors based on Google Calendar color or status
  let bgColor: string;
  let accentColor: string;
  let textColor: string;
  
  if (event.backgroundColor) {
    // Use Google Calendar color with light background
    accentColor = event.backgroundColor;
    bgColor = lightenColor(event.backgroundColor, 0.85);
    textColor = darkenColor(event.backgroundColor, 0.5);
  } else {
    // Use status-based colors
    const colors = statusColors[status] || statusColors.Pending;
    bgColor = colors.bg;
    accentColor = colors.accent;
    textColor = colors.text;
  }

  // Parse title to get client name and service
  const [clientName, serviceName] = title.split(" - ");

  return (
    <div
      className="custom-event"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: isHovered ? darkenColor(bgColor, 0.05) : bgColor,
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "grab",
        boxShadow: isHovered 
          ? "0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
        transform: isHovered ? "translateY(-1px)" : "none",
        transition: "all 0.15s ease-in-out",
        border: `1px solid ${lightenColor(accentColor, 0.6)}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: "4px",
          minWidth: "4px",
          backgroundColor: accentColor,
          flexShrink: 0,
        }}
      />
      
      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Client name */}
        <div
          style={{
            fontWeight: 600,
            fontSize: "13px",
            color: textColor,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >
          {clientName || title}
        </div>
        
        {/* Service name (if exists) */}
        {serviceName && (
          <div
            style={{
              fontWeight: 400,
              fontSize: "11px",
              color: lightenColor(textColor, 0.3),
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
              marginTop: "2px",
            }}
          >
            {serviceName}
          </div>
        )}
      </div>
      
      {/* Status indicator dot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            boxShadow: `0 0 0 2px ${lightenColor(accentColor, 0.7)}`,
          }}
        />
      </div>
    </div>
  );
};
