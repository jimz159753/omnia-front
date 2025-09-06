import { Box, styled } from "@mui/material";

export const FooterContainer = styled(Box)(() => ({
  background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  color: "#ffffff",
  padding: "4rem 0 2rem",
  marginTop: "4rem",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
}));

export const FooterContent = styled(Box)(() => ({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 2rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "3rem",
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
    gap: "2rem",
    padding: "0 1rem",
  },
}));

export const FooterSection = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

export const FooterTitle = styled(Box)(() => ({
  fontFamily: "var(--font-lora-regular)",
  fontSize: "1.2rem",
  fontWeight: 500,
  marginBottom: "1rem",
  color: "#f8f8f8",
  position: "relative",
}));

export const FooterText = styled(Box)(() => ({
  fontFamily: "var(--font-cabinet-grotesk)",
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#cccccc",
  margin: 0,
}));

export const FooterLink = styled("a")(() => ({
  fontFamily: "var(--font-cabinet-grotesk)",
  fontSize: "16px",
  color: "#cccccc",
  textDecoration: "none",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
}));

export const FooterList = styled(Box)(() => ({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
}));

export const FooterListItem = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
}));

export const SocialLinks = styled(Box)(() => ({
  display: "flex",
  gap: "1.5rem",
  marginTop: "1rem",
}));

export const SocialLink = styled("a")(() => ({
  cursor: "pointer",
}));

export const FooterBottom = styled(Box)(() => ({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "2rem 2rem 0",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  marginTop: "3rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  "@media (max-width: 768px)": {
    flexDirection: "column",
    gap: "1rem",
    textAlign: "center",
    padding: "2rem 1rem 0",
  },
}));

export const Copyright = styled(Box)(() => ({
  fontFamily: "var(--font-cabinet-grotesk)",
  fontSize: "0.9rem",
  color: "#999999",
  margin: 0,
}));

export const FooterLogo = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "0.5rem",
}));
