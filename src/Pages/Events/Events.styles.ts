import { Box } from "@mui/material";
import { styled, Typography } from "@mui/material";

export const StyledTypography = styled(Typography)(() => ({
  borderRadius: "8px",
  border: "1px solid #ccc",
  padding: "5px",
  textAlign: "center",
  width: "fit-content",
}));

export const StyledBox = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  justifyContent: "center",
  alignItems: "center",
  marginY: "10px",
}));
