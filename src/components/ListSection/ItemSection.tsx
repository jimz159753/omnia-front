import React from "react";
import { TabNames } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ItemSectionProps {
  icon: React.FC<{ size?: number }>;
  title: string;
}

const ItemSection = ({ title, icon: Icon }: ItemSectionProps) => {
  const tabName = title as TabNames;
  const pathname = usePathname();
  const itemPath = `/dashboard/${tabName.toLowerCase()}`;
  const isActive = pathname === itemPath;

  return (
    <li>
      <Link
        className={`w-full flex items-center px-4 py-3 transition-all duration-200 ${
          isActive
            ? "bg-gray-100 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        }`}
        href={`/dashboard/${tabName.toLowerCase()}`}
      >
        <div className="flex items-center justify-center w-9 h-9 mr-3">
          <Icon />
        </div>
        <p className="text-sm text-left">{title}</p>
      </Link>
    </li>
  );
};

export default ItemSection;
