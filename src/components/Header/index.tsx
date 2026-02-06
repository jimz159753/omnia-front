"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { FiLogOut, FiDollarSign, FiUser, FiSettings, FiChevronDown } from "react-icons/fi";
import { CashRegisterDialog } from "@/components/dialogs/CashRegisterDialog";

const Header = () => {
  const { user, logout } = useAuth();
  const { business } = useBusiness();
  const [cashRegisterOpen, setCashRegisterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <div className="bg-white flex items-center px-8 py-4 sticky top-0 z-50 w-full border-b border-gray-100">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            {business?.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={business.logo}
                alt={business.name || "Business Logo"}
                className="h-9 w-auto object-contain transition-transform duration-200 ease-in-out hover:scale-105"
              />
            ) : (
              <Image
                src={OmniaTitle}
                alt="Omnia"
                height={36}
                className="transition-transform duration-200 ease-in-out hover:scale-105"
              />
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              {/* Cash Register Button */}
              <button
                onClick={() => setCashRegisterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-omnia-blue bg-omnia-blue/10 border border-omnia-blue/20 rounded-xl hover:bg-omnia-blue/20 transition-all font-display shadow-sm"
              >
                <FiDollarSign className="w-4 h-4" />
                <span>Caja</span>
              </button>

              {/* User Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || user.email}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-omnia-navy flex items-center justify-center text-white font-bold text-sm shadow-md shadow-omnia-navy/20">
                      {getUserInitials()}
                    </div>
                  )}
                  <FiChevronDown 
                    className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || user.email}
                            width={44}
                            height={44}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-omnia-navy flex items-center justify-center text-white font-bold">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {user.name && (
                            <p className="font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        href="/dashboard/settings/business-details"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiSettings className="w-4 h-4 text-gray-400" />
                        <span>Configuración</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cash Register Dialog */}
      <CashRegisterDialog
        open={cashRegisterOpen}
        onOpenChange={setCashRegisterOpen}
        userId={user?.id}
      />
    </>
  );
};

export default Header;
