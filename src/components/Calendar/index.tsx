"use client";
import React, { useEffect, useState } from "react";
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

interface BookingCalendar {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  showOnMainPage: boolean;
}

import { ScrollTrigger } from "gsap/ScrollTrigger";

const Calendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = calendarStyles(isMobile);
  
  const [calendarSlug, setCalendarSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch("/api/booking-calendars");
        if (response.ok) {
          const calendars: BookingCalendar[] = await response.json();
          // Only show a calendar if it's explicitly marked for main page display
          const mainPageCalendar = calendars.find((cal) => cal.showOnMainPage && cal.isActive);
          
          if (mainPageCalendar) {
            setCalendarSlug(mainPageCalendar.slug);
          }
          // If no calendar is toggled for main page, don't show anything (calendarSlug stays null)
        }
      } catch (err) {
        console.error("Error fetching calendar:", err);
      } finally {
        setLoading(false);
        // Delay refresh slightly to allow the DOM to update
        setTimeout(() => {
          if (typeof window !== "undefined") {
            ScrollTrigger.refresh();
          }
        }, 100);
      }
    };

    fetchCalendar();
  }, []);


  // Don't render anything if no calendar is toggled for main page
  if (!loading && !calendarSlug) {
    return null;
  }

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
        {loading ? (
          <div style={{ ...styles.calendar, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "500px" }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#86694B]"></div>
          </div>
        ) : (
          <iframe
            src={`/book/${calendarSlug}`}
            style={{
              ...styles.calendar,
              border: "none",
              minHeight: isMobile ? "700px" : "800px",
              width: "100%",
              maxWidth: "900px",
            }}
            title="Booking Calendar"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
};

export default Calendar;
