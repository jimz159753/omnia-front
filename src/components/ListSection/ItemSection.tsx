import React from "react";
import { TabContext } from "@/contexts/TabContext";
import { TabNames } from "@/constants";

interface ItemSectionProps {
  icon: React.FC<{ size?: number }>;
  title: string;
}

const ItemSection = ({ title, icon: Icon }: ItemSectionProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabContext);
  const tabName = title as TabNames;
  const isActive = activeTab === tabName;

  return (
    <li>
      <button
        className={`w-full flex items-center px-4 py-3 transition-all duration-200 ${
          isActive
            ? "bg-gray-100 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }`}
        onClick={() => setActiveTab(tabName)}
      >
        <div className="flex items-center justify-center w-9 h-9 mr-3">
          <Icon />
        </div>
        <p className="text-sm text-left">{title}</p>
      </button>
    </li>
  );
};

export default ItemSection;
