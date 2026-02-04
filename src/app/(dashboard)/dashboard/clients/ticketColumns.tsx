"use client";

import React from "react";
import type { ColumnDef, TicketRow } from "@/types/clients";
import { FiShoppingBag, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getStatusBadgeClass, getStatusLabel } from "@/constants/status";
import { formatCurrency } from "@/utils";
import i18next from "@/i18n";

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("es-MX", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

interface ColumnCallbacks {
  onEdit?: (ticket: TicketRow) => void;
  onDelete?: (ticket: TicketRow) => void;
}

export const getTicketColumns = (callbacks?: ColumnCallbacks): ColumnDef<TicketRow>[] => {
  const tCommon = (key: string) => i18next.t(`common:${key}`);
  const tSales = (key: string) => i18next.t(`sales:${key}`);

  const columns: ColumnDef<TicketRow>[] = [
    {
      accessorKey: "id",
      header: tSales("ticketNumber"),
      cell: ({ row }) => {
        return (
          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {row.original.id}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: tCommon("date"),
      cell: ({ row }) => {
        const { dateStr, timeStr } = formatDateTime(row.original.createdAt);
        return (
          <div className="text-sm">
            <p className="text-gray-900 font-medium">{dateStr}</p>
            <p className="text-gray-500">{timeStr}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: tSales("items"),
      cell: ({ row }) => {
        const items = row.original.items || [];
        if (items.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        // Get all item names (products or services)
        const itemNames = items
          .map((item) => {
            if (item.service) return item.service.name;
            if (item.product) return item.product.name;
            return null;
          })
          .filter(Boolean);

        if (itemNames.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FiShoppingBag className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-900">{itemNames[0]}</p>
              {itemNames.length > 1 && (
                <p className="text-xs text-gray-500">
                  +{itemNames.length - 1} {tSales("moreItems")}
                </p>
              )}
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
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
            {row.original.quantity}
          </span>
        );
      },
    },
    {
      accessorKey: "total",
      header: tCommon("total"),
      cell: ({ row }) => {
        return (
          <span className="font-semibold text-gray-900">
            {formatCurrency(row.original.total ?? 0)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = row.original.status || "";
        const statusLabel = getStatusLabel(status);
        const colorClasses = getStatusBadgeClass(status);

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

  // Add actions column if callbacks are provided
  if (callbacks?.onEdit || callbacks?.onDelete) {
    columns.push({
      accessorKey: "actions",
      header: tSales("actions"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {callbacks?.onEdit && (
              <button
                onClick={() => callbacks.onEdit?.(row.original)}
                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                title={tSales("editTicket")}
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            )}
            {callbacks?.onDelete && (
              <button
                onClick={() => callbacks.onDelete?.(row.original)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                title={tSales("deleteTicket")}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
};
