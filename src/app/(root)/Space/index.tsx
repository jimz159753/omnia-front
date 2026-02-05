"use client";
import React from "react";
import { getSpaceStyles } from "./Space.styles";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageCarousel } from "../../../components/ui/ImageCarousel";
import { tagSpaces } from "@/constants";
import { useTheme, useMediaQuery } from "@/hooks/useCustomMediaQuery";

gsap.registerPlugin(ScrollTrigger);

const Space = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = getSpaceStyles(isMobile);

  useGSAP(() => {
    gsap.from(".space-card", {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".space-section",
        start: "top 50%",
        end: "bottom 50%",
        toggleActions: "play none none reverse",
      },
    });
  });

  return (
    <section id="espacios" className="space-section">
      <div style={styles.container}>
        <p style={styles.title}>Donde la magia pasa</p>
        <div style={styles.contentWrapper}>
          <div style={styles.row}>
            <div className="space-card" style={styles.card40}>
              <div style={styles.cardTextContainer}>
                <p style={styles.cardText}>Nuestros espacios</p>
                <p style={styles.cardTextDescription}>
                  Un espacio diseñado para el bienestar integral, donde la
                  armonía, la energía y la tranquilidad se unen para ofrecer
                  experiencias transformadoras. Nuestra casa cuenta con cuartos
                  y áreas disponibles en renta, pensados para terapeutas, guías
                  y profesionales de la salud y el crecimiento personal.
                </p>
                <ImageCarousel tags={tagSpaces} gap={5} />
              </div>
            </div>
            <div className="space-card" style={styles.space1} />
          </div>
          <div style={styles.row}>
            <div className="space-card" style={styles.space2} />
            <div className="space-card" style={styles.space3} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Space;
