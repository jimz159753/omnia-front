"use client";

import type { ColumnDef } from "@/types/clients";
import { Client, Product, Service, Ticket } from "@/generated/prisma";
import { FiCalendar } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, getStatusLabel } from "@/constants/status";
import { formatCurrency } from "@/utils";

type TicketWithRelations = Ticket & {
  client: Client;
  items: Array<{
    quantity: number;
    unitPrice: number;
    total: number;
    product: Product | null;
    service: Service | null;
  }>;
  quantity: number;
  total: number;
  seller?: { id: string; email: string };
};

type RowWithGetValue = {
  getValue: (key: string) => unknown;
  original: TicketWithRelations;
};

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

export const getColumns = (): ColumnDef<TicketWithRelations>[] => [
  {
    accessorKey: "id",
    header: "Ticket #",
    cell: ({ row }) => {
      return <div>{row.original.id}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const r = row as RowWithGetValue;
      const { dateStr, timeStr } = formatDateTime(
        r.getValue("createdAt") as string
      );
      return (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-brand-500" />
          <div className="leading-tight">
            <div>{dateStr}</div>
            <div className="text-xs text-gray-500">{timeStr}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: "Client",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-900">{row.original.quantity}</div>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.original.total ?? 0)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const r = row as RowWithGetValue;
      const status = (r.getValue("status") as string) || "";
      const statusLabel = getStatusLabel(status);
      const badgeClass = getStatusBadgeClass(status);
      return (
        <Badge
          className={`px-3 py-1 font-semibold border-transparent ${badgeClass}`}
        >
          {statusLabel}
        </Badge>
      );
    },
  },
];
