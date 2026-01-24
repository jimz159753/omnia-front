import React from "react";
import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";

interface BusinessLogoProps {
  logo?: string | null;
  name?: string;
}

/**
 * Business logo display component
 * Follows SRP - Only responsible for displaying business logo/name
 */
export const BusinessLogo: React.FC<BusinessLogoProps> = ({ logo, name }) => {
  if (logo) {
    return (
      <div className="relative h-16 w-32">
        <Image
          src={logo}
          alt={name || "Business logo"}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
        <FiShoppingBag className="w-6 h-6 text-white" />
      </div>
      <span className="text-xl font-bold text-gray-900">{name || "Business"}</span>
    </div>
  );
};
