export const aboutStyles = (isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "16px" : "20px",
    padding: isMobile ? "30px 0" : "50px 0",
  },
  title: {
    width: "100%",
    textAlign: "center" as const,
    fontSize: isMobile ? "30px" : "50px",
    color: "#788D9A",
    margin: "0px",
    fontFamily: "var(--font-lora-regular)",
  },
  description: {
    color: "#000",
    textAlign: "center" as const,
    fontSize: isMobile ? "16px" : "18px",
    fontFamily: "var(--font-cabinet-grotesk)",
  },
  carouselContainer: {
    display: "flex",
    gap: isMobile ? "12px" : "16px",
    flexDirection: "column" as const,
  },
});
