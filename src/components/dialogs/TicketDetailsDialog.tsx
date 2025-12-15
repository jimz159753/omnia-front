"use client";

import React, { useCallback } from "react";
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
  const { t } = useTranslation("sales");
  const { business } = useBusiness(open);
  const { dateStr, timeStr } = formatTicketDateTime(ticket?.createdAt);

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

  const handleSendEmail = useCallback(() => {
    // TODO: Implement email functionality
    console.log("Send email:", ticket?.id);
  }, [ticket?.id]);

  // 3. Early returns
  if (!ticket) {
    return null;
  }

  // 4. Render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl [&>button:first-of-type]:hidden">
        <TicketDialogHeader
          title={t("ticketDetails")}
          onDownloadPdf={handleDownloadPdf}
          onSendEmail={handleSendEmail}
          pdfLabel={t("pdf")}
          emailLabel={t("email")}
        />

        <div className="flex flex-col gap-2 items-center justify-center p-6">
          <BusinessLogo logo={business?.logo} name={business?.name} />

          <p className="text-sm text-gray-700">{dateStr}</p>
          <p className="text-xs text-gray-500">{timeStr}</p>

          <p className="text-gray-500 mt-6">{t("ticketID")}</p>
          <p className="font-bold text-xl text-gray-900 mb-6">
            #{ticket.id || "-"}
          </p>

          <div className="flex flex-col gap-2 border-y border-gray-200 py-10 w-full items-center justify-center">
            <div className="flex flex-col gap-2">
              <p className="text-gray-500">
                {t("clientLabel")}:{" "}
                <span className="font-semibold text-gray-900">
                  {ticket.client?.name || "-"}
                </span>
              </p>
              <p className="text-gray-500">
                {t("staffLabel")}:{" "}
                <span className="font-semibold text-gray-900">
                  {ticket.staff?.name || ticket.staff?.email || "-"}
                </span>
              </p>
            </div>
          </div>

          <TicketItems
            items={ticket.items || []}
            itemsLabel={t("itemsLabel")}
            qtyLabel={t("qtyLabel")}
            emptyLabel={t("itemsEmpty")}
          />

          <div className="flex border-b border-gray-200 py-10 w-full items-center justify-between">
            <p className="text-xl font-bold text-gray-900 flex items-center justify-start">
              {t("totalLabel")}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(ticket.total || 0) || "-"}
            </p>
          </div>

          <p className="text-gray-500 text-center my-2">{t("thanks")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
