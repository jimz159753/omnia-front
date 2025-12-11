"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  duration: string;
  amount: string; // price
  includeNotes: boolean;
  notes: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientInstagram: string;
  clientAddress: string;
  existingClientId: string;
  startTime: string;
  endTime: string;
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
}: AppointmentFormDialogProps) {
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
      duration: "",
      amount: "",
      includeNotes: false,
      notes: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientInstagram: "",
      clientAddress: "",
      existingClientId: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  });

  const selectedServiceId = watch("serviceId");
  const includeNotes = watch("includeNotes");
  const existingClientId = watch("existingClientId");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const duration = watch("duration");

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

  useEffect(() => {
    if (!selectedServiceId) return;
    const svc = services.find((s) => s.id === selectedServiceId);
    if (svc) {
      setValue("amount", svc.price.toString());
      setValue("duration", svc.duration.toString());
    }
  }, [selectedServiceId, services, setValue]);

  // Populate form with initial slot data
  useEffect(() => {
    if (initialSlot && open) {
      setValue("startTime", initialSlot.start.toISOString().slice(0, 16));
      setValue("endTime", initialSlot.end.toISOString().slice(0, 16));
      if (initialSlot.resourceId) {
        setValue("staffId", initialSlot.resourceId);
      }
    }
  }, [initialSlot, open, setValue]);

  // Synchronize duration with start/end times (auto-calculate duration)
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        if (durationInMinutes >= 0) {
          const currentDuration = watch("duration");
          if (currentDuration !== durationInMinutes.toString()) {
            setValue("duration", durationInMinutes.toString(), { shouldValidate: false });
          }
        }
      }
    }
  }, [startTime, endTime, setValue, watch]);

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

      const unitPrice =
        services.find((s) => s.id === values.serviceId)?.price || 0;
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
          status: "pending",
          notes: values.includeNotes ? values.notes : "",
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          duration: parseInt(values.duration),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Fill out the appointment and client details below
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <FiAlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            <FiCheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Side - Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appointment Details</h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Service
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
                          <SelectValue placeholder="Select service" />
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
                    Staff
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register("startTime", {
                        required: "Start time is required",
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-600">
                        {errors.startTime.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register("endTime", {
                        required: "End time is required",
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-600">
                        {errors.endTime.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    {...register("duration", {
                      required: "Duration is required",
                      onChange: (e) => {
                        const durationMinutes = parseInt(e.target.value);
                        const currentStartTime = watch("startTime");
                        if (currentStartTime && !isNaN(durationMinutes) && durationMinutes > 0) {
                          const start = new Date(currentStartTime);
                          if (!isNaN(start.getTime())) {
                            const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
                            setValue("endTime", end.toISOString().slice(0, 16), { shouldValidate: false });
                          }
                        }
                      },
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Duration"
                  />
                  {errors.duration && (
                    <p className="text-xs text-red-600">
                      {errors.duration.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    {...register("amount", { required: "Price is required" })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-600">
                      {errors.amount.message as string}
                    </p>
                  )}
                </div>

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
                      Add appointment note?
                    </label>
                  </div>

                  {includeNotes && (
                    <div className="pt-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <label className="text-sm font-semibold text-gray-800">
                        Notes
                      </label>
                      <textarea
                        {...register("notes")}
                        className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                        placeholder="Add any notes about this appointment..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Client Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client</h3>
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
                        Name
                      </label>
                      <input
                        {...register("clientName", {
                          required: "Client name is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Client name"
                      />
                      {errors.clientName && (
                        <p className="text-xs text-red-600">
                          {errors.clientName.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register("clientEmail", {
                          required: "Client email is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="client@example.com"
                      />
                      {errors.clientEmail && (
                        <p className="text-xs text-red-600">
                          {errors.clientEmail.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        {...register("clientPhone", {
                          required: "Client phone is required",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Phone number"
                      />
                      {errors.clientPhone && (
                        <p className="text-xs text-red-600">
                          {errors.clientPhone.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Instagram (optional)
                      </label>
                      <input
                        {...register("clientInstagram")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="@instagram"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Address (optional)
                      </label>
                      <input
                        {...register("clientAddress")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Street address, city, state"
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Appointment"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
