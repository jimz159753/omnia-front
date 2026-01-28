"use client";

import React, { useCallback, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { TicketDialogHeader } from "./ticket/TicketDialogHeader";
import { BusinessLogo } from "./ticket/BusinessLogo";
import { TicketItems } from "./ticket/TicketItems";

import { useTranslation } from "@/hooks/useTranslation";
import { useBusiness } from "@/hooks/useBusiness";
import { formatTicketDateTime } from "@/lib/dateUtils";
import { downloadTicketPDF } from "@/lib/pdfUtils";
import { formatCurrency } from "@/utils";
import { toast } from "sonner";
import { getStatusBadgeClass, getStatusLabel } from "@/constants/status";
import {
  FiUser,
  FiHash,
  FiFileText,
  FiClock,
} from "react-icons/fi";

/**
 * Type definitions following TypeScript standards from guidelines
 */
interface TicketItem {
  quantity?: number;
  unitPrice?: number;
  total?: number;
  product?: { name?: string | null; price?: number | null } | null;
  service?: { name?: string | null; price?: number | null } | null;
}

interface TicketLike {
  id?: string;
  createdAt?: string | Date;
  startTime?: string | Date | null;
  quantity?: number;
  status?: string;
  notes?: string | null;
  client?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  staff?: { name?: string | null; email?: string | null };
  items?: TicketItem[];
  total?: number;
}

interface TicketDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: TicketLike | null;
}

/**
 * Ticket Details Dialog Component
 * Refactored following GUIDELINES.md principles:
 * - SRP: Separated concerns into smaller components
 * - DRY: Extracted reusable logic to hooks and utils
 * - KISS: Simplified main component logic
 * - Proper component structure: hooks → handlers → early returns → render
 */
export const TicketDetailsDialog: React.FC<TicketDetailsDialogProps> = ({
  open,
  onOpenChange,
  ticket,
}) => {
  // 1. Hooks (following proper order from guidelines)
  const { t, i18n } = useTranslation("sales");
  const currentLanguage = i18n.language || "en-US";
  const { business } = useBusiness(open);
  const { dateStr, timeStr } = formatTicketDateTime(ticket?.createdAt, currentLanguage);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Format appointment time if exists
  const appointmentTime = ticket?.startTime
    ? formatTicketDateTime(ticket.startTime, currentLanguage)
    : null;

  // 2. Event handlers (using useCallback for optimization)
  const handleDownloadPdf = useCallback(async () => {
    if (!ticket) {
      toast.error("No ticket data available");
      return;
    }

    try {
      await downloadTicketPDF(ticket, business || {}, {
        ticketDetails: t("ticketDetails"),
        ticketID: t("ticketID"),
        clientLabel: t("clientLabel"),
        staffLabel: t("staffLabel"),
        itemsLabel: t("itemsLabel"),
        qtyLabel: t("qtyLabel"),
        itemsEmpty: t("itemsEmpty"),
        totalLabel: t("totalLabel"),
        thanks: t("thanks"),
      });
      toast.success(t("pdfDownloadSuccess") || "PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error(t("pdfDownloadError") || "Failed to download PDF");
    }
  }, [ticket, business, t]);

  const handleSendEmail = useCallback(async () => {
    if (!ticket?.id) {
      toast.error(t("noTicketData") || "No ticket data available");
      return;
    }

    // Check if client has email
    if (!ticket.client?.email) {
      toast.error(
        t("noClientEmail") || "Client does not have an email address"
      );
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/email/send-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          recipientEmail: ticket.client.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success(t("emailSentSuccess") || `Email sent to ${data.sentTo}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("emailSentError") || "Failed to send email"
      );
    } finally {
      setIsSendingEmail(false);
    }
  }, [ticket, t]);

  // 3. Early returns
  if (!ticket) {
    return null;
  }

  const statusLabel = getStatusLabel(ticket.status || "");
  const statusClasses = getStatusBadgeClass(ticket.status || "");

  // 4. Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg rounded-2xl [&>button:first-of-type]:hidden overflow-hidden">
        <TicketDialogHeader
          title={t("ticketDetails")}
          onDownloadPdf={handleDownloadPdf}
          onSendEmail={handleSendEmail}
          pdfLabel={t("pdf")}
          emailLabel={t("email")}
          isEmailLoading={isSendingEmail}
        />

        <div className="p-6 space-y-6">
          {/* Business & Ticket Info */}
          <div className="flex items-center justify-between">
            <BusinessLogo logo={business?.logo} name={business?.name} />
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Ticket ID Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <FiHash className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t("ticketID")}
                  </p>
                  <p className="font-bold text-gray-900 font-mono">
                    {ticket.id || "-"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{dateStr}</p>
                <p className="text-sm text-gray-700">{timeStr}</p>
              </div>
            </div>
          </div>

          {/* Client & Staff Info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<FiUser className="w-4 h-4" />}
              label={t("clientLabel")}
              value={ticket.client?.name || "-"}
              subValue={ticket.client?.phone || ticket.client?.email}
              color="blue"
            />
            <InfoCard
              icon={<FiUser className="w-4 h-4" />}
              label={t("staffLabel")}
              value={ticket.staff?.name || ticket.staff?.email || "-"}
              color="purple"
            />
          </div>

          {/* Appointment Time (if exists) */}
          {appointmentTime && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">
                   {t("appointmentDetails")}
                 </p>
                 <p className="font-semibold text-gray-900">
                   {appointmentTime.dateStr} - {appointmentTime.timeStr}
                 </p>
               </div>
             </div>
           )}
 
           {/* Items Section */}
           <TicketItems
             items={ticket.items || []}
             itemsLabel={t("itemsLabel")}
             qtyLabel={t("qtyLabel")}
             emptyLabel={t("itemsEmpty")}
           />
 
           {/* Notes (if exists) */}
           {ticket.notes && (
             <div className="p-4 bg-amber-50 rounded-xl">
               <div className="flex items-start gap-3">
                 <FiFileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                 <div>
                   <p className="text-xs text-amber-600 uppercase tracking-wider font-medium mb-1">
                     {t("notes")}
                   </p>
                   <p className="text-gray-700 text-sm">{ticket.notes}</p>
                 </div>
               </div>
             </div>
           )}

          {/* Total Section */}
          <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
            <span className="text-white font-medium">{t("totalLabel")}</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(ticket.total || 0)}
            </span>
          </div>

          {/* Thanks Message */}
          <p className="text-center text-sm text-gray-500">{t("thanks")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string | null;
  color: "blue" | "purple" | "green" | "amber";
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  subValue,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-medium text-gray-900 truncate">{value}</p>
      {subValue && (
        <p className="text-xs text-gray-500 truncate">{subValue}</p>
      )}
    </div>
  );
};

export default TicketDetailsDialog;
