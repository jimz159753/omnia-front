"use client";

import type { IconType } from "react-icons";
import { FiCalendar, FiShoppingBag, FiUserPlus } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

type AddNewButtonItem = {
  value: "appointment" | "sale" | "client";
  labelKey: string;
  icon: IconType;
  className: string;
  colorBg: string;
  hoverBg: string;
  iconColor: string;
  hoverRing: string;
};

const addNewButtonItems: AddNewButtonItem[] = [
  {
    value: "client",
    labelKey: "client",
    icon: FiUserPlus,
    className: "rounded-l-2xl",
    colorBg: "bg-omnia-blue/10",
    hoverBg: "hover:bg-omnia-blue/20",
    iconColor: "text-omnia-blue",
    hoverRing: "hover:ring-omnia-blue",
  },
  {
    value: "appointment",
    labelKey: "appointment",
    icon: FiCalendar,
    className: "rounded-none",
    colorBg: "bg-omnia-navy/10",
    hoverBg: "hover:bg-omnia-navy/20",
    iconColor: "text-omnia-navy",
    hoverRing: "hover:ring-omnia-navy",
  },
  {
    value: "sale",
    labelKey: "sale",
    icon: FiShoppingBag,
    className: "rounded-r-2xl",
    colorBg: "bg-amber-500/10",
    hoverBg: "hover:bg-amber-500/20",
    iconColor: "text-amber-600",
    hoverRing: "hover:ring-amber-500",
  },
];

interface AddNewButtonsProps {
  onSelect: (value: "appointment" | "sale" | "client") => void;
}

export function AddNewButtons({ onSelect }: AddNewButtonsProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-center mx-auto gap-1">
      {addNewButtonItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            aria-label={t(item.labelKey)}
            onClick={() => onSelect(item.value)}
            className={`
              ${item.className}
              h-44 w-36 flex flex-col items-center justify-center gap-6
              bg-white border border-omnia-navy/5 shadow-sm
              transition-all duration-300 
              ring-0 ring-transparent hover:ring-2 hover:ring-offset-2
              ${item.hoverRing}
              hover:shadow-md hover:-translate-y-1
            `}
          >
            <div
              className={`${item.colorBg} rounded-2xl h-16 w-16 flex items-center justify-center transition-transform group-hover:scale-110`}
            >
              <Icon className={`${item.iconColor}`} size={28} />
            </div>

            <p className="text-sm font-bold text-omnia-dark uppercase tracking-wide">{t(item.labelKey)}</p>
          </button>
        );
      })}
    </div>
  );
}
