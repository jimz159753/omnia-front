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
        className="w-full flex flex-col items-center px-4 py-3 transition-all duration-200"
        href={`/dashboard/${tabName.toLowerCase()}`}
      >
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-md ${
            isActive
              ? "bg-gray-200 text-[#06334A] shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-[#06334A]"
          }`}
        >
          <Icon size={24} />
        </div>
        <p className="text-sm">{title}</p>
      </Link>
    </li>
  );
};

export default ItemSection;
