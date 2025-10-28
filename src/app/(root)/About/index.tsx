"use client";
import React from "react";
import { ImageCarousel } from "../../../components/ui/ImageCarousel";
import { aboutImages } from "@/constants";
import { useTheme, useMediaQuery } from "@/hooks/useCustomMediaQuery";
import { aboutStyles } from "./About.styles";

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = aboutStyles(isMobile);

  return (
    <section id="eventos" className="about-container" style={styles.container}>
      <p className="about-title" style={styles.title}>
        Toque, energía, belleza y encuentros
      </p>
      <p className="about-description" style={styles.description}>
        Nuestro espacio está diseñado para que te sientas bienvenido, relajado y
        con la energía necesaria para enfrentar el día.
      </p>
      <div style={styles.carouselContainer}>
        <ImageCarousel
          isMobile={isMobile}
          images={aboutImages.map((image) => image.image.src)}
          direction="left"
          speed={35}
        />
        <ImageCarousel
          isMobile={isMobile}
          images={aboutImages.map((image) => image.image.src)}
          direction="right"
          speed={35}
        />
      </div>
    </section>
  );
};

export default About;
