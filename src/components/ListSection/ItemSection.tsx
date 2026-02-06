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
          className="w-full flex flex-col items-center px-2 py-2 transition-all duration-200 group"
          href={`/dashboard/${tabName.toLowerCase()}`}
        >
          <div
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-omnia-blue text-white shadow-lg shadow-omnia-blue/30"
                : "text-omnia-light/60 hover:text-white hover:bg-omnia-navy/60"
            }`}
          >
            {/* Active indicator glow */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl bg-omnia-blue/20 blur-md" />
            )}
            <div className="relative z-10">
              <Icon size={22} />
            </div>
          </div>
          <p 
            className={`text-xs mt-1.5 font-medium transition-colors duration-200 ${
              isActive 
                ? "text-omnia-blue" 
                : "text-omnia-light/50 group-hover:text-omnia-light/80"
            }`}
          >
            {t(translationKey)}
          </p>
        </Link>
      ) : (
        <div className="mx-auto my-3 w-10 h-px bg-omnia-navy" />
      )}
    </li>
  );
};

export default ItemSection;
