"use client";
import React, { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@/hooks/useCustomMediaQuery";
import { calendarStyles } from "./Calendar.styles";
import ImageCarousel from "@/components/ImageCarousel";
import cosme_2 from "@/assets/images/cosmetology/2.webp";
import cosme_3 from "@/assets/images/cosmetology/3.webp";
import cosme_4 from "@/assets/images/cosmetology/4.webp";
import cosme_5 from "@/assets/images/cosmetology/5.webp";
import cosme_6 from "@/assets/images/cosmetology/6.webp";
import cosme_7 from "@/assets/images/cosmetology/7.webp";
import cosme_8 from "@/assets/images/cosmetology/8.webp";
import cosme_9 from "@/assets/images/cosmetology/9.webp";
import cosme_10 from "@/assets/images/cosmetology/10.webp";
import cosme_11 from "@/assets/images/cosmetology/11.webp";
import cosme_12 from "@/assets/images/cosmetology/12.webp";
import cosme_13 from "@/assets/images/cosmetology/13.webp";
import holi_2 from "@/assets/images/holistic/2.webp";
import holi_3 from "@/assets/images/holistic/3.webp";
import holi_4 from "@/assets/images/holistic/4.webp";
import holi_5 from "@/assets/images/holistic/5.webp";
import holi_6 from "@/assets/images/holistic/6.webp";
import holi_7 from "@/assets/images/holistic/7.webp";
import holi_8 from "@/assets/images/holistic/8.webp";
import holi_9 from "@/assets/images/holistic/9.webp";

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
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", justifyContent: "center", alignItems: "center", padding: "0 20px" }}>
        <ImageCarousel
          images={[
            cosme_2.src,
            cosme_3.src,
            cosme_4.src,
            cosme_5.src,
            cosme_6.src,
            cosme_7.src,
            cosme_8.src,
            cosme_9.src,
            cosme_10.src,
            cosme_11.src,
            cosme_12.src,
            cosme_13.src,
          ]}
        />
        <ImageCarousel
          images={[
            holi_2.src,
            holi_3.src,
            holi_4.src,
            holi_5.src,
            holi_6.src,
            holi_7.src,
            holi_8.src,
            holi_9.src,
          ]}
        />
      </div>

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
