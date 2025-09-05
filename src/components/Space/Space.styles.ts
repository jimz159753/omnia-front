export const getSpaceStyles = (isMobile: boolean) => ({
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "30px" : "50px",
    backgroundColor: "#86694B",
    padding: isMobile ? "30px" : "50px",
    marginBottom: isMobile ? "30px" : "50px",
  },
  title: {
    width: "100%",
    fontSize: isMobile ? "30px" : "50px",
    color: "#fff",
    margin: "0px",
    fontFamily: "var(--font-lora-regular)",
    textAlign: "center" as const,
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "15px" : "20px",
  },
  row: {
    display: "flex",
    flexWrap: isMobile ? ("wrap" as const) : ("nowrap" as const),
    flexDirection: isMobile ? ("column" as const) : ("row" as const),
    gap: isMobile ? "15px" : "20px",
    minHeight: "fit-content",
    width: "100%",
  },
  card: {
    border: "1px solid black",
    borderRadius: "8px",
    width: "100%",
    height: "100%",
  },
  card40: {
    width: isMobile ? "100%" : "40%",
    borderRadius: isMobile ? "15px" : "20px",
    height: "100%",
    backgroundColor: "#B09172",
  },
  cardText: {
    fontSize: isMobile ? "30px" : "40px",
    fontWeight: "normal",
    color: "#fff",
    margin: "0px",
    fontFamily: "var(--font-lora-italic)",
  },
  cardTextContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? "15px" : "20px",
    padding: isMobile ? "30px" : "50px",
  },
  cardTextDescription: {
    fontSize: isMobile ? "16px" : "18px",
    color: "#fff",
    margin: "0px",
    fontFamily: "var(--font-cabinet-grotesk)",
  },
  space1: {
    width: isMobile ? "100%" : "60%",
    borderRadius: isMobile ? "15px" : "20px",
    height: isMobile ? "200px" : "auto",
    backgroundImage:
      "url(https://images.pexels.com/photos/4723114/pexels-photo-4723114.jpeg)",
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
  },
  space2: {
    width: isMobile ? "100%" : "60%",
    borderRadius: isMobile ? "15px" : "20px",
    height: isMobile ? "200px" : "420px",
    backgroundImage:
      "url(https://images.pexels.com/photos/6015101/pexels-photo-6015101.jpeg)",
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
  },
  space3: {
    width: isMobile ? "100%" : "40%",
    borderRadius: isMobile ? "15px" : "20px",
    height: isMobile ? "200px" : "420px",
    backgroundImage:
      "url(https://images.pexels.com/photos/4723158/pexels-photo-4723158.jpeg)",
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
  },
});
