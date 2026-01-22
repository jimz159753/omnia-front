"use client";
import { useState } from "react";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { useAuth } from "@/hooks/useAuth";
import { FiLogOut, FiDollarSign } from "react-icons/fi";
import { CashRegisterDialog } from "@/components/dialogs/CashRegisterDialog";

const Header = () => {
  const { user, logout } = useAuth();
  const [cashRegisterOpen, setCashRegisterOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="bg-white flex items-center px-8 py-6 sticky top-0 z-50 w-full">
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
            <div className="flex items-center gap-4">
              {/* Cash Register Button */}
              <button
                onClick={() => setCashRegisterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:border-brand-300 transition-colors"
              >
                <FiDollarSign className="w-4 h-4" />
                <span>Caja</span>
              </button>

              <p className="text-sm text-cabinet-grotesk tracking-wide text-gray-600">
                {user.email}
              </p>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
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
