"use client";
import { StyledContainer, StyledGrid } from "@/app/page.styles";
import { Grid, Box } from "@mui/material";
import { createContext, useState, useEffect } from "react";
import { items, userInfo } from "@/mock/data";
import { Routes } from "./routes";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { TabNames } from "@/constants";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <div>Loading...</div>
      </Box>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
