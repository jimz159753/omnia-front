import { useState, useCallback, useEffect } from "react";
import { View } from "react-big-calendar";
import { toast } from "sonner";

// Re-export utility function from utils
export { formatDateWithCapitalization } from "@/lib/utils";

// Types
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  position: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  ticketData?: {
    clientId: string;
    clientName: string;
    serviceId?: string;
    notes?: string;
    status: string;
  };
}

interface SelectedSlot {
  start: Date;
  end: Date;
  resourceId?: string | number;
}

interface SelectedEventData {
  ticketId?: string;
  clientId?: string;
  serviceId?: string;
  notes?: string;
}

/**
 * Custom hook to manage appointment calendar logic
 * Handles data fetching, event management, drag and drop, and conflicts
 */
export const useAppointmentCalendar = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("day");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedEventData, setSelectedEventData] =
    useState<SelectedEventData | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] =
    useState<CalendarEvent | null>(null);

  /**
   * Fetch staff members from API
   */
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          // Filter active users only
          const activeStaff = json.data
            .filter((user: { isActive: boolean }) => user.isActive)
            .map(
              (user: {
                id: string;
                name: string;
                role: string;
                position: string;
              }) => ({
                id: user.id,
                name: user.name,
                role: user.role,
                position: user.position || "",
              })
            );
          setStaff(activeStaff);
        }
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch appointments/tickets from API
   */
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets?pageSize=1000");
      if (res.ok) {
        const json = await res.json();
        const ticketsData = json?.data?.data || json?.data || [];

        if (ticketsData.length > 0) {
          const calendarEvents = ticketsData.map(
            (ticket: {
              id: string;
              clientId: string;
              client?: { name: string };
              items?: Array<{
                serviceId?: string;
                service?: { name: string };
                product?: { name: string };
              }>;
              notes?: string;
              status: string;
              createdAt: string;
              startTime?: string;
              endTime?: string;
              staffId: string;
            }) => {
              const itemName =
                ticket.items?.[0]?.service?.name ||
                ticket.items?.[0]?.product?.name ||
                "Item";

              const start = ticket.startTime
                ? new Date(ticket.startTime)
                : new Date(ticket.createdAt);
              const end = ticket.endTime
                ? new Date(ticket.endTime)
                : new Date(start.getTime() + 60 * 60 * 1000);

              return {
                id: ticket.id,
                title: `${ticket.client?.name || "Client"} - ${itemName}`,
                start,
                end,
                resourceId: ticket.staffId,
                ticketData: {
                  clientId: ticket.clientId,
                  clientName: ticket.client?.name || "Unknown Client",
                  serviceId: ticket.items?.[0]?.serviceId,
                  notes: ticket.notes || "",
                  status: ticket.status,
                },
              };
            }
          );
          setEvents(calendarEvents);
        } else {
          setEvents([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  }, []);

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    fetchStaff();
    fetchAppointments();
  }, [fetchStaff, fetchAppointments]);

  /**
   * Navigate to a different date
   */
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  /**
   * Change calendar view
   */
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  /**
   * Handle slot selection (clicking on empty time slot)
   */
  const handleSelectSlot = useCallback(
    ({
      start,
      end,
      resourceId,
    }: {
      start: Date;
      end: Date;
      resourceId?: string | number;
    }) => {
      if (isAppointmentDialogOpen) return;
      setSelectedSlot({ start, end, resourceId });
      setSelectedEventData(null);
      setIsAppointmentDialogOpen(true);
    },
    [isAppointmentDialogOpen]
  );

  /**
   * Handle event selection (clicking on existing event)
   */
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (isAppointmentDialogOpen) return;
      setSelectedSlot({
        start: event.start,
        end: event.end,
        resourceId: event.resourceId,
      });
      if (event.ticketData) {
        setSelectedEventData({
          ticketId: event.id,
          clientId: event.ticketData.clientId,
          serviceId: event.ticketData.serviceId,
          notes: event.ticketData.notes,
        });
      }
      setIsAppointmentDialogOpen(true);
    },
    [isAppointmentDialogOpen]
  );

  /**
   * Check for time conflicts between events
   */
  const checkTimeConflict = useCallback(
    (
      proposedStart: Date,
      proposedEnd: Date,
      staffId: string | number | undefined,
      excludeEventId?: string
    ): boolean => {
      return events.some((event) => {
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }
        if (event.resourceId !== staffId?.toString()) {
          return false;
        }
        return proposedStart < event.end && proposedEnd > event.start;
      });
    },
    [events]
  );

  /**
   * Handle event drag and drop
   */
  const onEventDrop = useCallback(
    async (data: {
      event: CalendarEvent;
      start: string | Date;
      end: string | Date;
      resourceId?: string | number;
      isAllDay?: boolean;
    }) => {
      const proposedStart = new Date(data.start);
      const proposedEnd = new Date(data.end);
      const targetStaffId = data.resourceId || data.event.resourceId;

      const hasConflict = checkTimeConflict(
        proposedStart,
        proposedEnd,
        targetStaffId,
        data.event.id
      );

      if (hasConflict) {
        toast.error(
          "Time conflict: This staff member already has an appointment during this time slot."
        );
        return;
      }

      // Optimistically update UI
      const updatedEvents = events.map((existingEvent) => {
        if (existingEvent.id === data.event.id) {
          return {
            ...existingEvent,
            start: proposedStart,
            end: proposedEnd,
            resourceId: targetStaffId?.toString() || existingEvent.resourceId,
          };
        }
        return existingEvent;
      });
      setEvents(updatedEvents);

      // Sync with backend
      try {
        const response = await fetch(`/api/tickets`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.event.id,
            startTime: proposedStart.toISOString(),
            endTime: proposedEnd.toISOString(),
            staffId: targetStaffId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update event");
        }

        toast.success("Event moved successfully");
      } catch (error) {
        console.error("Failed to update event:", error);
        toast.error("Failed to update event");
        setEvents(events);
      }
    },
    [events, checkTimeConflict]
  );

  /**
   * Handle delete event
   */
  const handleDeleteEvent = useCallback(async (event: CalendarEvent) => {
    try {
      const response = await fetch(`/api/tickets?id=${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeleteConfirmEvent(null);
    }
  }, []);

  /**
   * Handle appointment dialog success
   */
  const handleAppointmentSuccess = useCallback(() => {
    setIsAppointmentDialogOpen(false);
    setTimeout(() => {
      fetchAppointments();
    }, 1000);
  }, [fetchAppointments]);

  /**
   * Handle appointment dialog close
   */
  const handleAppointmentDialogClose = useCallback((open: boolean) => {
    setIsAppointmentDialogOpen(open);
    if (!open) {
      setSelectedSlot(null);
      setSelectedEventData(null);
    }
  }, []);

  return {
    // State
    currentDate,
    view,
    staff,
    events,
    loading,
    isUserDialogOpen,
    isAppointmentDialogOpen,
    selectedSlot,
    selectedEventData,
    deleteConfirmEvent,

    // Setters
    setIsUserDialogOpen,
    setDeleteConfirmEvent,

    // Handlers
    handleNavigate,
    handleViewChange,
    handleSelectSlot,
    handleSelectEvent,
    handleDeleteEvent,
    handleAppointmentSuccess,
    handleAppointmentDialogClose,
    onEventDrop,
    fetchStaff,
  };
};
