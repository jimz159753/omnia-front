import React from "react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FiDownload, FiMail, FiX, FiLoader } from "react-icons/fi";

interface TicketDialogHeaderProps {
  title: string;
  onDownloadPdf?: () => void;
  onSendEmail?: () => void;
  pdfLabel: string;
  emailLabel: string;
  isEmailLoading?: boolean;
}

/**
 * Header component for ticket dialog
 * Follows SRP - Only responsible for rendering the header with actions
 */
export const TicketDialogHeader: React.FC<TicketDialogHeaderProps> = ({
  title,
  onDownloadPdf,
  onSendEmail,
  pdfLabel,
  emailLabel,
  isEmailLoading = false,
}) => {
  return (
    <DialogHeader className="bg-gradient-to-r from-brand-500 to-brand-600 p-5 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-white font-semibold text-lg">
          {title}
        </DialogTitle>
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<FiDownload className="w-4 h-4" />}
            label={pdfLabel}
            onClick={onDownloadPdf}
            variant="secondary"
          />
          <ActionButton
            icon={
              isEmailLoading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiMail className="w-4 h-4" />
              )
            }
            label={isEmailLoading ? "..." : emailLabel}
            onClick={onSendEmail}
            disabled={isEmailLoading}
            variant="secondary"
          />
          <DialogClose asChild>
            <button className="p-2 rounded-lg hover:bg-white/20 transition-colors">
              <FiX className="h-5 w-5 text-white" />
            </button>
          </DialogClose>
        </div>
      </div>
    </DialogHeader>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

/**
 * Reusable action button component
 * Follows DRY - Extracted repeated button pattern
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = "primary",
}) => {
  const baseClasses =
    "text-sm font-medium flex gap-2 items-center justify-center rounded-lg px-3 py-2 transition-all";

  const variantClasses =
    variant === "secondary"
      ? disabled
        ? "bg-white/10 text-white/50 cursor-not-allowed"
        : "bg-white/20 text-white hover:bg-white/30"
      : disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-white text-brand-600 hover:bg-gray-50 shadow-sm";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
