"use client";
import React from "react";
import CardAbout from "../card-about";
import { services } from "@/constants";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery, useTheme } from "@mui/material";
import { getAboutStyles } from "./About.styles";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Animation setup
  useGSAP(() => {
    const cards = gsap.utils.toArray(".card-about");

    // Animate cards with different trigger points for mobile vs desktop
    cards.forEach((card) => {
      gsap.from(card as Element, {
        x: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: card as Element,
          start: `top 90%`,
          end: `bottom 70%`,
          scrub: true,
        },
      });
    });
  });

  // Get styles from external file
  const styles = getAboutStyles(theme, isMobile);

  return (
    <section className="about-container" style={styles.container}>
      <p className="about-title" style={styles.title}>
        Donde la calma se convierte en camino
      </p>

      <div style={styles.contentWrapper}>
        <div style={styles.cardsContainer}>
          {services.map((service) => (
            <div key={service.id}>
              <CardAbout service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
