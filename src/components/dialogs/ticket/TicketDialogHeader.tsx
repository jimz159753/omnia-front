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
    <DialogHeader className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-5 rounded-t-2xl">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-white font-bold text-lg">
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
  variant = "secondary",
}) => {
  const baseClasses =
    "text-sm font-bold flex gap-2 items-center justify-center rounded-xl px-4 py-2 transition-all shadow-sm";

  const variantClasses =
    variant === "secondary"
      ? disabled
        ? "bg-white/10 text-white/50 cursor-not-allowed opacity-50"
        : "bg-white/20 text-white hover:bg-white/30 border border-white/10"
      : disabled
      ? "bg-omnia-navy/5 text-omnia-navy/20 cursor-not-allowed"
      : "bg-omnia-blue text-white hover:bg-omnia-blue/90 shadow-omnia-blue/20";

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

