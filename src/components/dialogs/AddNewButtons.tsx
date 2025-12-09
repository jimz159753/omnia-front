"use client";

import type { IconType } from "react-icons";
import { FiCalendar, FiShoppingBag, FiUserPlus } from "react-icons/fi";

type AddNewButtonItem = {
  value: string;
  label: string;
  icon: IconType;
  className: string;
  colorBg: string;
  hoverBg: string;
  iconColor: string;
  hoverRing: string;
};

export const addNewButtonItems: AddNewButtonItem[] = [
  {
    value: "appointment",
    label: "Appointment",
    icon: FiCalendar,
    className: "rounded-r-none",
    colorBg: "bg-blue-500/20",
    hoverBg: "hover:bg-blue-500/30",
    iconColor: "text-brand-500",
    hoverRing: "hover:ring-blue-500",
  },
  {
    value: "sale",
    label: "Sale",
    icon: FiShoppingBag,
    className: "rounded-none",
    colorBg: "bg-green-500/20",
    hoverBg: "hover:bg-green-500/30",
    iconColor: "text-green-500",
    hoverRing: "hover:ring-green-500",
  },
  {
    value: "client",
    label: "Client",
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
  return (
    <div className="flex justify-center gap-0">
      {addNewButtonItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            aria-label={item.label}
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

            <p className="text-sm font-semibold">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}
