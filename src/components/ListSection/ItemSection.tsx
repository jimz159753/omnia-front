import React from "react";
import { CustomTypography } from "../ui/CustomTypography";
import { TabContext } from "@/contexts/TabContext";
import { TabNames } from "@/constants";
import { ArrowRight } from "akar-icons";

interface ItemSectionProps {
  icon: string;
  title: string;
}

const ItemSection = ({ title }: ItemSectionProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabContext);
  const tabName = title as TabNames;
  const isActive = activeTab === tabName;

  return (
    <li className="px-4 py-2">
      <button
        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gray-100 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }`}
        onClick={() => setActiveTab(tabName)}
      >
        <div className="flex items-center justify-center w-9 h-9 mr-3">
          <ArrowRight />
        </div>
        <CustomTypography variant="body1" className="font-medium text-left">
          {title}
        </CustomTypography>
      </button>
    </li>
  );
};

export default ItemSection;
