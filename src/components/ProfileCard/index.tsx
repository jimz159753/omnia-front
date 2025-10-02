import React from "react";
import { CustomAvatar } from "../ui/CustomAvatar";
import { CustomTypography } from "../ui/CustomTypography";

interface ProfileCardProps {
  imgSrc: string;
  name: string;
  email: string;
}

export const ProfileCard = ({ imgSrc, name, email }: ProfileCardProps) => {
  return (
    <div className="flex items-center p-6 border-b border-gray-200">
      <CustomAvatar
        src={imgSrc}
        alt="Omnia"
        className="w-15 h-15 rounded-full"
      />
      <div className="ml-4">
        <CustomTypography variant="h6" className="font-bold text-gray-900">
          {name}
        </CustomTypography>
        <CustomTypography variant="body2" className="text-gray-500 text-sm">
          {email}
        </CustomTypography>
      </div>
    </div>
  );
};
