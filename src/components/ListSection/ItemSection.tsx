import { ListItem } from "@mui/material";
import React from "react";
import { StyledButton, StyledTypography } from "./ListSection.styles";

interface ItemSectionProps {
  icon: React.ReactNode;
  title: string;
}

const ItemSection = ({ icon, title }: ItemSectionProps) => {
  return (
    <ListItem sx={{ padding: "0px", margin: "0px" }}>
      <StyledButton
        startIcon={icon}
      >
        <StyledTypography variant="body1">
          {title}
        </StyledTypography>
      </StyledButton>
    </ListItem>
  );
};

export default ItemSection;
