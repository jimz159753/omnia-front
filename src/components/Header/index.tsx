"use client";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { useAuth } from "@/hooks/useAuth";
import { CustomButton } from "../ui/CustomButton";
import { CustomTypography } from "../ui/CustomTypography";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-white flex items-center px-8 py-6 shadow-soft border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm w-full">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <Image
            src={OmniaTitle}
            alt="Omnia"
            height={40}
            className="transition-transform duration-200 ease-in-out hover:scale-105"
          />
        </div>

        {user && (
          <div className="flex items-center gap-6">
            <CustomTypography
              variant="body2"
              className="text-sm font-medium tracking-wide text-gray-500"
            >
              Welcome, {user.email}
            </CustomTypography>
            <CustomButton
              onClick={handleLogout}
              className="min-w-20 h-9 text-sm font-semibold border-2 border-slate-700 rounded-md bg-transparent text-slate-700 cursor-pointer transition-all duration-200 ease-in-out hover:border-slate-600 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-medium"
            >
              Logout
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
