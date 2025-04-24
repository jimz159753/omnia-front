import { Container, styled } from "@mui/material";

export const StyledContainer = styled(Container)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  margin: 0,
  padding: 2,
  "&.MuiContainer-root": { maxWidth: "100vw" },
}));
