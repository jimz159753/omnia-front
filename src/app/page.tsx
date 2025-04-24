"use client";
import { Grid } from "@mui/material";
import { items, userInfo } from "@/mock/data";
import { StyledContainer, StyledGrid } from "./page.styles";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { createContext, useState } from "react";
import { Routes } from "@/routes";

export const TabContext = createContext<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}>({
  activeTab: "clients",
  setActiveTab: () => {},
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("Clients");

  return (
    <StyledGrid container>
      <Header />
      <TabContext.Provider value={{ activeTab, setActiveTab }}>
        <Grid display="flex">
          <SideBar userInfo={userInfo} items={items} />
          <Grid size={10} sx={{ backgroundColor: "#F1F1F1", height: "100vh", borderRadius: '8px 0 0 0' }}>
            <StyledContainer>
              <Routes />
            </StyledContainer>
          </Grid>
        </Grid>
      </TabContext.Provider>
    </StyledGrid>
  );
}
