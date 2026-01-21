import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

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
  existingClientIds: string[]; // Array of client IDs for multi-select
  googleCalendarId: string; // Selected Google Calendar ID
}

export interface UseAppointmentDetailsProps {
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
  selectedDate?: Date;
  selectedTime?: string;
  newItems?: Array<{
    productId?: string;
    serviceId?: string;
    staffId?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    discount?: number;
  }>;
  discountUpdates?: Record<string, number>;
  quantityUpdates?: Record<string, number>;
}

export interface TicketData {
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
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    discount?: number;
    product?: { name: string; id: string } | null;
    service?: { name: string; id: string } | null;
    type?: "product" | "service";
  }>;
  total: number;
}

/**
 * Custom hook to manage appointment details logic
 * Handles data fetching, form state, validation, and submission
 */
export const useAppointmentDetails = ({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
  initialData,
  selectedDate,
  selectedTime,
  newItems = [],
  discountUpdates = {},
  quantityUpdates = {},
}: UseAppointmentDetailsProps) => {
  const { t } = useTranslation("common");

  // State
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; cost: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [existingClientId, setExistingClientId] = useState("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");

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
      existingClientIds: [],
      googleCalendarId: "",
    },
  });

  const { control, register, handleSubmit, watch, reset, setValue, formState } =
    form;
  const { errors, isSubmitting } = formState;

  /**
   * Fetch all required data (services, users, clients)
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, usersRes, clientsRes, productsRes] =
        await Promise.all([
          fetch("/api/services"),
          fetch("/api/users"),
          fetch("/api/clients"),
          fetch("/api/products"),
        ]);

      const servicesData = await servicesRes.json();
      const usersData = await usersRes.json();
      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();

      setServices(servicesData.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      setClients(
        Array.isArray(clientsData) ? clientsData : clientsData.data || []
      );
      setProducts(
        Array.isArray(productsData) ? productsData : productsData.data || []
      );
    } catch (err) {
      console.error("Failed to load form data:", err);
      const errorMessage = t("formDataLoadError");
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  /**
   * Fetch ticket details for editing
   */
  const fetchTicketData = useCallback(
    async (ticketId: string) => {
      setLoading(true);
      try {
        console.log("Fetching ticket data for ID:", ticketId);
        const response = await fetch(`/api/tickets?id=${ticketId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch ticket data");
        }
        const json = await response.json();
        console.log("Ticket data response:", json);
        const ticket = json.data?.data?.[0] || json.data?.[0] || json.data;

        console.log("Parsed ticket:", ticket);
        console.log("Ticket items:", ticket?.items);

        if (ticket) {
          setTicketData(ticket);
          // Set the initial status when loading ticket data
          setSelectedStatus(ticket.status || "Pending");

          // Set client selection when loading ticket (for both single and multi-select)
          if (ticket.client?.id) {
            console.log("Setting client from ticket:", ticket.client.id);
            setValue("existingClientId", ticket.client.id);
            setValue("existingClientIds", [ticket.client.id]); // Set as array for multi-select
            setExistingClientId(ticket.client.id);
          }

          // Set Google Calendar selection when loading ticket
          if (ticket.googleCalendarId) {
            console.log("Setting Google Calendar from ticket:", ticket.googleCalendarId);
            setValue("googleCalendarId", ticket.googleCalendarId);
          }
        }
      } catch (err) {
        console.error("Failed to load ticket data:", err);
        const errorMessage = t("ticketDataLoadError");
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [t, setValue]
  );

  /**
   * Create or get existing client
   */
  const getOrCreateClient = useCallback(
    async (values: AppointmentFormValues): Promise<string> => {
      if (values.existingClientId) {
        return values.existingClientId;
      }

      const clientPayload = {
        name: values.clientName,
        email: values.clientEmail,
        phone: values.clientPhone || "",
        instagram: values.clientInstagram || null,
        address: values.clientAddress || "",
      };

      console.log("Creating client with payload:", clientPayload);

      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientPayload),
      });

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
        const errorData = await clientResponse.json();
        console.error("Client creation failed:", errorData);
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || "Failed to create client";
        throw new Error(errorMessage);
      }

      const result = await clientResponse.json();
      return result.data.id;
    },
    []
  );

  /**
   * Calculate appointment details
   */
  const calculateAppointmentDetails = useCallback(
    (serviceId: string, selectedDate?: Date, selectedTime?: string) => {
      const service = services.find((s) => s.id === serviceId);
      const unitPrice = service?.price || 0;
      const serviceDuration = service?.duration ?? 60;

      // Use selectedDate and selectedTime if provided, otherwise fall back to initialSlot
      let startTime: Date;
      if (selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);
      } else {
        startTime = initialSlot?.start ?? new Date();
      }

      // Always calculate endTime based on startTime + service duration
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

      return {
        unitPrice,
        startTime,
        endTime,
        durationInMinutes: serviceDuration,
      };
    },
    [services, initialSlot]
  );

  /**
   * Check for time conflicts with existing appointments
   */
  const checkTimeConflict = useCallback(
    async (
      staffId: string,
      startTime: Date,
      endTime: Date,
      excludeTicketId?: string
    ): Promise<boolean> => {
      try {
        console.log("Checking time conflict for:", {
          staffId,
          startTime,
          endTime,
          excludeTicketId,
        });

        const response = await fetch("/api/tickets");
        if (!response.ok) {
          console.error("Failed to fetch tickets for conflict check");
          return false;
        }

        const json = await response.json();
        const tickets = json?.data?.data || json?.data || [];

        console.log("Fetched tickets for conflict check:", tickets.length);

        // Check for overlapping appointments with the same staff
        const hasConflict = tickets.some(
          (ticket: {
            id: string;
            staffId: string;
            startTime?: string;
            endTime?: string;
          }) => {
            // Skip the ticket being edited
            if (excludeTicketId && ticket.id === excludeTicketId) {
              console.log("Skipping ticket being edited:", ticket.id);
              return false;
            }

            // Only check tickets for the same staff member
            if (ticket.staffId !== staffId) {
              return false;
            }

            // Skip if no time data
            if (!ticket.startTime || !ticket.endTime) {
              return false;
            }

            const existingStart = new Date(ticket.startTime);
            const existingEnd = new Date(ticket.endTime);

            // Check for overlap
            // Two time ranges overlap if: start1 < end2 AND start2 < end1
            const overlaps = startTime < existingEnd && endTime > existingStart;

            if (overlaps) {
              console.log("Time conflict detected:", {
                ticketId: ticket.id,
                existing: { start: existingStart, end: existingEnd },
                proposed: { start: startTime, end: endTime },
              });
            }

            return overlaps;
          }
        );

        console.log("Has conflict:", hasConflict);
        return hasConflict;
      } catch (error) {
        console.error("Error checking time conflict:", error);
        return false;
      }
    },
    []
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
          googleCalendarId: values.googleCalendarId || undefined,
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
   * Update existing appointment ticket
   */
  const updateAppointment = useCallback(
    async (
      ticketId: string,
      clientId: string,
      values: AppointmentFormValues,
      appointmentDetails: ReturnType<typeof calculateAppointmentDetails>
    ) => {
      const { unitPrice, startTime, endTime, durationInMinutes } =
        appointmentDetails;

      console.log("Updating ticket:", ticketId);
      console.log("New items to add:", newItems);

      const ticketResponse = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticketId,
          clientId,
          staffId: values.staffId,
          status: selectedStatus, // Include the selected status
          // Don't send items array - this will preserve existing items
          // Items are managed separately via ticket-items API
          quantity: 1,
          total: unitPrice,
          notes: values.includeNotes ? values.notes : "",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: durationInMinutes,
          googleCalendarId: values.googleCalendarId || undefined,
        }),
      });

      if (!ticketResponse.ok) {
        const data = await ticketResponse.json();
        throw new Error(data.error || "Failed to update appointment");
      }

      console.log("Ticket updated successfully");

      // Update quantities and discounts for existing items
      if (ticketData) {
        // Collect all items that need updates (either quantity or discount changed)
        const itemsToUpdate = new Set([
          ...Object.keys(quantityUpdates),
          ...Object.keys(discountUpdates),
        ]);

        if (itemsToUpdate.size > 0) {
          console.log("Updating quantities/discounts for existing items");
          for (const itemId of itemsToUpdate) {
            // Only update if it's an existing item (not a new item with temporary ID)
            const isExistingItem = ticketData.items.some(
              (item) => item.id === itemId
            );
            if (isExistingItem) {
              try {
                const item = ticketData.items.find((i) => i.id === itemId);
                if (item) {
                  // Get current values, using updated values if they exist
                  const quantity =
                    quantityUpdates[itemId] ?? item.quantity ?? 1;
                  const discount =
                    discountUpdates[itemId] ?? item.discount ?? 0;

                  // Calculate total: (unitPrice × quantity) - discount
                  const subtotal = item.unitPrice * quantity;
                  const discountAmount = (subtotal * discount) / 100;
                  const newTotal = subtotal - discountAmount;

                  const updateResponse = await fetch("/api/ticket-items", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: itemId,
                      quantity,
                      discount,
                      total: newTotal,
                      type: item.type || (item.product ? "product" : "service"),
                    }),
                  });

                  if (!updateResponse.ok) {
                    console.error("Failed to update item:", itemId);
                  } else {
                    console.log("Item updated successfully:", itemId, {
                      quantity,
                      discount,
                      total: newTotal,
                    });
                  }
                }
              } catch (error) {
                console.error("Error updating item:", itemId, error);
              }
            }
          }
        }
      }

      // Add all new items to the ticket
      if (newItems && newItems.length > 0) {
        console.log("Adding new items to ticket:", newItems);
        for (const item of newItems) {
          try {
            const itemResponse = await fetch("/api/ticket-items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ticketId,
                productId: item.productId || null,
                serviceId: item.serviceId || null,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice,
                total: item.total,
                discount: item.discount || 0,
              }),
            });

            if (!itemResponse.ok) {
              console.error("Failed to add item:", item);
            } else {
              console.log("Item added successfully:", item);
            }
          } catch (error) {
            console.error("Error adding item:", error);
          }
        }
      }
    },
    [selectedStatus, newItems, discountUpdates, quantityUpdates, ticketData]
  );

  /**
   * Form submission handler
   */
  const onSubmit = useCallback(
    async (values: AppointmentFormValues) => {
      setError("");
      setSuccess("");

      console.log("Form submitted with values:", values);
      const isEditing = !!initialData?.ticketId;
      console.log(
        "Is editing:",
        isEditing,
        "Ticket ID:",
        initialData?.ticketId
      );

      try {
        const appointmentDetails = calculateAppointmentDetails(
          values.serviceId,
          selectedDate,
          selectedTime
        );
        console.log("Appointment details calculated:", appointmentDetails);

        // Check for time conflicts (DISABLED - allow multiple appointments at same time)
        // console.log("About to check time conflict with:", {
        //   staffId: values.staffId,
        //   startTime: appointmentDetails.startTime,
        //   endTime: appointmentDetails.endTime,
        //   excludeTicketId: isEditing ? initialData?.ticketId : undefined,
        //   ticketDataId: ticketData?.id,
        // });

        // const hasConflict = await checkTimeConflict(
        //   values.staffId,
        //   appointmentDetails.startTime,
        //   appointmentDetails.endTime,
        //   isEditing ? ticketData?.id || initialData?.ticketId : undefined
        // );

        // if (hasConflict) {
        //   toast.error(t("timeConflictError"));
        //   return;
        // }

        if (isEditing && initialData?.ticketId) {
          // Update existing appointment - single client only
          const clientId = await getOrCreateClient(values);
          console.log("Client created/found with ID:", clientId);

          await updateAppointment(
            initialData.ticketId,
            clientId,
            values,
            appointmentDetails
          );
          toast.success(t("appointmentUpdatedSuccess"));
        } else {
          // Create new appointment(s) - support multiple clients
          const clientIds: string[] = [];

          // Handle multiple existing clients
          if (values.existingClientIds && values.existingClientIds.length > 0) {
            clientIds.push(...values.existingClientIds);
          } else {
            // Handle new client creation or single existing client (fallback)
            const clientId = await getOrCreateClient(values);
            console.log("Client created/found with ID:", clientId);
            clientIds.push(clientId);
          }

          console.log(
            `Creating ${clientIds.length} appointment(s) for clients:`,
            clientIds
          );

          // Create a separate ticket for each client
          const promises = clientIds.map((clientId) =>
            createAppointment(clientId, values, appointmentDetails)
          );

          await Promise.all(promises);

          toast.success(
            clientIds.length > 1
              ? `${clientIds.length} appointments created successfully`
              : t("appointmentCreatedSuccess")
          );
        }

        reset();

        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 800);
      } catch (err) {
        console.error(
          `Error ${isEditing ? "updating" : "creating"} appointment:`,
          err
        );
        const errorMessage =
          err instanceof Error
            ? err.message
            : t(
                isEditing ? "appointmentUpdateError" : "appointmentCreateError"
              );
        toast.error(errorMessage);
        setError(errorMessage);
      }
    },
    [
      initialData?.ticketId,
      getOrCreateClient,
      calculateAppointmentDetails,
      checkTimeConflict,
      createAppointment,
      updateAppointment,
      reset,
      onOpenChange,
      onSuccess,
      selectedDate,
      selectedTime,
      ticketData?.id,
      t,
    ]
  );

  // Effects

  /**
   * Fetch data when dialog opens
   */
  useEffect(() => {
    if (open) {
      fetchData();
      // Fetch ticket data if editing
      if (initialData?.ticketId) {
        fetchTicketData(initialData.ticketId);
      }
    }
  }, [open, fetchData, fetchTicketData, initialData?.ticketId]);

  /**
   * Reset form when dialog closes
   */
  useEffect(() => {
    if (open) {
      setError("");
      setSuccess("");
    } else {
      setError("");
      setSuccess("");
      reset();
      setIncludeNotes(false);
      setExistingClientId("");
    }
  }, [open, reset]);

  /**
   * Populate form with initial slot data
   */
  useEffect(() => {
    if (initialSlot && open) {
      if (initialSlot.resourceId) {
        setValue("staffId", initialSlot.resourceId);
      }
    }
  }, [initialSlot, open, setValue]);

  /**
   * Populate form with initial ticket data when editing
   */
  useEffect(() => {
    if (initialData && open) {
      console.log("Pre-filling form with initial data:", initialData);

      if (initialData.serviceId) {
        setValue("serviceId", initialData.serviceId);
      }

      if (initialData.clientId) {
        setValue("existingClientId", initialData.clientId);
        setExistingClientId(initialData.clientId);
      }

      if (initialData.notes) {
        setValue("notes", initialData.notes);
        setValue("includeNotes", true);
        setIncludeNotes(true);
      }
    }
  }, [initialData, open, setValue, setExistingClientId, setIncludeNotes]);

  return {
    // Data
    services,
    users,
    clients,
    products,
    loading,
    error,
    success,
    ticketData,
    setTicketData,

    // Form
    form,
    control,
    register,
    handleSubmit: handleSubmit(onSubmit),
    watch,
    reset,
    setValue,
    errors,
    isSubmitting,

    // Local state
    includeNotes,
    setIncludeNotes,
    existingClientId,
    setExistingClientId,
    selectedStatus,
    setSelectedStatus,
  };
};
