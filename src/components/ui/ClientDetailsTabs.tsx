"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ClientTab = "new" | "existing";

interface ClientDetailsTabsProps {
  activeTab: ClientTab;
  onChange: (tab: ClientTab) => void;
  existingCount: number;
}

export const ClientDetailsTabs: React.FC<ClientDetailsTabsProps> = ({
  activeTab,
  onChange,
  existingCount,
}) => (
  <Tabs value={activeTab} onValueChange={(value) => onChange(value as ClientTab)}>
    <TabsList className="border border-gray-200 rounded-md p-1 bg-white">
      <TabsTrigger value="new" className="rounded-md">
        <span className="px-4 py-2 text-sm font-medium">New Client</span>
      </TabsTrigger>
      <TabsTrigger value="existing" className="rounded-md">
        <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
          Existing Client
          <span className="text-xs text-gray-500">({existingCount})</span>
        </span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

export default ClientDetailsTabs;


