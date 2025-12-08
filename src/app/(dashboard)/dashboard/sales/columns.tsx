"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client, Product, Service, Ticket } from "@/generated/prisma";
import { FiCalendar } from "react-icons/fi";

type TicketWithRelations = Ticket & {
  client: Client;
  product: Product;
  service: Service;
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
      const { dateStr, timeStr } = formatDateTime(row.getValue("createdAt") as string);
      return (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
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
  },
  {
    accessorKey: "service.name",
    header: "Service",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
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
      const status = row.getValue("status") as string;
      return (
        <div className="capitalize text-sm font-medium text-muted-foreground">
          {status}
        </div>
      );
    },
  },
];
