import { Box, styled } from "@mui/material";

export const StyledBoxContainer = styled(Box)(() => ({
  padding: '20px',
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: '20px !important',
  borderRadius: '8px !important',
  border: "1px solid #ccc !important",
}));

export const StyledBoxInputContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: '20px !important',
  justifyContent: "space-between",
}));

export const StyledBoxButtonContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  gap: '20px !important',
}));
