"use client";
import React, { useRef } from "react";
import {
  FooterContainer,
  FooterContent,
  FooterSection,
  FooterTitle,
  FooterText,
  FooterLink,
  FooterList,
  FooterListItem,
  SocialLinks,
  FooterBottom,
  Copyright,
  FooterLogo,
  SocialLink,
} from "./Footer.styles";
import Image from "next/image";
import omniaLogo from "@/assets/images/espacio_omnia.webp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import instagram from "@/assets/images/instagram.webp";
import tiktok from "@/assets/images/tiktok.webp";
import whatsapp from "@/assets/images/whatsapp.webp";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useGSAP(
    () => {
      // Set initial state
      gsap.set(footerRef.current, { opacity: 0, y: 50 });
      gsap.set(".footer-section", { opacity: 0, y: 30 });

      // Main footer container animation
      gsap.to(footerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Staggered section animations
      gsap.to(".footer-section", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.2,
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: footerRef }
  );

  return (
    <FooterContainer id="contacto" ref={footerRef}>
      <FooterContent>
        {/* Company Information */}
        <FooterSection className="footer-section">
          <FooterLogo>
            <Image src={omniaLogo} alt="Omnia" width={150} />
          </FooterLogo>
          <FooterText>
            Descubre el poder de la transformación personal a través de nuestros
            servicios especializados en bienestar, masajes y terapias
            holísticas.
          </FooterText>
          <SocialLinks>
            <SocialLink href="https://wa.me/+523333906945" target="_blank">
              <Image src={whatsapp} alt="Whatsapp" width={24} height={24} />
            </SocialLink>
            <SocialLink
              href="https://www.instagram.com/omniaespacio_"
              target="_blank"
            >
              <Image src={instagram} alt="Instagram" width={24} height={24} />
            </SocialLink>
            <SocialLink
              href="https://www.tiktok.com/@espacio.omnia"
              target="_blank"
            >
              <Image src={tiktok} alt="Tiktok" width={24} height={24} />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        {/* Services */}
        <FooterSection className="footer-section">
          <FooterTitle>Nuestros Servicios</FooterTitle>
          <FooterList>
            <FooterListItem>
              <FooterLink>Masajes Terapéuticos</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink>Terapias Holísticas</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink>Bienestar Integral</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink>Spa & Relajación</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink>Renta de espacios</FooterLink>
            </FooterListItem>
          </FooterList>
        </FooterSection>

        {/* Quick Links */}
        <FooterSection className="footer-section">
          <FooterTitle>Enlaces Rápidos</FooterTitle>
          <FooterList>
            <FooterListItem>
              <FooterLink
                href="#home"
                onClick={(e) => handleNavClick(e, "home")}
              >
                Inicio
              </FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink
                href="#conocenos"
                onClick={(e) => handleNavClick(e, "conocenos")}
              >
                Sobre Nosotros
              </FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink
                href="#espacios"
                onClick={(e) => handleNavClick(e, "espacios")}
              >
                Nuestro Espacio
              </FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink
                href="#eventos"
                onClick={(e) => handleNavClick(e, "eventos")}
              >
                Reservas
              </FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink
                href="#contacto"
                onClick={(e) => handleNavClick(e, "contacto")}
              >
                Contacto
              </FooterLink>
            </FooterListItem>
          </FooterList>
        </FooterSection>

        {/* Contact Information */}
        <FooterSection className="footer-section">
          <FooterTitle>Información de Contacto</FooterTitle>
          <FooterList>
            <FooterListItem>
              <FooterText>
                Calle Prisciliano Sanchez #762
                <br />
                Col. Americana, 44160
              </FooterText>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="https://wa.me/+523333906945">
                +52 (33) 33906945
              </FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterText>
                Lun - Sáb: 9:00 AM - 8:00 PM
                <br />
                Domingo: Cerrado
              </FooterText>
            </FooterListItem>
          </FooterList>
        </FooterSection>
      </FooterContent>

      {/* Footer Bottom */}
      <FooterBottom className="footer-section">
        <Copyright>
          © {currentYear} Omnia. Todos los derechos reservados.
        </Copyright>
        <FooterList sx={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
          <FooterListItem>
            <FooterLink href="/privacy">Política de Privacidad</FooterLink>
          </FooterListItem>
          <FooterListItem>
            <FooterLink href="/terms">Términos de Servicio</FooterLink>
          </FooterListItem>
        </FooterList>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
