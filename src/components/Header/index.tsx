"use client";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-white flex items-center px-8 py-6 shadow-soft sticky top-0 z-50 w-full">
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
          <>
            <p className="text-sm text-cabinet-grotesk tracking-wide">
              Welcome, {user.email}
            </p>
            <button onClick={handleLogout}>
              <LogOut strokeWidth={1.5} className="text-rose-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
