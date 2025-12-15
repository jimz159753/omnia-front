import React from "react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FiDownload, FiMail, FiX } from "react-icons/fi";

interface TicketDialogHeaderProps {
  title: string;
  onDownloadPdf?: () => void;
  onSendEmail?: () => void;
  pdfLabel: string;
  emailLabel: string;
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
            icon={<FiMail />}
            label={emailLabel}
            onClick={onSendEmail}
          />
          <DialogClose asChild>
            <FiX className="h-5 w-5 text-gray-500 cursor-pointer" />
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
}

/**
 * Reusable action button component
 * Follows DRY - Extracted repeated button pattern
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
};
