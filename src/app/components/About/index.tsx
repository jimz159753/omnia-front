"use client";
import React from "react";
import CardAbout from "../card-about";
import { services } from "@/constants";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const cards = gsap.utils.toArray(".card-about");

    gsap.from(".about-title", {
      scrollTrigger: {
        trigger: ".about-container",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: ".about-title",
        pinSpacing: false,
      },
    });

    cards.forEach((card) => {
      gsap.from(card as Element, {
        x: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: card as Element,
          start: "top 90%",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  });

  return (
    <section
      className="about-container"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "100px",
        justifyContent: "space-between",
        padding: "100px",
      }}
    >
      <p
        className="about-title"
        style={{
          width: "50%",
          fontSize: "50px",
          color: "#788D9A",
          margin: "0px",
          fontFamily: "var(--font-lora-regular)",
        }}
      >
        Donde la calma se convierte en camino
      </p>
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
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
