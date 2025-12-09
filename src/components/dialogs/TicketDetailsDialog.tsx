"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils";
import { FiDownload, FiPrinter, FiX } from "react-icons/fi";

type TicketLike = {
  id?: string;
  createdAt?: string | Date;
  amount?: number;
  status?: string;
  notes?: string | null;
  client?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  seller?: { name?: string | null };
  product?: { name?: string | null; price?: number | null };
  service?: { name?: string | null };
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
  const { dateStr, timeStr } = formatDateTime(ticket?.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl [&>button:first-of-type]:hidden">
        {ticket ? (
          <>
            <DialogHeader className="border-b border-gray-200 pb-4 p-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-3  pb-4">
                  Purchase ticket
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <button className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                    <FiPrinter />
                    Print
                  </button>
                  <button className="text-sm font-semibold flex gap-2 items-center justify-center border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                    <FiDownload />
                    PDF
                  </button>
                  <DialogClose asChild>
                    <FiX className="h-5 w-5 text-gray-500 cursor-pointer" />
                  </DialogClose>
                </div>
              </div>
              <DialogDescription className="text-gray-500">
                View the details of the ticket.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 items-center justify-center p-6">
              <p className="font-medium">{dateStr}</p>
              <p className="text-xs text-gray-500">{timeStr}</p>
              <p>Ticket ID</p>

              <p className="font-bold text-xl text-gray-900">
                #{ticket.id || "-"}
              </p>
              <div className="flex flex-col gap-2 border-y border-gray-200 py-10 w-full items-center justify-center">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-500">
                    Client:{" "}
                    <span className="font-semibold text-gray-900">
                      {ticket.client?.name || "-"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    Staff:{" "}
                    <span className="font-semibold text-gray-900">
                      {ticket.seller?.name || "-"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-b border-gray-200 py-10 w-full items-start justify-between">
                <p className="text-xl text-gray-900 flex items-center justify-start">
                  Services
                </p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <p className="text-semibold text-gray-900">
                      {ticket.service?.name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Done by: {ticket.seller?.name || "-"}
                    </p>
                  </div>
                  <p className="text-semibold text-gray-900">
                    {formatCurrency(ticket.product?.price || 0) || "-"}
                  </p>
                </div>
              </div>
              <div className="flex border-b border-gray-200 py-10 w-full items-center justify-between">
                <p className="text-xl font-bold text-gray-900 flex items-center justify-start">
                  TOTAL:
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(ticket.amount || 0) || "-"}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
