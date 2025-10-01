import { Container, Grid, styled } from "@mui/material";

export const StyledGrid = styled(Grid)(() => ({
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

export const StyledContainer = styled(Container)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
  margin: 0,
  padding: 2,
  minHeight: "auto",
  "&.MuiContainer-root": { maxWidth: "100vw" },
}));
