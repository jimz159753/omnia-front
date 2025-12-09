"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils";
import { FiDownload, FiMail, FiPrinter, FiX } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

type TicketLike = {
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
  seller?: { name?: string | null; email?: string | null };
  items?: Array<{
    quantity?: number;
    unitPrice?: number;
    total?: number;
    product?: { name?: string | null; price?: number | null } | null;
    service?: { name?: string | null; price?: number | null } | null;
  }>;
  total?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: TicketLike | null;
};

const getOrdinal = (day: number) => {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return "st";
  if (mod10 === 2 && mod100 !== 12) return "nd";
  if (mod10 === 3 && mod100 !== 13) return "rd";
  return "th";
};

const formatDateTime = (iso?: string | Date) => {
  if (!iso) return { dateStr: "-", timeStr: "" };
  const date = iso instanceof Date ? iso : new Date(iso);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const dateStr = `${month} ${day}${getOrdinal(day)}, ${year}`;
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

export const TicketDetailsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  ticket,
}) => {
  const { t } = useTranslation("sales");
  const { dateStr, timeStr } = formatDateTime(ticket?.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl [&>button:first-of-type]:hidden">
        {ticket ? (
          <>
            <DialogHeader className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-3">
                  {t("ticketDetails")}
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <button className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 hover:bg-gray-100">
                    <FiPrinter />
                    {t("print")}
                  </button>
                  <button className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 hover:bg-gray-100">
                    <FiDownload />
                    {t("pdf")}
                  </button>
                  <button className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 hover:bg-gray-100">
                    <FiMail />
                    {t("email")}
                  </button>
                  <DialogClose asChild>
                    <FiX className="h-5 w-5 text-gray-500 cursor-pointer" />
                  </DialogClose>
                </div>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-2 items-center justify-center p-6">
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
                      {ticket.seller?.name || ticket.seller?.email || "-"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-b border-gray-200 py-10 w-full items-start justify-between">
                <p className="text-xl text-gray-900 flex items-center justify-start">
                  {t("itemsLabel")}
                </p>
                <div className="flex flex-col gap-3 w-full">
                  {(ticket.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between w-full border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex flex-col">
                        <p className="text-semibold text-gray-900">
                          {item.product?.name || item.service?.name || "Item"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("qtyLabel")}: {item.quantity ?? 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-semibold text-gray-900">
                          {formatCurrency(item.total || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!ticket.items || ticket.items.length === 0) && (
                    <p className="text-sm text-gray-500">{t("itemsEmpty")}</p>
                  )}
                </div>
              </div>
              <div className="flex border-b border-gray-200 py-10 w-full items-center justify-between">
                <p className="text-xl font-bold text-gray-900 flex items-center justify-start">
                  {t("totalLabel")}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(ticket.total || 0) || "-"}
                </p>
              </div>
              <p className="text-gray-500 text-center my-2">
                {t("thanks")}
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
