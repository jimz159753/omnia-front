import { Theme } from "@mui/material";

export const getValuesStyles = (theme: Theme, isMobile: boolean) => ({
  container: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    gap: isMobile ? "0" : "60px",
    justifyContent: "center",
    alignItems: "start",
    padding: isMobile ? "50px" : "100px",
    backgroundColor: "#fafafa",
  } as const,

  card: {
    display: "grid",
    gap: isMobile ? "20px" : "40px",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "32px",
    minHeight: "400px",
  } as const,

  image: {
    width: "110px",
    height: "110px",
    objectFit: "contain",
    display: "block",
    justifySelf: "center",
    alignSelf: "center",
  } as const,

  title: {
    fontSize: isMobile ? "30px" : "50px",
    fontWeight: "normal",
    color: "#B09172",
    margin: "0",
    fontFamily: "var(--font-lora-italic)",
    textAlign: "center",
    width: "100%",
  } as const,

  description: {
    fontSize: isMobile ? "16px" : "18px",
    fontFamily: "var(--font-cabinet-grotesk)",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.625",
    textAlign: "center",
    width: "100%",
  } as const,
});
