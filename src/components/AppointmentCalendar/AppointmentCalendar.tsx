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
import { toast } from "sonner";
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
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string; // Staff member ID
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
            .map((user: { id: string; name: string; role: string }) => ({
              id: user.id,
              name: user.name,
              role: user.role,
            }));
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
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => {
      const title = window.prompt("New Event name");
      if (title) {
        const resourceIdStr = slotInfo.resourceId?.toString();
        const staffMember = staff.find((s) => s.id === resourceIdStr);
        const eventTitle = staffMember
          ? `${title} (${staffMember.name})`
          : title;

        setEvents((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            title: eventTitle,
            start: slotInfo.start,
            end: slotInfo.end,
            resourceId: resourceIdStr,
          },
        ]);
      }
    },
    [staff]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    console.log("Event selected:", event);
    // Here you can open a dialog to edit/view the appointment
  }, []);

  // Handle event drag to new time
  const onEventDrop = useCallback(
    (data: {
      event: CalendarEvent;
      start: string | Date;
      end: string | Date;
      resourceId?: string | number;
      isAllDay?: boolean;
    }) => {
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
      toast.success("Event moved successfully");
    },
    [events]
  );

  // Handle event resize
  const onEventResize = useCallback(
    (data: {
      event: CalendarEvent;
      start: string | Date;
      end: string | Date;
      isAllDay?: boolean;
    }) => {
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
      toast.success("Event duration updated");
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
              <FiCalendar className="w-6 h-6 text-brand-500" />
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
              views={["day", "week"]}
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
    </div>
  );
}
