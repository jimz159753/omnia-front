export const getAboutStyles = (theme: any, isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "50px" : "100px",
    justifyContent: "space-between",
    padding: isMobile ? "50px" : "100px",
  } as const,

  title: {
    width: isMobile ? "100%" : "90%",
    fontSize: isMobile ? "30px" : "50px",
    color: "#788D9A",
    margin: "0px",
    fontFamily: "var(--font-lora-regular)",
    textAlign: isMobile ? "center" : "left",
  } as const,

  contentWrapper: {
    width: isMobile ? "100%" : "50%",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: isMobile ? "center" : "end",
  } as const,

  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    overflow: "hidden",
    maxWidth: "100%",
  } as const,

  buttonContact: {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 20px",
    borderRadius: "20px",
    border: "1px solid #788D9A",
    cursor: "pointer",
    color: "#788D9A",
    textDecoration: "none",
    fontSize: "18px",
    fontFamily: "var(--font-cabinet-grotesk)",
  } as const,

  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: isMobile ? "center" : "start",
    gap: isMobile ? "40px" : "20px",
  } as const,
});
