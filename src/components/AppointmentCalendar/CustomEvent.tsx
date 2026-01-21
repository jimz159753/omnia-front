import React from "react";
import { CalendarEvent } from "@/hooks/useAppointmentCalendar";

interface CustomEventProps {
  event: CalendarEvent;
  title: string;
}

// Status color mapping - matches AppointmentTicketTable status buttons
const statusColors: Record<string, { bg: string; hover: string }> = {
  Pending: {
    bg: "#EAB308", // Yellow (Tailwind yellow-500)
    hover: "#CA8A04", // Yellow-600
  },
  Confirmed: {
    bg: "#3B82F6", // Blue (Tailwind blue-500)
    hover: "#2563EB", // Blue-600
  },
  Completed: {
    bg: "#22C55E", // Green (Tailwind green-500)
    hover: "#16A34A", // Green-600
  },
  Cancelled: {
    bg: "#EF4444", // Red (Tailwind red-500)
    hover: "#DC2626", // Red-600
  },
  "No Show": {
    bg: "#808080", // Gray
    hover: "#696969",
  },
};

// Helper function to darken a color for hover effect
const darkenColor = (color: string, amount: number = 20): string => {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each component
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

export const CustomEvent: React.FC<CustomEventProps> = ({ event, title }) => {
  const status = event.status || "Pending";
  
  // Use Google Calendar color if available, otherwise use status colors
  let bgColor: string;
  let hoverColor: string;
  
  if (event.backgroundColor) {
    bgColor = event.backgroundColor;
    hoverColor = darkenColor(event.backgroundColor);
  } else {
    const colors = statusColors[status] || statusColors.Pending;
    bgColor = colors.bg;
    hoverColor = colors.hover;
  }

  return (
    <div
      className="custom-event"
      style={{
        backgroundColor: bgColor,
        height: "100%",
        padding: "4px 8px",
        borderRadius: "4px",
        color: "white",
        fontWeight: 500,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: "grab",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = bgColor;
      }}
    >
      {title}
    </div>
  );
};
