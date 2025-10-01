"use client";
import { Grid, Box, Container } from "@mui/material";
import { useState, useEffect } from "react";
import { items, userInfo } from "@/mock/data";
import { Routes } from "./routes";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { TabNames } from "@/constants";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { TabContext } from "@/contexts/TabContext";
import CircularProgress from "@mui/material/CircularProgress";

const cache = createCache({ key: "css", prepend: true });

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabNames>(TabNames.Sales);
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
        <CircularProgress color="inherit" />
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
        <Grid
          sx={{
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Header />
          <Grid display="flex" container>
            <SideBar userInfo={userInfo} items={items} />
            <Grid
              size={10}
              sx={{
                backgroundColor: "#F1F1F1",
                minHeight: "100vh",
                borderRadius: "8px 0 0 0",
              }}
            >
              <Container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                  margin: 0,
                  padding: 2,
                  minHeight: "auto",
                  "&.MuiContainer-root": { maxWidth: "100vw" },
                }}
              >
                <Routes />
              </Container>
            </Grid>
          </Grid>
        </Grid>
      </TabContext.Provider>
    </CacheProvider>
  );
};

export default Dashboard;
