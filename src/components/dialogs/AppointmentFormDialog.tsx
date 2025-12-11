"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import ClientDetailsTabs from "@/components/clients/ClientDetailsTabs";
import ClientCombobox from "@/components/clients/ClientCombobox";
import { useTranslation } from "@/hooks/useTranslation";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface User {
  id: string;
  email: string;
}

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

type FormValues = {
  serviceId: string;
  staffId: string;
  includeNotes: boolean;
  notes: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientInstagram: string;
  clientAddress: string;
  existingClientId: string;
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
}: AppointmentFormDialogProps) {
  const { t } = useTranslation("common");
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      serviceId: "",
      staffId: "",
      includeNotes: false,
      notes: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientInstagram: "",
      clientAddress: "",
      existingClientId: "",
    },
  });

  const includeNotes = watch("includeNotes");
  const existingClientId = watch("existingClientId");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setError("");
      setSuccess("");
    } else {
      setError("");
      setSuccess("");
      reset();
    }
  }, [open, reset]);

  // Populate form with initial slot data
  useEffect(() => {
    if (initialSlot && open) {
      // prefill the staff if provided
      if (initialSlot.resourceId) {
        setValue("staffId", initialSlot.resourceId);
      }
    }
  }, [initialSlot, open, setValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, usersRes, clientsRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/users"),
        fetch("/api/clients"),
      ]);
      const servicesData = await servicesRes.json();
      const usersData = await usersRes.json();
      const clientsData = await clientsRes.json();

      setServices(servicesData.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      setClients(
        Array.isArray(clientsData) ? clientsData : clientsData.data || []
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError("");
    setSuccess("");

    try {
      let clientId = values.existingClientId;
      if (!clientId) {
        const clientPayload = {
          name: values.clientName,
          email: values.clientEmail,
          phone: values.clientPhone,
          instagram: values.clientInstagram,
          address: values.clientAddress,
        };

        const clientResponse = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientPayload),
        });

        let clientData;
        if (clientResponse.status === 409) {
          const existingClientRes = await fetch(
            `/api/clients?email=${encodeURIComponent(values.clientEmail)}`
          );
          clientData = await existingClientRes.json();
          if (!clientData || !clientData.id) {
            throw new Error("Client not found");
          }
        } else if (!clientResponse.ok) {
          throw new Error("Failed to create client");
        } else {
          const result = await clientResponse.json();
          clientData = result.data;
        }
        clientId = clientData.id;
      }

      const svc = services.find((s) => s.id === values.serviceId);
      const unitPrice = svc?.price || 0;
      const svcDuration = svc?.duration ?? 60;
      const startTime = initialSlot?.start ?? new Date();
      const endTime =
        initialSlot?.end ?? new Date(startTime.getTime() + svcDuration * 60000);
      const durationInMinutes =
        Math.max(
          0,
          Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        ) || svcDuration;
      const ticketResponse = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          staffId: values.staffId,
          items: [
            {
              serviceId: values.serviceId,
              quantity: 1,
              unitPrice,
              total: unitPrice,
            },
          ],
          quantity: 1,
          total: unitPrice,
          status: "Pending",
          notes: values.includeNotes ? values.notes : "",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: durationInMinutes,
        }),
      });

      if (!ticketResponse.ok) {
        const data = await ticketResponse.json();
        throw new Error(data.error || "Failed to create appointment");
      }

      setSuccess("Appointment created successfully");
      reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create appointment"
      );
    }
  };

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
      <CustomDialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("createAppointment")}</DialogTitle>
          <DialogDescription>
            {t("createAppointmentDescription")}
          </DialogDescription>
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Side - Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("appointmentDetails")}
                </h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("serviceLabel")}
                  </label>
                  <Controller
                    control={control}
                    name="serviceId"
                    rules={{ required: "Service is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectService")} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - ${service.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.serviceId && (
                    <p className="text-xs text-red-600">
                      {errors.serviceId.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("staffLabel")}
                  </label>
                  <Controller
                    control={control}
                    name="staffId"
                    rules={{ required: "Staff is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.staffId && (
                    <p className="text-xs text-red-600">
                      {errors.staffId.message as string}
                    </p>
                  )}
                </div>

                {/* Duration, price, start/end time are auto-calculated */}

                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Controller
                      control={control}
                      name="includeNotes"
                      render={({ field }) => (
                        <Checkbox
                          id="include-notes"
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                        />
                      )}
                    />
                    <label
                      htmlFor="include-notes"
                      className="text-sm font-semibold text-gray-800 cursor-pointer select-none flex-1"
                    >
                      {t("addAppointmentNote")}
                    </label>
                  </div>

                  {includeNotes && (
                    <div className="pt-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <label className="text-sm font-semibold text-gray-800">
                        {t("notesLabel")}
                      </label>
                      <textarea
                        {...register("notes")}
                        className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                        placeholder={t("notesPlaceholderAppointment")}
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Client Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("client")}</h3>
                <ClientDetailsTabs
                  existingCount={clients.length}
                  activeTab={existingClientId ? "existing" : "new"}
                  onChange={(v) => {
                    if (v === "new") {
                      reset({
                        ...watch(),
                        existingClientId: "",
                      });
                    } else if (clients[0]) {
                      reset({
                        ...watch(),
                        existingClientId: clients[0].id,
                      });
                    }
                  }}
                />

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
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t("name")}
                      </label>
                      <input
                        {...register("clientName", {
                          required: "Client name is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={t("name")}
                      />
                      {errors.clientName && (
                        <p className="text-xs text-red-600">
                          {errors.clientName.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t("email")}
                      </label>
                      <input
                        type="email"
                        {...register("clientEmail", {
                          required: "Client email is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={t("email")}
                      />
                      {errors.clientEmail && (
                        <p className="text-xs text-red-600">
                          {errors.clientEmail.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t("phone")}
                      </label>
                      <input
                        {...register("clientPhone", {
                          required: "Client phone is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={t("phone")}
                      />
                      {errors.clientPhone && (
                        <p className="text-xs text-red-600">
                          {errors.clientPhone.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t("instagramOptional")}
                      </label>
                      <input
                        {...register("clientInstagram")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="@instagram"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        {t("addressOptional")}
                      </label>
                      <input
                        {...register("clientAddress")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={t("address")}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-end gap-2 pt-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("creating") : t("createAppointment")}
              </button>
            </div>
          </form>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}
