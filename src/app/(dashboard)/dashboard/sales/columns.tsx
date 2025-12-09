"use client";

import type { ColumnDef } from "@/types/clients";
import { Client, Product, Service, Ticket } from "@/generated/prisma";
import { FiCalendar } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, getStatusLabel } from "@/constants/status";

type TicketWithRelations = Ticket & {
  client: Client;
  product: Product;
  service: Service;
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
    accessorKey: "product.name",
    header: "Product",
    cell: ({ row }) => {
      return <div>{row.original.product?.name || "-"}</div>;
    },
  },
  {
    accessorKey: "service.name",
    header: "Service",
    cell: ({ row }) => {
      return <div>{row.original.service?.name || "-"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const r = row as RowWithGetValue;
      const amount = parseFloat(r.getValue("amount") as string);
      return (
        <div className="font-medium text-gray-900">
          {amount.toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
        <Badge variant="secondary" className={`px-2 ${badgeClass}`}>
          {statusLabel}
        </Badge>
      );
    },
  },
];
