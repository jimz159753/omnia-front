"use client";
import React from "react";
import Cal from "@calcom/embed-react";
import { useMediaQuery, useTheme } from "@/hooks/useCustomMediaQuery";
import { calendarStyles } from "./Calendar.styles";
import ImageCarousel from "@/components/ImageCarousel";
import cejas from "@/assets/images/cejas.webp";
import corporales from "@/assets/images/corporales.webp";
import depilacion_1 from "@/assets/images/depilacion_1.webp";
import depilacion_2 from "@/assets/images/depilacion_2.webp";
import eliminacion from "@/assets/images/eliminacion.webp";
import faciales from "@/assets/images/faciales.webp";
import masajes from "@/assets/images/masajes.webp";
import peptonas from "@/assets/images/peptonas.webp";
import pestanas from "@/assets/images/pestanas.webp";
import tarot from "@/assets/images/tarot.webp";
import tatuajes from "@/assets/images/tatuajes.webp";
import terapias from "@/assets/images/terapias.webp";

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
        <p style={styles.title}>Reserva tu cita</p>
        <p style={styles.subtitle}>
          Para cualquier consulta, reserva tu cita a través de nuestro
          calendario.
        </p>
      </div>
      <ImageCarousel
        images={[
          cejas.src,
          corporales.src,
          depilacion_1.src,
          depilacion_2.src,
          eliminacion.src,
          faciales.src,
          masajes.src,
          peptonas.src,
          pestanas.src,
          tarot.src,
          tatuajes.src,
          terapias.src,
        ]}
      />

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
