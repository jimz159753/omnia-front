import { useCallback } from "react";
import {
  Controller,
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import ClientDetailsTabs from "@/components/clients/ClientDetailsTabs";
import ClientCombobox from "@/components/clients/ClientCombobox";
import { useTranslation } from "@/hooks/useTranslation";
import type {
  Client,
  Service,
  AppointmentFormValues,
} from "@/hooks/useAppointmentDetails";
import { FormActions } from "./FormActions";
import { FiX } from "react-icons/fi";

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
}: ClientDetailsSectionProps) => {
  const { t } = useTranslation("common");

  // Calculate total price
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const totalPrice = selectedService?.price || 0;

  // Memoize tab change handler to prevent re-renders
  const handleTabChange = useCallback(
    (v: string) => {
      if (v === "new") {
        setValue("existingClientId", "", { shouldDirty: false });
        setExistingClientId("");
      } else if (clients.length > 0) {
        setValue("existingClientId", clients[0].id, { shouldDirty: false });
        setExistingClientId(clients[0].id);
      }
    },
    [setValue, setExistingClientId, clients]
  );

  return (
    <div className="flex flex-col justify-between w-1/3 h-full space-y-4 border-l bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-end m-6 ml-auto">
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
                name="existingClientId"
                rules={{ required: "Client is required" }}
                render={({ field }) => (
                  <ClientCombobox
                    clients={clients}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.existingClientId?.message as string}
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
