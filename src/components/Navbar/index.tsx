"use client";

import { useState } from "react";
import Image from "next/image";
import espacio_omnia from "@/assets/images/espacio_omnia.webp";
import { StyledNavbar, StyledUl } from "./Navbar.styles";
import { navigationItems } from "@/constants";
import { useSafeMediaQuery } from "@/hooks/useMediaQuery";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mounted: isClient, isMatch: isMobile } =
    useSafeMediaQuery("(max-width: 600px)");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
    closeMobileMenu();
  };

  return (
    <StyledNavbar isMobile={isMobile}>
      <Image src={espacio_omnia} alt="omnia" width={200} height={32} priority />

      {/* Desktop Navigation */}
      {!isMobile && isClient && (
        <StyledUl>
          {navigationItems.map((item) => (
            <li key={item.id} style={{ listStyle: "none" }}>
              <a
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontFamily: "var(--font-cabinet-grotesk)",
                }}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </StyledUl>
      )}

      {/* Mobile Menu Button */}
      {isMobile && isClient && (
        <button
          onClick={toggleMobileMenu}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          ☰
        </button>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            height: "100vh",
          }}
        >
          <button
            onClick={closeMobileMenu}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "32px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "24px",
                fontFamily: "var(--font-cabinet-grotesk)",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#ccc")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "white")
              }
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </StyledNavbar>
  );
};

export default Navbar;
