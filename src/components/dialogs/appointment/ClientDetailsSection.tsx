import { useCallback, useMemo } from "react";
import {
  Controller,
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import ClientDetailsTabs from "@/components/clients/ClientDetailsTabs";
import ClientCombobox from "@/components/clients/ClientCombobox";
import ClientMultiCombobox from "@/components/clients/ClientMultiCombobox";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  Client,
  Service,
  AppointmentFormValues,
} from "@/hooks/useAppointmentDetails";
import { FormActions } from "./FormActions";
import { FiX, FiTrash2 } from "react-icons/fi";

interface TicketItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

interface ClientDetailsSectionProps {
  control: Control<AppointmentFormValues>;
  register: UseFormRegister<AppointmentFormValues>;
  errors: FieldErrors<AppointmentFormValues>;
  clients: Client[];
  services: Service[];
  existingClientId: string;
  setExistingClientId: (value: string) => void;
  selectedServiceId: string;
  setValue: UseFormSetValue<AppointmentFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
  ticketItems?: TicketItem[];
  quantities?: Record<string, number>;
  discounts?: Record<string, number>;
  ticketId?: string;
  onDelete?: () => void;
}

/**
 * Client Details Section Component
 * Displays client tabs, combobox/form, and total price
 */
export const ClientDetailsSection = ({
  control,
  register,
  errors,
  clients,
  services,
  existingClientId,
  setExistingClientId,
  selectedServiceId,
  setValue,
  isSubmitting,
  onCancel,
  ticketItems = [],
  quantities = {},
  discounts = {},
  ticketId,
  onDelete,
}: ClientDetailsSectionProps) => {
  const { t } = useTranslation("common");

  // Calculate total price from all ticket items
  // Recalculates based on current quantities and discounts from the table
  const totalPrice = useMemo(() => {
    // If there are ticket items (editing mode), sum their totals with current quantities and discounts
    if (ticketItems.length > 0) {
      return ticketItems.reduce((sum, item) => {
        // Get current quantity and discount (may have changed in the table)
        const quantity = quantities[item.id] ?? item.quantity ?? 1;
        const discount = discounts[item.id] ?? item.discount ?? 0;

        // Calculate total: (unitPrice × quantity) - discount
        const subtotal = item.unitPrice * quantity;
        const discountAmount = (subtotal * discount) / 100;
        const itemTotal = subtotal - discountAmount;

        return sum + itemTotal;
      }, 0);
    }

    // Otherwise, use the selected service price (new appointment mode)
    const selectedService = services.find((s) => s.id === selectedServiceId);
    return selectedService?.price || 0;
  }, [ticketItems, quantities, discounts, services, selectedServiceId]);

  // Memoize tab change handler to prevent re-renders
  const handleTabChange = useCallback(
    (v: string) => {
      if (v === "new") {
        setValue("existingClientId", "", { shouldDirty: false });
        setValue("existingClientIds", [], { shouldDirty: false });
        setExistingClientId("");
      } else if (clients.length > 0) {
        setValue("existingClientId", clients[0].id, { shouldDirty: false });
        setValue("existingClientIds", [], { shouldDirty: false });
        setExistingClientId(clients[0].id);
      }
    },
    [setValue, setExistingClientId, clients]
  );

  return (
    <div className="flex flex-col justify-between w-1/3 h-full space-y-4 border-l bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div
          className={`flex p-6 ${ticketId ? "justify-between" : "justify-end"}`}
        >
          {/* Show trash icon only if there's a ticket (editing mode) */}
          {ticketId && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-sm opacity-70 text-gray-500 hover:bg-gray-100 p-2 rounded-md  transition-opacity hover:opacity-100 hover:text-red-600 focus:outline-none"
              title="Delete ticket"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          {/* Client Tabs */}
          <ClientDetailsTabs
            existingCount={clients.length}
            activeTab={existingClientId ? "existing" : "new"}
            onChange={handleTabChange}
          />

          {/* Existing Client Selection or New Client Form */}
          <div>
            {existingClientId ? (
              <Controller
                control={control}
                name="existingClientIds"
                rules={{
                  validate: (value) => {
                    if (!value || value.length === 0) {
                      return "At least one client is required";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <ClientMultiCombobox
                    clients={clients}
                    value={field.value || []}
                    onChange={field.onChange}
                    error={errors.existingClientIds?.message as string}
                  />
                )}
              />
            ) : (
              /* New Client Form */
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-normal text-gray-700">
                    {t("name")}
                  </label>
                  <input
                    {...register("clientName", {
                      required: "Client name is required",
                    })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("name")}
                  />
                  {errors.clientName && (
                    <p className="text-xs text-red-600">
                      {errors.clientName.message as string}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-normal text-gray-700">
                    {t("lastName")}
                  </label>
                  <input
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("lastName")}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-normal text-gray-700">
                    {t("phone")}
                  </label>
                  <input
                    {...register("clientPhone", {
                      required: "Client phone is required",
                    })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("phone")}
                  />
                  {errors.clientPhone && (
                    <p className="text-xs text-red-600">
                      {errors.clientPhone.message as string}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-normal text-gray-700">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    {...register("clientEmail", {
                      required: "Client email is required",
                    })}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("email")}
                  />
                  {errors.clientEmail && (
                    <p className="text-xs text-red-600">
                      {errors.clientEmail.message as string}
                    </p>
                  )}
                </div>

                {/* Birthday */}
                <div className="space-y-2">
                  <label className="text-sm font-normal text-gray-700">
                    {t("birthday")}
                  </label>
                  <input
                    type="text"
                    className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Total Section */}
      <div className="flex justify-between items-center text-lg border-t p-4">
        <span className="font-semibold">{t("total")}:</span>
        <span className="font-bold text-2xl">${totalPrice.toFixed(2)}</span>
      </div>
      {/* Form Actions */}
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </div>
  );
};
