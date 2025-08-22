"use client";
import React from "react";
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
} from "./Footer.styles";
import Image from "next/image";
import omniaLogo from "../../../assets/images/espacio_omnia.webp";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        {/* Company Information */}
        <FooterSection>
          <FooterLogo>
            <Image src={omniaLogo} alt="Omnia" width={150} />
          </FooterLogo>
          <FooterText>
            Descubre el poder de la transformación personal a través de nuestros
            servicios especializados en bienestar, masajes y terapias
            holísticas.
          </FooterText>
          <SocialLinks>Social Media</SocialLinks>
        </FooterSection>

        {/* Services */}
        <FooterSection>
          <FooterTitle>Nuestros Servicios</FooterTitle>
          <FooterList>
            <FooterListItem>
              <FooterLink href="#services">Masajes Terapéuticos</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#services">Terapias Holísticas</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#services">Bienestar Integral</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#services">Spa & Relaxación</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#services">Renta de espacios</FooterLink>
            </FooterListItem>
          </FooterList>
        </FooterSection>

        {/* Quick Links */}
        <FooterSection>
          <FooterTitle>Enlaces Rápidos</FooterTitle>
          <FooterList>
            <FooterListItem>
              <FooterLink href="#home">Inicio</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#about">Sobre Nosotros</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#space">Nuestro Espacio</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#appointments">Reservas</FooterLink>
            </FooterListItem>
            <FooterListItem>
              <FooterLink href="#contact">Contacto</FooterLink>
            </FooterListItem>
          </FooterList>
        </FooterSection>

        {/* Contact Information */}
        <FooterSection>
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
      <FooterBottom>
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
