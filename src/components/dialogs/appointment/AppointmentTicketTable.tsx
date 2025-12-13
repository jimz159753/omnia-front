"use client";

import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Controller,
  type UseFormRegister,
  type FieldErrors,
  type Control,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { AddProductDialog } from "./AddProductDialog";

interface TicketItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discount?: number;
  product?: { name: string; id: string } | null;
  service?: { name: string; id: string } | null;
  productId?: string;
  serviceId?: string;
  isNew?: boolean;
}

interface NewTicketItem extends TicketItem {
  staffId?: string;
  staffName?: string;
}

interface TicketData {
  id: string;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  staff: {
    id: string;
    name?: string;
    email: string;
  };
  items: TicketItem[];
  total: number;
}

interface AppointmentTicketTableProps {
  ticketData?: TicketData | null;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  onDeleteItem?: (itemId: string) => Promise<void>;
  onDiscountChange?: (itemId: string, discount: number) => Promise<void>;
  onAddProduct?: (data: {
    productId: string;
    staffId: string;
    ticketId: string;
  }) => void;
  onUseCertificate?: () => void;
  onAddTip?: () => void;
  includeNotes?: boolean;
  setIncludeNotes?: (value: boolean) => void;
  users?: Array<{ id: string; email: string; name?: string }>;
  products?: Array<{ id: string; name: string; cost: number }>;
  onNewItemsChange?: (items: NewTicketItem[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
}

export type { NewTicketItem };

type TicketStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

interface StatusButton {
  value: TicketStatus;
  label: string;
  iconColor: string;
  textColor: string;
  bgColor: string;
  bgHoverColor: string;
}

const serviceStatusButtons: StatusButton[] = [
  {
    value: "Pending",
    label: "Pendiente",
    iconColor: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-100",
    bgHoverColor: "hover:bg-yellow-200",
  },
  {
    value: "Confirmed",
    label: "Confirmado",
    iconColor: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100",
    bgHoverColor: "hover:bg-blue-200",
  },
  {
    value: "Completed",
    label: "Finalizado",
    iconColor: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    bgHoverColor: "hover:bg-green-200",
  },
  {
    value: "Cancelled",
    label: "Cancelado",
    iconColor: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    bgHoverColor: "hover:bg-red-200",
  },
];

export function AppointmentTicketTable({
  ticketData,
  selectedStatus: selectedStatusProp,
  onStatusChange,
  onDeleteItem,
  onDiscountChange,
  onAddProduct,
  onUseCertificate,
  onAddTip,
  includeNotes,
  setIncludeNotes,
  control,
  register,
  users = [],
  products = [],
  onNewItemsChange,
}: AppointmentTicketTableProps) {
  const { t } = useTranslation("common");

  // Use prop if provided, otherwise use ticket data status, fallback to "Pending"
  const initialStatus = selectedStatusProp || ticketData?.status || "Pending";
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(
    initialStatus as TicketStatus
  );

  // Add product dialog state
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  // Local state for new items added through the dialog
  const [newItems, setNewItems] = useState<NewTicketItem[]>([]);

  // Sync local state when prop or ticket data changes
  useEffect(() => {
    const newStatus = selectedStatusProp || ticketData?.status || "Pending";
    setSelectedStatus(newStatus as TicketStatus);
  }, [selectedStatusProp, ticketData?.status]);

  // Notify parent when new items change
  useEffect(() => {
    onNewItemsChange?.(newItems);
  }, [newItems, onNewItemsChange]);

  // Local state for discount values
  const [discounts, setDiscounts] = useState<Record<string, number>>({});

  const handleStatusChange = (status: TicketStatus) => {
    setSelectedStatus(status);
    onStatusChange?.(status);
  };

  const handleAddProduct = async (data: {
    staffId: string;
    productId: string;
  }) => {
    // Find the selected product and staff
    const selectedProduct = products.find((p) => p.id === data.productId);
    const selectedStaff = users.find((u) => u.id === data.staffId);

    if (!selectedProduct) {
      console.error("Product not found");
      alert("Producto no encontrado");
      return;
    }

    // Create a new item for the table (local state only)
    const newItem: NewTicketItem = {
      id: `new-${Date.now()}-${Math.random()}`, // Temporary ID
      quantity: 1,
      unitPrice: selectedProduct.cost,
      total: selectedProduct.cost,
      discount: 0,
      product: {
        name: selectedProduct.name,
        id: selectedProduct.id,
      },
      productId: selectedProduct.id,
      service: null,
      isNew: true,
      staffId: data.staffId,
      staffName: selectedStaff?.name || selectedStaff?.email || "N/A",
    };

    // Add to local state for display
    setNewItems((prev) => [...prev, newItem]);

    // Notify parent (optional callback)
    if (ticketData?.id) {
      onAddProduct?.({
        productId: data.productId,
        staffId: data.staffId,
        ticketId: ticketData.id,
      });
    }

    setIsAddProductDialogOpen(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    // Check if it's a new item
    const isNewItem = newItems.some((item) => item.id === itemId);

    if (isNewItem) {
      // For new items, just remove from local state without confirmation
      setNewItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      // For existing items, show confirmation and call parent callback
      await onDeleteItem?.(itemId);
    }
  };

  const handleDiscountChange = async (
    itemId: string,
    discountPercent: number
  ) => {
    const discount = Math.max(0, Math.min(100, discountPercent));
    setDiscounts((prev) => ({ ...prev, [itemId]: discount }));

    // Check if it's a new item and update its total
    const isNewItem = newItems.some((item) => item.id === itemId);
    if (isNewItem) {
      setNewItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const discountAmount = (item.unitPrice * discount) / 100;
            return {
              ...item,
              discount,
              total: item.unitPrice - discountAmount,
            };
          }
          return item;
        })
      );
    } else {
      // Call parent callback for existing items
      await onDiscountChange?.(itemId, discount);
    }
  };

  // Transform ticket items to display format
  const existingItems =
    ticketData?.items?.map((item) => {
      const itemId = item.id || Math.random().toString();
      const discount = discounts[itemId] ?? item.discount ?? 0;
      const originalPrice = item.unitPrice;
      const discountAmount = (originalPrice * discount) / 100;
      const finalTotal = originalPrice - discountAmount;

      return {
        id: itemId,
        serviceName: item.service?.name || item.product?.name || "N/A",
        clientName: ticketData.client?.name || "N/A",
        staffName: ticketData.staff?.name || ticketData.staff?.email || "N/A",
        price: originalPrice,
        discount: discount,
        total: finalTotal,
      };
    }) || [];

  // Transform new items to display format
  const newItemsFormatted = newItems.map((item) => {
    const discount = discounts[item.id] ?? item.discount ?? 0;
    const originalPrice = item.unitPrice;
    const discountAmount = (originalPrice * discount) / 100;
    const finalTotal = originalPrice - discountAmount;

    return {
      id: item.id,
      serviceName: item.service?.name || item.product?.name || "N/A",
      clientName: ticketData?.client?.name || "N/A",
      staffName: item.staffName || "N/A",
      price: originalPrice,
      discount: discount,
      total: finalTotal,
    };
  });

  // Combine existing and new items
  const items = [...existingItems, ...newItemsFormatted];

  return (
    <div className="flex flex-col h-full">
      {/* Status Section */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold mb-3">Estatus del servicio</h3>
        <div className="flex gap-2">
          {serviceStatusButtons.map((statusButton) => {
            const isSelected = selectedStatus === statusButton.value;
            return (
              <button
                key={statusButton.value}
                type="button"
                onClick={() => handleStatusChange(statusButton.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? `${statusButton.bgColor} ${statusButton.bgHoverColor} ${statusButton.textColor}`
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-sm ${statusButton.iconColor}`}
                />
                <p className="text-sm">{statusButton.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket Table Section */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Ticket de venta</h3>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => setIsAddProductDialogOpen(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-md bg-gray-100"
              >
                + Agregar producto
              </button>
              <button
                type="button"
                onClick={onUseCertificate}
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-md bg-gray-100"
              >
                + Usar certificado
              </button>
              <button
                type="button"
                onClick={onAddTip}
                className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-md bg-gray-100"
              >
                + Agregar propina
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr,1.5fr,1.5fr,1fr,1fr,1fr,auto] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div>Servicio</div>
              <div>Cliente</div>
              <div>Empleado</div>
              <div className="text-right">Price</div>
              <div className="text-right">Desc. %</div>
              <div className="text-right">Total:</div>
              <div className="w-8"></div>
            </div>

            {/* Table Body */}
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No hay servicios agregados. Haz clic en &quot;+ Agregar
                servicio&quot; para comenzar.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[2fr,1.5fr,1.5fr,1fr,1fr,1fr,auto] gap-4 px-4 py-4 bg-white border-b border-gray-200 last:border-b-0 items-center"
                >
                  <div className="text-sm text-gray-900">
                    {item.serviceName}
                  </div>
                  <div className="text-sm text-gray-900">{item.clientName}</div>
                  <div className="text-sm text-gray-900">{item.staffName}</div>
                  <div className="text-sm text-gray-900 text-right">
                    {item.price}
                  </div>
                  <div className="text-sm text-gray-900 text-right">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleDiscountChange(item.id, value);
                      }}
                      className="w-16 px-2 py-1 text-center bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 text-right">
                    ${item.total.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="border-t p-4">
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Controller
              control={control}
              name="includeNotes"
              render={({ field }) => (
                <Checkbox
                  id="include-notes"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const boolValue = Boolean(checked);
                    field.onChange(boolValue);
                    setIncludeNotes?.(boolValue);
                  }}
                />
              )}
            />
            <label
              htmlFor="include-notes"
              className="text-sm font-semibold text-gray-800 cursor-pointer select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {t("addAppointmentNote")}
            </label>
          </div>
        </div>
        {/* Notes Textarea */}
        {includeNotes && register && (
          <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <label className="text-sm font-semibold text-gray-700">
              {t("notesLabel")}
            </label>
            <textarea
              {...register("notes")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              placeholder={t("notesPlaceholderAppointment")}
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        onAddProduct={handleAddProduct}
        users={users}
        products={products}
      />
    </div>
  );
}
