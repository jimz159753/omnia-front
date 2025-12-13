"use client";

import type { ColumnDef } from "@/types/clients";
import { Client, Product, Service, Ticket } from "@/generated/prisma";
import { FiCalendar } from "react-icons/fi";
import { getStatusBadgeClass, getStatusLabel } from "@/constants/status";
import { formatCurrency } from "@/utils";
import i18next from "@/i18n";

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
  staff?: { id: string; email: string };
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

export const getColumns = (): ColumnDef<TicketWithRelations>[] => {
  const tCommon = (key: string) => i18next.t(`common:${key}`);
  const tSales = (key: string) => i18next.t(`sales:${key}`);

  return [
    {
      accessorKey: "id",
      header: tSales("ticketNumber"),
      cell: ({ row }) => {
        return <div>{row.original.id}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("date"),
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
      header: tCommon("client"),
    },
    {
      accessorKey: "items",
      header: tSales("items"),
      cell: ({ row }) => {
        const items = row.original.items || [];
        if (items.length === 0) {
          return <div className="text-gray-400 text-sm">-</div>;
        }

        // Get all item names (products or services)
        const itemNames = items
          .map((item) => {
            if (item.service) {
              return item.service.name;
            }
            if (item.product) {
              return item.product.name;
            }
            return null;
          })
          .filter(Boolean);

        // Display items
        if (itemNames.length === 0) {
          return <div className="text-gray-400 text-sm">-</div>;
        }

        if (itemNames.length === 1) {
          return <div className="text-sm text-gray-900">{itemNames[0]}</div>;
        }

        // If multiple items, show first item + count
        return (
          <div className="text-sm text-gray-900">
            <div>{itemNames[0]}</div>
            <div className="text-xs text-gray-500">
              +{itemNames.length - 1} más
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: tCommon("quantity"),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-gray-900">
            {row.original.quantity}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: tCommon("total"),
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
      header: tCommon("status"),
      cell: ({ row }) => {
        const r = row as RowWithGetValue;
        const status = (r.getValue("status") as string) || "";
        const statusLabel = getStatusLabel(status);

        // Define status colors directly
        let colorClasses = "bg-gray-100 text-gray-800";
        if (status === "Pending") {
          colorClasses = "bg-yellow-100 text-yellow-800";
        } else if (status === "Confirmed") {
          colorClasses = "bg-blue-100 text-blue-800";
        } else if (status === "Done") {
          colorClasses = "bg-green-100 text-green-800";
        } else if (status === "Canceled") {
          colorClasses = "bg-red-100 text-red-800";
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorClasses}`}
          >
            {statusLabel}
          </span>
        );
      },
    },
  ];
};
