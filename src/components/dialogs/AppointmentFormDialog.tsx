"use client";

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppointmentDetails } from "@/hooks/useAppointmentDetails";
import { AppointmentDetailsSection } from "./appointment/AppointmentDetailsSection";
import { ClientDetailsSection } from "./appointment/ClientDetailsSection";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialSlot?: {
    start: Date;
    end: Date;
    resourceId?: string;
  } | null;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
}: AppointmentFormDialogProps) {
  const { t } = useTranslation("common");

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
  } = useAppointmentDetails({
    open,
    onOpenChange,
    onSuccess,
    initialSlot,
  });

  // Custom DialogContent without overlay

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] flex flex-col">
        <DialogHeader className="border-b h-fit pb-4">
          <DialogTitle className="text-xl font-normal">
            {t("createAppointment")}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <FiAlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success">
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
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex gap-8 flex-1 overflow-y-auto">
              {/* Left Side - Appointment Details */}
              <div className="flex-1">
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
