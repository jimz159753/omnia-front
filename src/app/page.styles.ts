import { Container, Grid, styled } from "@mui/material";

export const StyledGrid = styled(Grid)(() => ({
  backgroundColor: "#F1F1F1",
  display: "flex",
  flexDirection: "column",
}));

export const StyledContainer = styled(Container)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  margin: 0,
  padding: 2,
  "&.MuiContainer-root": { maxWidth: "100vw" },
}));
