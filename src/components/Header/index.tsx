"use client";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-white flex items-center px-8 py-6 shadow-soft border-b border-sky-950 sticky top-0 z-50 w-full">
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
            <p className="text-sm text-cabinet-grotesk tracking-wide text-blue-500">
              Welcome, {user.email}
            </p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
