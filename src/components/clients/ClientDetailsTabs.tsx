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
  <Tabs
    value={activeTab}
    onValueChange={(value) => onChange(value as ClientTab)}
  >
    <TabsList className="bg-background justify-start rounded-none border-b p-0">
      <TabsTrigger
        value="new"
        className="bg-background border-b-border dark:data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background h-full rounded-none rounded-t border border-transparent data-[state=active]:-mb-0.5 data-[state=active]:shadow-none dark:border-b-0 dark:data-[state=active]:-mb-0.5"
      >
        <span className="flex items-center gap-2">New Client</span>
      </TabsTrigger>
      <TabsTrigger
        value="existing"
        className="bg-background border-b-border dark:data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background h-full rounded-none rounded-t border border-transparent data-[state=active]:-mb-0.5 data-[state=active]:shadow-none dark:border-b-0 dark:data-[state=active]:-mb-0.5"
      >
        <span className="flex items-center gap-2">
          Existing Client
          <span className="text-xs text-gray-500">({existingCount})</span>
        </span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

export default ClientDetailsTabs;
