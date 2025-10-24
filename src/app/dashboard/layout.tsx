"use client";
import { useState, useEffect } from "react";
import { items, userInfo } from "@/mock/data";
import { Routes } from "./routes";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { TabNames } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { TabContext } from "@/contexts/TabContext";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <CustomLoadingSpinner />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <SideBar userInfo={userInfo} items={items} />
          <div className="flex-1">
            <div className="flex flex-col justify-start items-stretch m-0 p-4 min-h-auto max-w-full">
              <Routes />
            </div>
          </div>
        </div>
      </div>
    </TabContext.Provider>
  );
};

export default Dashboard;
