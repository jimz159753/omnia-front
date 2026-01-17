import React from "react";
import { CalendarEvent } from "@/hooks/useAppointmentCalendar";

interface CustomEventProps {
  event: CalendarEvent;
  title: string;
}

// Status color mapping
const statusColors: Record<string, { bg: string; hover: string }> = {
  Pending: {
    bg: "#FFA500", // Orange
    hover: "#FF8C00",
  },
  Confirmed: {
    bg: "#5faf87", // Green (default)
    hover: "#4a9a70",
  },
  Completed: {
    bg: "#4169E1", // Royal Blue
    hover: "#3557C1",
  },
  Cancelled: {
    bg: "#DC143C", // Crimson Red
    hover: "#B8112C",
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
