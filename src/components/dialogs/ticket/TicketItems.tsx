import React from "react";
import { formatCurrency } from "@/utils";

interface TicketItem {
  quantity?: number;
  unitPrice?: number;
  total?: number;
  product?: { name?: string | null; price?: number | null } | null;
  service?: { name?: string | null; price?: number | null } | null;
}

interface TicketItemsProps {
  items: TicketItem[];
  itemsLabel: string;
  qtyLabel: string;
  emptyLabel: string;
}

/**
 * Ticket items list component
 * Follows SRP - Only responsible for rendering ticket items
 */
export const TicketItems: React.FC<TicketItemsProps> = ({
  items,
  itemsLabel,
  qtyLabel,
  emptyLabel,
}) => {
  return (
    <div className="flex flex-col gap-2 border-b border-gray-200 py-10 w-full items-start justify-between">
      <p className="text-xl text-gray-900 flex items-center justify-start">
        {itemsLabel}
      </p>
      <div className="flex flex-col gap-3 w-full h-20 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <TicketItemRow
              key={idx}
              name={item.product?.name || item.service?.name || "Item"}
              quantity={item.quantity ?? 1}
              total={item.total || 0}
              qtyLabel={qtyLabel}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
};

interface TicketItemRowProps {
  name: string;
  quantity: number;
  total: number;
  qtyLabel: string;
}

/**
 * Individual ticket item row
 * Follows SRP - Renders single item with consistent styling
 */
const TicketItemRow: React.FC<TicketItemRowProps> = ({
  name,
  quantity,
  total,
  qtyLabel,
}) => {
  return (
    <div className="flex items-center justify-between w-full border border-gray-100 rounded-lg p-3">
      <div className="flex flex-col">
        <p className="text-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">
          {qtyLabel}: {quantity}
        </p>
      </div>
      <div className="text-right">
        <p className="text-semibold text-gray-900">{formatCurrency(total)}</p>
      </div>
    </div>
  );
};
