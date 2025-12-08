"use client";

import React from "react";
import type { ColumnDef, TicketRow } from "@/types/clients";
import { FiCalendar } from "react-icons/fi";

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

export const getTicketColumns = (): ColumnDef<TicketRow>[] => [
  {
    accessorKey: "id",
    header: "Ticket #",
    cell: ({ row }) => row.original.id,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const { dateStr, timeStr } = formatDateTime(row.original.createdAt);
      return (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <div className="flex flex-col leading-tight">
            <span>{dateStr}</span>
            <span className="text-xs text-gray-500">{timeStr}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => row.original.product?.name || "-",
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => row.original.service?.name || "-",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(row.original.amount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const badgeClass =
        status === "completed"
          ? "bg-green-100 text-green-800"
          : status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800";
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}
        >
          {status}
        </span>
      );
    },
  },
];
