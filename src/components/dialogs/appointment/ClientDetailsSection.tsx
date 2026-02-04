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
    <div className="flex flex-col justify-between w-1/3 h-full space-y-4 border-l bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex-1 overflow-y-auto">
        <div
          className={`flex p-5 ${ticketId ? "justify-between" : "justify-end"}`}
        >
          {/* Show trash icon only if there's a ticket (editing mode) */}
          {ticketId && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors group"
              title="Delete ticket"
            >
              <FiTrash2 className="h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors" />
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-5 pb-5">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t("client")}</h3>
          </div>

          {/* Client Tabs */}
          <ClientDetailsTabs
            existingCount={clients.length}
            activeTab={existingClientId ? "existing" : "new"}
            onChange={handleTabChange}
          />

          {/* Existing Client Selection or New Client Form */}
          <div className="mt-4">
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
              <div className="space-y-4 bg-white rounded-xl p-4 border border-gray-100">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("name")}
                  </label>
                  <input
                    {...register("clientName", {
                      required: "Client name is required",
                    })}
                    className="w-full h-11 rounded-lg border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Nombre del cliente"
                  />
                  {errors.clientName && (
                    <p className="text-xs text-red-600">
                      {errors.clientName.message as string}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("lastName")}
                  </label>
                  <input
                    className="w-full h-11 rounded-lg border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Apellido"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("phone")}
                  </label>
                  <input
                    {...register("clientPhone", {
                      required: "Client phone is required",
                    })}
                    className="w-full h-11 rounded-lg border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="+52 33 1234 5678"
                  />
                  {errors.clientPhone && (
                    <p className="text-xs text-red-600">
                      {errors.clientPhone.message as string}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    {...register("clientEmail", {
                      required: "Client email is required",
                    })}
                    className="w-full h-11 rounded-lg border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.clientEmail && (
                    <p className="text-xs text-red-600">
                      {errors.clientEmail.message as string}
                    </p>
                  )}
                </div>

                {/* Birthday */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("birthday")}
                  </label>
                  <input
                    type="text"
                    className="w-full h-11 rounded-lg border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Total Section with gradient */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-5">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium text-lg">{t("total")}</span>
          <span className="font-black text-3xl text-white">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      {/* Form Actions */}
      <FormActions isSubmitting={isSubmitting} onCancel={onCancel} />
    </div>
  );
};

