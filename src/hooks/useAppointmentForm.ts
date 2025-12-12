import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

// Types
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface User {
  id: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface AppointmentFormValues {
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
}

export interface UseAppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialSlot?: {
    start: Date;
    end: Date;
    resourceId?: string;
  } | null;
}

/**
 * Custom hook to manage appointment form logic
 * Handles data fetching, form state, validation, and submission
 */
export const useAppointmentForm = ({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
}: UseAppointmentFormProps) => {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form management
  const form = useForm<AppointmentFormValues>({
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

  const { control, register, handleSubmit, watch, reset, setValue, formState } = form;
  const { errors, isSubmitting } = formState;

  // Watched values
  const includeNotes = watch("includeNotes");
  const existingClientId = watch("existingClientId");

  /**
   * Fetch all required data (services, users, clients)
   */
  const fetchData = useCallback(async () => {
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
      console.error("Failed to load form data:", err);
      setError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new client or get existing client ID
   */
  const getOrCreateClient = useCallback(
    async (values: AppointmentFormValues): Promise<string> => {
      if (values.existingClientId) {
        return values.existingClientId;
      }

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

      // Handle existing client (409 conflict)
      if (clientResponse.status === 409) {
        const existingClientRes = await fetch(
          `/api/clients?email=${encodeURIComponent(values.clientEmail)}`
        );
        const clientData = await existingClientRes.json();
        
        if (!clientData || !clientData.id) {
          throw new Error("Client not found");
        }
        
        return clientData.id;
      }

      if (!clientResponse.ok) {
        throw new Error("Failed to create client");
      }

      const result = await clientResponse.json();
      return result.data.id;
    },
    []
  );

  /**
   * Calculate appointment details based on service and slot
   */
  const calculateAppointmentDetails = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId);
      const unitPrice = service?.price || 0;
      const serviceDuration = service?.duration ?? 60;
      
      const startTime = initialSlot?.start ?? new Date();
      const endTime =
        initialSlot?.end ??
        new Date(startTime.getTime() + serviceDuration * 60000);
      
      const durationInMinutes =
        Math.max(
          0,
          Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        ) || serviceDuration;

      return {
        unitPrice,
        startTime,
        endTime,
        durationInMinutes,
      };
    },
    [services, initialSlot]
  );

  /**
   * Create appointment ticket
   */
  const createAppointment = useCallback(
    async (
      clientId: string,
      values: AppointmentFormValues,
      appointmentDetails: ReturnType<typeof calculateAppointmentDetails>
    ) => {
      const { unitPrice, startTime, endTime, durationInMinutes } =
        appointmentDetails;

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

      return await ticketResponse.json();
    },
    []
  );

  /**
   * Form submission handler
   */
  const onSubmit = useCallback(
    async (values: AppointmentFormValues) => {
      setError("");
      setSuccess("");

      try {
        // Step 1: Get or create client
        const clientId = await getOrCreateClient(values);

        // Step 2: Calculate appointment details
        const appointmentDetails = calculateAppointmentDetails(values.serviceId);

        // Step 3: Create appointment
        await createAppointment(clientId, values, appointmentDetails);

        // Success
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
    },
    [
      getOrCreateClient,
      calculateAppointmentDetails,
      createAppointment,
      reset,
      onOpenChange,
      onSuccess,
    ]
  );

  // Effects

  /**
   * Fetch data when dialog opens
   */
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  /**
   * Reset form and clear messages when dialog state changes
   */
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

  /**
   * Populate form with initial slot data
   */
  useEffect(() => {
    if (initialSlot && open) {
      // Prefill the staff if provided
      if (initialSlot.resourceId) {
        setValue("staffId", initialSlot.resourceId);
      }
    }
  }, [initialSlot, open, setValue]);

  return {
    // Data
    services,
    users,
    clients,
    loading,
    error,
    success,
    
    // Form
    form,
    control,
    register,
    handleSubmit: handleSubmit(onSubmit),
    watch,
    errors,
    isSubmitting,
    
    // Watched values
    includeNotes,
    existingClientId,
    
    // Methods
    reset,
  };
};

