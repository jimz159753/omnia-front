"use client";
import React from "react";
import { services } from "@/constants";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery, useTheme } from "@/hooks/useCustomMediaQuery";
import { getAboutStyles } from "./Services.styles";
import CardService from "../ui/CardService";
import Image from "next/image";
import whatsapp from "@/assets/images/whatsapp.webp";

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // if the element’s CSS changes across breakpoints,
      // this prevents weird inline styles from sticking around
      ScrollTrigger.saveStyles(".services-title");

      const mm = gsap.matchMedia();
      const cards = gsap.utils.toArray<HTMLElement>(".card-service");

      mm.add("(min-width: 600px)", () => {
        // ✅ DESKTOP: pin the title
        gsap.from(".services-title", {
          scrollTrigger: {
            trigger: ".services-container",
            start: "top top",
            end: "bottom center",
            scrub: true,
            pin: ".services-title",
            pinSpacing: false,
            invalidateOnRefresh: true,
          },
        });
      });

      mm.add("(max-width: 599px)", () => {
        // 📱 MOBILE: no pin — nothing to set up here for the title
      });

      // Your card reveals (run on all sizes)

      cards.forEach((card) => {
        gsap.from(card, {
          x: 100,
          opacity: 0,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "bottom 75%",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert(); // cleans up animations & ScrollTriggers on unmount/re-run
  }, []);

  const styles = getAboutStyles(null, isMobile);

  return (
    <section
      id="servicios"
      className="services-container"
      style={styles.container}
    >
      <div className="services-title" style={styles.titleContainer}>
        <p style={styles.title}>Donde la calma se convierte en camino</p>
        <a
          style={styles.buttonContact}
          href="https://wa.me/+523333906945"
          target="_blank"
        >
          <Image src={whatsapp} alt="Whatsapp" width={24} height={24} />
          Reserva tu cita
        </a>
      </div>
      <div style={styles.contentWrapper}>
        <div style={styles.cardsContainer}>
          {services.map((service) => (
            <div key={service.id} className="card-service">
              <CardService service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
