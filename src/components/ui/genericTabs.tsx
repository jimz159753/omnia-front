"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ActiveTab } from "@/types/clients";

type TabItem = {
  label: string;
  value: ActiveTab;
  count?: number;
};

type Props = {
  tabs: TabItem[];
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

export const GenericTabs: React.FC<Props> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={(v: string) => onChange(v as ActiveTab)}>
      <TabsList className="bg-background justify-start rounded-none border-b p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            className="bg-background border-b-border dark:data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background h-full rounded-none rounded-t border border-transparent data-[state=active]:-mb-0.5 data-[state=active]:shadow-none dark:border-b-0 dark:data-[state=active]:-mb-0.5"
            key={tab.value}
            value={tab.value}
          >
            <span className="flex items-center gap-2">
              <span>{tab.label}</span>
              <Badge variant="secondary" className="min-w-[24px] justify-center">
                {tab.count ?? 0}
              </Badge>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

