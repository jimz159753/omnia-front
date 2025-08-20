import { Theme } from "@mui/material";

export const getAboutStyles = (theme: Theme, isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "100px",
    justifyContent: "space-between",
    padding: isMobile ? "50px" : "100px",
  } as const,

  title: {
    width: isMobile ? "100%" : "50%",
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
});
