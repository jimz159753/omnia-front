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

export const CustomEvent: React.FC<CustomEventProps> = ({ event, title }) => {
  const status = event.status || "Pending";
  const colors = statusColors[status] || statusColors.Pending;

  return (
    <div
      className="custom-event"
      style={{
        backgroundColor: colors.bg,
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
        e.currentTarget.style.backgroundColor = colors.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg;
      }}
    >
      {title}
    </div>
  );
};
