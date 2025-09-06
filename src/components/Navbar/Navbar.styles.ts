import { Box, styled } from "@mui/material";

export const StyledNavbar = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})<{ isMobile: boolean }>(({ isMobile }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: isMobile ? "15px" : "8px 15px",
  backgroundColor: "transparent",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  backdropFilter: "blur(10px)",
  color: "#ffffff",
}));

export const StyledUl = styled(Box)(() => ({
  display: "flex",
  padding: 15,
  width: "30%",
  justifyContent: "space-between",
}));
