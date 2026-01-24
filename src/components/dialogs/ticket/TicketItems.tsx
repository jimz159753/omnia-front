import React from "react";
import { formatCurrency } from "@/utils";
import { FiPackage, FiCalendar } from "react-icons/fi";

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
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {itemsLabel}
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <TicketItemRow
              key={idx}
              name={item.product?.name || item.service?.name || "Item"}
              quantity={item.quantity ?? 1}
              unitPrice={item.unitPrice || item.product?.price || item.service?.price || 0}
              total={item.total || 0}
              qtyLabel={qtyLabel}
              isService={!!item.service}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <FiPackage className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{emptyLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TicketItemRowProps {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  qtyLabel: string;
  isService: boolean;
}

/**
 * Individual ticket item row
 * Follows SRP - Renders single item with consistent styling
 */
const TicketItemRow: React.FC<TicketItemRowProps> = ({
  name,
  quantity,
  unitPrice,
  total,
  qtyLabel,
  isService,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isService
            ? "bg-blue-100 text-blue-600"
            : "bg-amber-100 text-amber-600"
        }`}
      >
        {isService ? (
          <FiCalendar className="w-5 h-5" />
        ) : (
          <FiPackage className="w-5 h-5" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500">
          {qtyLabel}: {quantity} × {formatCurrency(unitPrice)}
        </p>
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
      </div>
    </div>
  );
};
