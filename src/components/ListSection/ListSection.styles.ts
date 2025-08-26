import { MenuItem, styled, Typography } from "@mui/material";

export const StyledMenuItem = styled(MenuItem)(() => ({
  padding: "20px 25%",
  width: "100%",
  gap: "15px",
  justifyContent: "flex-start",
  textTransform: "none",
}));

export const StyledTypography = styled(Typography)(() => ({
  fontWeight: "bold",
  textAlign: "left",
  color: "#000000",
}));
