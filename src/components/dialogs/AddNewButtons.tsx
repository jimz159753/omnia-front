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
    value: "appointment",
    labelKey: "appointment",
    icon: FiCalendar,
    className: "rounded-r-none",
    colorBg: "bg-blue-500/20",
    hoverBg: "hover:bg-blue-500/30",
    iconColor: "text-blue-500",
    hoverRing: "hover:ring-blue-500",
  },
  {
    value: "sale",
    labelKey: "sale",
    icon: FiShoppingBag,
    className: "rounded-none",
    colorBg: "bg-green-500/20",
    hoverBg: "hover:bg-green-500/30",
    iconColor: "text-green-500",
    hoverRing: "hover:ring-green-500",
  },
  {
    value: "client",
    labelKey: "client",
    icon: FiUserPlus,
    className: "rounded-l-none",
    colorBg: "bg-purple-500/20",
    hoverBg: "hover:bg-purple-500/30",
    iconColor: "text-purple-500",
    hoverRing: "hover:ring-purple-500",
  },
];

interface AddNewButtonsProps {
  onSelect: (value: "appointment" | "sale" | "client") => void;
}

export function AddNewButtons({ onSelect }: AddNewButtonsProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-center mx-auto gap-0">
      {addNewButtonItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            aria-label={t(item.labelKey)}
            onClick={() => onSelect(item.value)}
            className={`
              ${item.className}
              h-48 w-36 flex flex-col items-center justify-between py-10 
              rounded-lg transition-all duration-300 
              ring-0 ring-transparent hover:ring-2 hover:ring-offset-2
              ${item.hoverRing}
              ${item.hoverBg}
            `}
          >
            <div
              className={`${item.colorBg} rounded-full h-14 w-14 flex items-center justify-center`}
            >
              <Icon className={`${item.iconColor}`} size={24} />
            </div>

            <p className="text-sm font-semibold">{t(item.labelKey)}</p>
          </button>
        );
      })}
    </div>
  );
}
