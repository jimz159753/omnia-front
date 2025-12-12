"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
} from "react-icons/fi";
import { UserDialog } from "@/components/dialogs/UserDialog";
import { AppointmentFormDialog } from "@/components/dialogs/AppointmentFormDialog";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "@/styles/calendar.css";

// Setup the localizer for react-big-calendar
const locales = {
  "en-US": enUS,
  "es-ES": es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface StaffMember {
  id: string;
  name: string;
  role: string;
  position: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; // Staff member ID
  ticketData?: {
    clientId: string;
    clientName: string;
    serviceId?: string;
    notes?: string;
    status: string;
  };
}

// Create the DnD Calendar with proper types
const DnDCalendar = withDragAndDrop<CalendarEvent, StaffMember>(Calendar);

export function AppointmentCalendar() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("day");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
    resourceId?: string | number;
  } | null>(null);
  const [selectedEventData, setSelectedEventData] = useState<{
    clientId?: string;
    serviceId?: string;
    notes?: string;
  } | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] =
    useState<CalendarEvent | null>(null);

  // Fetch staff members
  const fetchStaff = async () => {
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
  };

  useEffect(() => {
    fetchStaff();
    fetchAppointments();
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

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
      setIsAppointmentDialogOpen(true);
    },
    [isAppointmentDialogOpen]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (isAppointmentDialogOpen) return;
      // Open the appointment dialog with the event's time slot and data pre-filled
      console.log("Event clicked:", event);
      setSelectedSlot({
        start: event.start,
        end: event.end,
        resourceId: event.resourceId,
      });
      // Set the event data if available
      if (event.ticketData) {
        setSelectedEventData({
          clientId: event.ticketData.clientId,
          serviceId: event.ticketData.serviceId,
          notes: event.ticketData.notes,
        });
      }
      setIsAppointmentDialogOpen(true);
    },
    [isAppointmentDialogOpen]
  );

  // Handle delete event
  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      const response = await fetch(`/api/tickets?id=${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Remove from local state
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success(t("eventDeleted") || "Event deleted successfully");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(t("eventDeleteError") || "Failed to delete event");
    } finally {
      setDeleteConfirmEvent(null);
    }
  };

  // Custom resource header component showing name and position
  const CustomResourceHeader = ({ resource }: { resource: StaffMember }) => {
    return (
      <div className="flex flex-col items-center justify-center py-1">
        <span className="font-semibold text-sm">{resource.name}</span>
        {resource.position && (
          <span className="text-xs opacity-80 font-normal">
            {resource.position}
          </span>
        )}
      </div>
    );
  };

  // Fetch appointments/tickets
  const fetchAppointments = async () => {
    try {
      // Fetch all tickets without pagination for calendar view
      const res = await fetch("/api/tickets?pageSize=1000");
      if (res.ok) {
        const json = await res.json();
        console.log("Tickets API response:", json);

        const ticketsData = json?.data?.data || json?.data || [];

        if (ticketsData.length > 0) {
          // Map tickets to calendar events
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

              // Use startTime/endTime if available, otherwise fallback to createdAt
              const start = ticket.startTime
                ? new Date(ticket.startTime)
                : new Date(ticket.createdAt);
              const end = ticket.endTime
                ? new Date(ticket.endTime)
                : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour if no endTime

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
          console.log("Mapped calendar events:", calendarEvents);
          setEvents(calendarEvents);
        } else {
          console.log("No tickets found, setting empty events");
          setEvents([]);
        }
      } else {
        console.error("Failed to fetch tickets:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  const handleAppointmentSuccess = () => {
    console.log("Appointment created, refreshing calendar...");
    setIsAppointmentDialogOpen(false);
    // Delay to ensure dialog closes and backend processes
    setTimeout(() => {
      fetchAppointments();
    }, 1000);
  };

  // Handle event drag to new time
  const onEventDrop = useCallback(
    async (data: {
      event: CalendarEvent;
      start: string | Date;
      end: string | Date;
      resourceId?: string | number;
      isAllDay?: boolean;
    }) => {
      // Optimistically update UI
      const updatedEvents = events.map((existingEvent) => {
        if (existingEvent.id === data.event.id) {
          return {
            ...existingEvent,
            start: new Date(data.start),
            end: new Date(data.end),
            resourceId: data.resourceId?.toString() || existingEvent.resourceId,
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
            startTime: new Date(data.start).toISOString(),
            endTime: new Date(data.end).toISOString(),
            staffId: data.resourceId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update event");
        }

        toast.success("Event moved successfully");
      } catch (error) {
        console.error("Failed to update event:", error);
        toast.error("Failed to update event");
        // Revert optimistic update
        setEvents(events);
      }
    },
    [events]
  );

  // Handle event resize
  const onEventResize = useCallback(
    async (data: {
      event: CalendarEvent;
      start: string | Date;
      end: string | Date;
      isAllDay?: boolean;
    }) => {
      // Optimistically update UI
      const updatedEvents = events.map((existingEvent) => {
        if (existingEvent.id === data.event.id) {
          return {
            ...existingEvent,
            start: new Date(data.start),
            end: new Date(data.end),
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
            startTime: new Date(data.start).toISOString(),
            endTime: new Date(data.end).toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update event");
        }

        toast.success("Event duration updated");
      } catch (error) {
        console.error("Failed to update event:", error);
        toast.error("Failed to update event");
        // Revert optimistic update
        setEvents(events);
      }
    },
    [events]
  );

  const locale = i18n.language === "es" ? "es-ES" : "en-US";

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="hover:opacity-70 transition-opacity">
                    <FiCalendar className="w-6 h-6 text-brand-500 cursor-pointer" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        handleNavigate(date);
                      }
                    }}
                    initialFocus
                    className="w-[250px]"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-2xl font-semibold">{t("calendar")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUserDialogOpen(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors flex items-center gap-2"
              >
                <FiUserPlus className="w-4 h-4" />
                Add Staff
              </button>
              <button
                onClick={() => handleNavigate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t("today")}
              </button>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() - 1);
                    handleNavigate(newDate);
                  }}
                  className="p-2 hover:bg-gray-50 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() + 1);
                    handleNavigate(newDate);
                  }}
                  className="p-2 hover:bg-gray-50 transition-colors border-l border-gray-300"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {format(currentDate, "EEEE, MMMM d, yyyy", {
              locale: locales[locale],
            })}
          </p>
        </div>
        <div>
          <div
            className="calendar-container"
            style={{ height: "calc(100vh - 280px)" }}
          >
            <DnDCalendar
              localizer={localizer}
              culture={locale}
              events={events}
              resources={staff}
              resourceIdAccessor={(resource: StaffMember) => resource.id}
              resourceTitleAccessor={(resource: StaffMember) => resource.name}
              startAccessor={(event: CalendarEvent) => event.start}
              endAccessor={(event: CalendarEvent) => event.end}
              view={view}
              onView={handleViewChange}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              selectable
              resizable
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 8, 0, 0)}
              max={new Date(2024, 0, 1, 20, 0, 0)}
              defaultView="day"
              views={["day"]}
              toolbar={false}
              formats={{
                timeGutterFormat: (date, culture, localizer) =>
                  localizer?.format(date, "h:mm a", culture) ?? "",
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer?.format(
                    start,
                    "h:mm a",
                    culture
                  )} - ${localizer?.format(end, "h:mm a", culture)}`,
                dayHeaderFormat: (date, culture, localizer) =>
                  localizer?.format(date, "EEEE, MMMM d", culture) ?? "",
              }}
              components={{
                resourceHeader: ({ resource }) => (
                  <CustomResourceHeader resource={resource} />
                ),
              }}
            />
          </div>
        </div>
      </div>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onSuccess={() => {
          fetchStaff();
        }}
        editingUser={null}
      />

      <AppointmentFormDialog
        open={isAppointmentDialogOpen}
        onOpenChange={(open) => {
          setIsAppointmentDialogOpen(open);
          if (!open) {
            setSelectedSlot(null);
            setSelectedEventData(null);
          }
        }}
        onSuccess={handleAppointmentSuccess}
        initialSlot={
          selectedSlot
            ? {
                start: selectedSlot.start,
                end: selectedSlot.end,
                resourceId: selectedSlot.resourceId?.toString(),
              }
            : null
        }
        initialData={selectedEventData}
      />

      <AlertDialog
        open={!!deleteConfirmEvent}
        onOpenChange={(open: boolean) => !open && setDeleteConfirmEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteAppointment") || "Delete Appointment"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAppointmentDescription") ||
                "Are you sure you want to delete this appointment? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmEvent && handleDeleteEvent(deleteConfirmEvent)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              {t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
