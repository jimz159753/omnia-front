"use client";

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppointmentForm } from "@/hooks/useAppointmentForm";
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
    errors,
    isSubmitting,
    includeNotes,
    existingClientId,
    reset,
  } = useAppointmentForm({
    open,
    onOpenChange,
    onSuccess,
    initialSlot,
  });

  // Custom DialogContent without overlay
  const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500">
          <FiX className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ));
  CustomDialogContent.displayName = "CustomDialogContent";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-7xl w-[95vw] h-[85vh">
        <DialogHeader className="border-b pb-4">
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
          <div className="flex items-center justify-center h-64">
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
                  selectedServiceId={watch("serviceId")}
                />
              </div>

              {/* Right Side - Client Details */}
              <ClientDetailsSection
                control={control}
                register={register}
                errors={errors}
                clients={clients}
                services={services}
                existingClientId={existingClientId}
                selectedServiceId={watch("serviceId")}
                reset={reset}
                watch={watch}
                isSubmitting={isSubmitting}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </form>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}
