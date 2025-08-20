export const aboutStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  title: {
    width: "100%",
    textAlign: "center" as const,
    fontSize: "50px",
    color: "#788D9A",
    margin: "0px",
    fontFamily: "var(--font-lora-regular)",
  },
  titleMobile: {
    fontSize: "30px",
  },
  description: {
    color: "#000",
    textAlign: "center" as const,
    fontSize: "16px",
    fontFamily: "var(--font-cabinet-grotesk)",
  },
  carouselContainer: {
    display: "flex",
    gap: "16px",
    flexDirection: "column" as const,
  },
};
