import { ListItemIcon } from "@mui/material";
import React from "react";
import { StyledMenuItem, StyledTypography } from "./ListSection.styles";
import { Icon } from "@iconify/react";
import { TabContext } from "@/app/page";

interface ItemSectionProps {
  icon: string;
  title: string;
}

const ItemSection = ({ icon, title }: ItemSectionProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabContext);
  return (
    <StyledMenuItem onClick={() => setActiveTab(title)} sx={{ backgroundColor: activeTab === title ? "#E5E5E5" : "white" }}>
      <ListItemIcon>
        <Icon icon={icon} width="35" height="35" color="gray" />
      </ListItemIcon>
      <StyledTypography variant="body1">{title}</StyledTypography>
    </StyledMenuItem>
  );
};

export default ItemSection;
