"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppointmentDetails } from "@/hooks/useAppointmentDetails";
import { AppointmentDetailsSection } from "./appointment/AppointmentDetailsSection";
import { ClientDetailsSection } from "./appointment/ClientDetailsSection";
import { AppointmentHeader } from "./appointment/AppointmentHeader";
import { AppointmentTicketTable } from "./appointment/AppointmentTicketTable";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialSlot?: {
    start: Date;
    end: Date;
    resourceId?: string;
  } | null;
  initialData?: {
    ticketId?: string;
    clientId?: string;
    serviceId?: string;
    notes?: string;
  } | null;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
  initialData,
}: AppointmentFormDialogProps) {
  const { t } = useTranslation("common");

  // State for date and time pickers
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialSlot?.start || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    initialSlot?.start
      ? `${initialSlot.start
          .getHours()
          .toString()
          .padStart(2, "0")}:${initialSlot.start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : "09:00"
  );

  // Update date and time when initialSlot changes (when clicking a calendar event)
  useEffect(() => {
    if (initialSlot?.start) {
      setSelectedDate(initialSlot.start);
      setSelectedTime(
        `${initialSlot.start
          .getHours()
          .toString()
          .padStart(2, "0")}:${initialSlot.start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }
  }, [initialSlot]);

  // Use custom hook for all business logic
  const {
    services,
    users,
    clients,
    loading,
    error,
    success,
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isSubmitting,
    includeNotes,
    setIncludeNotes,
    existingClientId,
    setExistingClientId,
    ticketData,
  } = useAppointmentDetails({
    open,
    onOpenChange,
    onSuccess,
    initialSlot,
    initialData,
    selectedDate,
    selectedTime,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {initialData ? t("editAppointment") : t("createAppointment")}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <FiAlertCircle className="h-4 w-4" />
                <AlertTitle>{t("error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-4">
                <FiCheckCircle className="h-4 w-4" />
                <AlertTitle>{t("success")}</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">{t("loading")}</p>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Left Side - Title, Date/Time + Appointment Details */}
                <div className="flex-1">
                  {/* Header with Title and Date/Time Pickers */}
                  <AppointmentHeader
                    initialData={initialData}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                  />

                  {/* Appointment Details Section */}
                  {initialData ? (
                    <AppointmentTicketTable
                      ticketData={ticketData}
                      onStatusChange={(status) => {
                        console.log("Status changed to:", status);
                        // TODO: Implement status change API call
                      }}
                      onDeleteItem={(itemId) => {
                        console.log("Delete item:", itemId);
                        // TODO: Implement delete item API call
                      }}
                      onDiscountChange={(itemId, discount) => {
                        console.log(
                          `Discount changed for item ${itemId}:`,
                          discount
                        );
                        // TODO: Implement discount update API call
                      }}
                      onAddService={() => {
                        console.log("Add service");
                        // TODO: Implement add service
                      }}
                      onAddProduct={() => {
                        console.log("Add product");
                        // TODO: Implement add product
                      }}
                      onUseCertificate={() => {
                        console.log("Use certificate");
                        // TODO: Implement use certificate
                      }}
                      onAddTip={() => {
                        console.log("Add tip");
                        // TODO: Implement add tip
                      }}
                      includeNotes={includeNotes}
                      setIncludeNotes={setIncludeNotes}
                      control={control}
                      register={register}
                      errors={errors}
                    />
                  ) : (
                    <AppointmentDetailsSection
                      control={control}
                      register={register}
                      errors={errors}
                      users={users}
                      services={services}
                      includeNotes={includeNotes}
                      setIncludeNotes={setIncludeNotes}
                      selectedServiceId={watch("serviceId")}
                    />
                  )}
                </div>

                {/* Right Side - Client Details */}
                <ClientDetailsSection
                  services={services}
                  selectedServiceId={watch("serviceId")}
                  isSubmitting={isSubmitting}
                  onCancel={() => onOpenChange(false)}
                  control={control}
                  register={register}
                  errors={errors}
                  clients={clients}
                  existingClientId={existingClientId}
                  setExistingClientId={setExistingClientId}
                  setValue={setValue}
                />
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
