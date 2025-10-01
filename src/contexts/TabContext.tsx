"use client";
import { createContext } from "react";
import { TabNames } from "@/constants";

export const TabContext = createContext<{
  activeTab: TabNames;
  setActiveTab: React.Dispatch<React.SetStateAction<TabNames>>;
}>({
  activeTab: TabNames.Sales,
  setActiveTab: () => {},
});
