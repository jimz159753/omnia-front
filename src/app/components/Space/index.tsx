"use client";
import React from "react";
import { spaceStyles } from "./Space.styles";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Space = () => {
  useGSAP(() => {
    gsap.from(".space-card", {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".space-section",
        start: "top 50%",
        end: "bottom 50%",
        toggleActions: "restart none restart",
      },
    });
  });

  return (
    <section className="space-section">
      <div style={spaceStyles.container}>
        <p style={spaceStyles.title}>Donde la magia pasa</p>
        <div style={spaceStyles.contentWrapper}>
          <div style={spaceStyles.row}>
            <div className="space-card" style={spaceStyles.card40}>
              <div style={spaceStyles.cardTextContainer}>
                <p style={spaceStyles.cardText}>Nuestros espacios</p>
                <p style={spaceStyles.cardTextDescription}>
                  Un espacio diseñado para el bienestar integral, donde la
                  armonía, la energía y la tranquilidad se unen para ofrecer
                  experiencias transformadoras. Nuestra casa cuenta con cuartos
                  y áreas disponibles en renta, pensados para terapeutas, guías
                  y profesionales de la salud y el crecimiento personal.
                </p>
              </div>
            </div>
            <div className="space-card" style={spaceStyles.space1} />
          </div>
          <div style={spaceStyles.row}>
            <div className="space-card" style={spaceStyles.space2} />
            <div className="space-card" style={spaceStyles.space3} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Space;
