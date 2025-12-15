import React from "react";
import Image from "next/image";

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
      <div className="mb-4 relative h-20 w-40">
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
    <div className="mb-4 h-20 flex items-center justify-center">
      <p className="text-xl font-bold text-brand-500">{name || "Business"}</p>
    </div>
  );
};

