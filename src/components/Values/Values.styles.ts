import { Theme } from "@mui/material";

export const getValuesStyles = (theme: Theme, isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "0" : "60px",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? "20px 20px" : "100px 20px",
    backgroundColor: "#fafafa",
  } as const,

  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "20px",
    padding: "32px",
    minHeight: "400px",
  } as const,

  image: {
    width: "110px",
    height: "110px",
    objectFit: "contain",
  } as const,

  title: {
    fontSize: isMobile ? "24px" : "30px",
    fontWeight: "normal",
    color: "#B09172",
    margin: "0",
    fontFamily: "var(--font-lora-italic)",
    textAlign: "center",
    width: "100%",
  } as const,

  description: {
    fontSize: isMobile ? "14px" : "16px",
    fontFamily: "var(--font-cabinet-grotesk)",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.625",
    textAlign: "center",
    width: "100%",
  } as const,
});
