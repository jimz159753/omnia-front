import React from "react";
import { TabNames } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface ItemSectionProps {
  icon: React.FC<{ size?: number }>;
  title: string;
}

const ItemSection = ({ title, icon: Icon }: ItemSectionProps) => {
  const { t } = useTranslation();
  const tabName = title as TabNames;
  const pathname = usePathname();
  const itemPath = `/dashboard/${tabName.toLowerCase()}`;
  const isActive = pathname.startsWith(itemPath);
  const translationKey = tabName.toLowerCase();

  return (
    <li>
      {title !== "line" ? (
        <Link
          className="w-full flex flex-col items-center px-4 py-3 transition-all duration-200 group"
          href={`/dashboard/${tabName.toLowerCase()}`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-md ${
              isActive
                ? "bg-brand-200 text-brand-600 shadow-sm"
                : "text-gray-700 hover:bg-brand-100 hover:text-brand-600"
            }`}
          >
            <div>
              <Icon size={24} />
            </div>
          </div>
          <p className="text-sm">{t(translationKey)}</p>
        </Link>
      ) : (
        <div className="mx-auto mt-4 border-b border-gray-300 w-12" />
      )}
    </li>
  );
};

export default ItemSection;
