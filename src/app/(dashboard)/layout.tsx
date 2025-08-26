"use client";
import { StyledContainer, StyledGrid } from "@/app/page.styles";
import { Grid } from "@mui/material";
import { createContext, useState } from "react";
import { items, userInfo } from "@/mock/data";
import { Routes } from "@/app/dashboard/routes";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import { TabNames } from "@/constants";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

const cache = createCache({ key: "css", prepend: true });

export const TabContext = createContext<{
  activeTab: TabNames;
  setActiveTab: React.Dispatch<React.SetStateAction<TabNames>>;
}>({
  activeTab: TabNames.Clients,
  setActiveTab: () => {},
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabNames>(TabNames.Clients);
  return (
    <CacheProvider value={cache}>
      <TabContext.Provider value={{ activeTab, setActiveTab }}>
        <StyledGrid>
          <Header />
          <Grid display="flex" container>
            <SideBar userInfo={userInfo} items={items} />
            <Grid
              size={10}
              sx={{
                backgroundColor: "#F1F1F1",
                height: "100vh",
                borderRadius: "8px 0 0 0",
              }}
            >
              <StyledContainer>
                <Routes />
              </StyledContainer>
            </Grid>
          </Grid>
        </StyledGrid>
      </TabContext.Provider>
    </CacheProvider>
  );
};

export default Dashboard;
