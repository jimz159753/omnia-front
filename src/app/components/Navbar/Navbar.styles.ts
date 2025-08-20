import { Box, styled } from "@mui/material";

export const StyledNavbar = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 10px",
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
  width: "20%",
  justifyContent: "space-between",
}));
