"use client";
import React, { useRef, useState, useEffect } from "react";
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
  const [currentYear, setCurrentYear] = useState(2024); // Static fallback

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      // Get the navbar element to calculate its actual height
      const navbar = document.querySelector("[data-navbar]") as HTMLElement;
      const navbarHeight = navbar ? navbar.offsetHeight : 80; // Fallback height

      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect + window.pageYOffset - navbarHeight;

      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
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
    <footer
      id="contacto"
      ref={footerRef}
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "#ffffff",
        padding: "4rem 0 2rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="footer-container">
        {/* Company Information */}
        <div className="footer-section">
          <div className="footer-logo">
            <Image src={omniaLogo} alt="Omnia" width={150} />
          </div>
          <p className="footer-text">
            Descubre el poder de la transformación personal a través de nuestros
            servicios especializados en bienestar, masajes y terapias
            holísticas.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginTop: "1rem",
            }}
          >
            <a
              style={{ cursor: "pointer" }}
              href="https://wa.me/+523333906945"
              target="_blank"
            >
              <Image src={whatsapp} alt="Whatsapp" width={24} height={24} />
            </a>
            <a
              style={{ cursor: "pointer" }}
              href="https://www.instagram.com/omniaespacio_"
              target="_blank"
            >
              <Image src={instagram} alt="Instagram" width={24} height={24} />
            </a>
            <a
              style={{ cursor: "pointer" }}
              href="https://www.tiktok.com/@omniaespacio"
              target="_blank"
            >
              <Image src={tiktok} alt="Tiktok" width={24} height={24} />
            </a>
          </div>
        </div>

        {/* Services */}
        <div className="footer-section">
          <div className="footer-title">Nuestros Servicios</div>
          <div className="footer-list">
            <div className="footer-list-item">
              <a className="footer-link" href="#masajes">
                Masajes Terapéuticos
              </a>
            </div>
            <div className="footer-list-item">
              <a className="footer-link" href="#terapias">
                Terapias Holísticas
              </a>
            </div>
            <div className="footer-list-item">
              <a className="footer-link" href="#bienestar">
                Bienestar Integral
              </a>
            </div>
            <div className="footer-list-item">
              <a className="footer-link" href="#spa">
                Spa & Relajación
              </a>
            </div>
            <div className="footer-list-item">
              <a className="footer-link" href="#renta">
                Renta de espacios
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <div className="footer-title">Enlaces Rápidos</div>
          <div className="footer-list">
            <div className="footer-list-item">
              <a
                className="footer-link"
                href="#home"
                onClick={(e) => handleNavClick(e, "home")}
              >
                Inicio
              </a>
            </div>
            <div className="footer-list-item">
              <a
                className="footer-link"
                href="#conocenos"
                onClick={(e) => handleNavClick(e, "conocenos")}
              >
                Conocenos
              </a>
            </div>
            <div className="footer-list-item">
              <a
                className="footer-link"
                href="#servicios"
                onClick={(e) => handleNavClick(e, "servicios")}
              >
                Servicios
              </a>
            </div>
            <div className="footer-list-item">
              <a
                className="footer-link"
                href="#espacios"
                onClick={(e) => handleNavClick(e, "espacios")}
              >
                Espacios
              </a>
            </div>
            <div className="footer-list-item">
              <a
                className="footer-link"
                href="#reservas"
                onClick={(e) => handleNavClick(e, "reservas")}
              >
                Reservas
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <div className="footer-title">Información de Contacto</div>
          <div className="footer-list">
            <div className="footer-list-item">
              <p className="footer-text">
                Calle Prisciliano Sanchez #762
                <br />
                Col. Americana, 44160
              </p>
            </div>
            <div className="footer-list-item">
              <a className="footer-link" href="https://wa.me/+523333906945">
                +52 (33) 33906945
              </a>
            </div>
            <div className="footer-list-item">
              <p className="footer-text">
                Lun - Sáb: 9:00 AM - 8:00 PM
                <br />
                Domingo: Cerrado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom footer-section">
        <div className="footer-copyright">
          © {currentYear} Omnia. Todos los derechos reservados.
        </div>
        <div
          className="footer-list"
          style={{ display: "flex", flexDirection: "row", gap: "2rem" }}
        >
          <div className="footer-list-item">
            <p className="footer-text">Política de Privacidad</p>
          </div>
          <div className="footer-list-item">
            <p className="footer-text">Términos de Servicio</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
