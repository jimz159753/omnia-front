import { ListItemIcon } from "@mui/material";
import React from "react";
import { StyledMenuItem, StyledTypography } from "./ListSection.styles";
import { Icon } from "@iconify/react";
import { TabContext } from "@/contexts/TabContext";
import { TabNames } from "@/constants";

interface ItemSectionProps {
  icon: string;
  title: string;
}

const ItemSection = ({ icon, title }: ItemSectionProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabContext);
  const tabName = title as TabNames;

  return (
    <StyledMenuItem
      onClick={() => setActiveTab(tabName)}
      sx={{ backgroundColor: activeTab === tabName ? "#E5E5E5" : "white" }}
    >
      <ListItemIcon>
        <Icon icon={icon} width="35" height="35" color="gray" />
      </ListItemIcon>
      <StyledTypography variant="body1">{title}</StyledTypography>
    </StyledMenuItem>
  );
};

export default ItemSection;
