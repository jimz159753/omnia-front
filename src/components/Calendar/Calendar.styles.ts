export const calendarStyles = (isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "20px" : "30px",
    padding: isMobile ? "30px 0" : "50px 0",
    backgroundColor: "#F8F6F3",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "16px" : "20px",
    alignItems: "center" as const,
    textAlign: "center" as const,
  },
  title: {
    width: "100%",
    fontSize: isMobile ? "30px" : "50px",
    color: "#86694B",
    margin: "0px",
    fontFamily: "var(--font-lora-regular)",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: isMobile ? "16px" : "18px",
    color: "#333",
    margin: "0px",
    fontFamily: "var(--font-cabinet-grotesk)",
    maxWidth: "600px",
    lineHeight: "1.6",
  },
  calendarContainer: {
    display: "flex",
    justifyContent: "center" as const,
    width: "100%",
  },
  calendar: {
    borderRadius: isMobile ? "0" : "15px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "800px",
  },
});
