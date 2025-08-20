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

  return (
    <section className="about-container" style={aboutStyles.container}>
      <p
        className="about-title"
        style={{
          ...aboutStyles.title,
          fontSize: isMobile
            ? aboutStyles.titleMobile.fontSize
            : aboutStyles.title.fontSize,
        }}
      >
        Toque, energía, belleza y encuentros
      </p>
      <p className="about-description" style={aboutStyles.description}>
        Nuestro espacio está diseñado para que te sientas bienvenido, relajado y
        con la energía necesaria para enfrentar el día.
      </p>
      <div style={aboutStyles.carouselContainer}>
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
