import React from "react";
import { CustomAvatar } from "../ui/CustomAvatar";

interface ProfileCardProps {
  imgSrc: string;
  name: string;
}

export const ProfileCard = ({ imgSrc, name }: ProfileCardProps) => {
  return (
    <div className="flex items-center p-6 border-b border-gray-200">
      <CustomAvatar
        src={imgSrc}
        alt="Omnia"
        className="w-15 h-15 rounded-full"
      />
      <div className="ml-4">
        <p className="text-lg text-gray-900">{name}</p>
      </div>
    </div>
  );
};
