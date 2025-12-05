"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client, Product, Service, Ticket } from "@/generated/prisma";

type TicketWithRelations = Ticket & {
  client: Client;
  product: Product;
  service: Service;
};

export const getColumns = (): ColumnDef<TicketWithRelations>[] => [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString("es-MX")}</div>;
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
