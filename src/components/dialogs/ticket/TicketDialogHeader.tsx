import React from "react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FiDownload, FiMail, FiX } from "react-icons/fi";

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
    <DialogHeader className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-3">{title}</DialogTitle>
        <div className="flex items-center gap-3">
          <ActionButton
            icon={<FiDownload />}
            label={pdfLabel}
            onClick={onDownloadPdf}
          />
          <ActionButton
            icon={isEmailLoading ? <LoadingSpinner /> : <FiMail />}
            label={isEmailLoading ? "Enviando..." : emailLabel}
            onClick={onSendEmail}
            disabled={isEmailLoading}
          />
          <DialogClose asChild>
            <FiX className="h-5 w-5 text-gray-500 cursor-pointer" />
          </DialogClose>
        </div>
      </div>
    </DialogHeader>
  );
};

/**
 * Simple loading spinner component
 */
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
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
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-1.5 transition-colors ${
        disabled
          ? "text-gray-400 cursor-not-allowed bg-gray-50"
          : "text-gray-900 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};
