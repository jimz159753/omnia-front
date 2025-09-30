"use client";
import React from "react";
import Cal from "@calcom/embed-react";
import { useMediaQuery, useTheme } from "@mui/material";
import { calendarStyles } from "./Calendar.styles";

const Calendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = calendarStyles(isMobile);

  return (
    <section
      id="reservas"
      className="calendar-container"
      style={styles.container}
    >
      <div style={styles.headerContainer}>
        <p style={styles.title}>Cosmetología</p>
        <p style={styles.subtitle}>
          Agenda tu cita. Cada tratamiento está diseñado para realzar tu belleza
          natural mientras disfrutas de un momento de relajación y conexión
          contigo mismo.
        </p>
      </div>
      <div style={styles.calendarContainer}>
        <Cal
          calLink="espacio-omnia/cosmetologia-online"
          style={styles.calendar}
          config={{
            layout: "month_view",
            theme: "light",
          }}
        />
      </div>
    </section>
  );
};

export default Calendar;
