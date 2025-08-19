import { Box, styled } from "@mui/material";

export const StyledNavbar = styled(Box)(() => ({
  flexGrow: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 10px",
  backgroundColor: "#c7c3b7",
  color: "#ffffff",
}));

export const StyledUl = styled(Box)(() => ({
  display: "flex",
  padding: 15,
  width: "20%",
  justifyContent: "space-between",
}));
