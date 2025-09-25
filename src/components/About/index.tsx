"use client";
import React from "react";
import { ImageCarousel } from "../ui/ImageCarousel";
import { aboutImages } from "@/constants";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
          images={aboutImages.map((image) => image.image)}
          direction="left"
          speed={30}
        />
        <ImageCarousel
          isMobile={isMobile}
          images={aboutImages.map((image) => image.image)}
          direction="right"
          speed={30}
        />
      </div>
    </section>
  );
};

export default About;
