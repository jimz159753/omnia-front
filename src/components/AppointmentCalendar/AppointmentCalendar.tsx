"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import {
  useAppointmentCalendar,
  formatDateWithCapitalization,
} from "@/hooks/useAppointmentCalendar";
import type {
  StaffMember,
  CalendarEvent,
} from "@/hooks/useAppointmentCalendar";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
} from "react-icons/fi";
import { UserDialog } from "@/components/dialogs/UserDialog";
import { AppointmentFormDialog } from "@/components/dialogs/AppointmentFormDialog";
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

// Create the DnD Calendar with proper types
const DnDCalendar = withDragAndDrop<CalendarEvent, StaffMember>(Calendar);

// Custom resource header component
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

export function AppointmentCalendar() {
  const { t, i18n } = useTranslation();

  // Use custom hook for all calendar logic
  const {
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
    setIsUserDialogOpen,
    setDeleteConfirmEvent,
    handleNavigate,
    handleViewChange,
    handleSelectSlot,
    handleSelectEvent,
    handleDeleteEvent,
    handleAppointmentSuccess,
    handleAppointmentDialogClose,
    onEventDrop,
    fetchStaff,
  } = useAppointmentCalendar();

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
                  <button className="flex items-center justify-center gap-2 hover:opacity-70 transition-opacity">
                    <FiCalendar className="w-6 h-6 text-brand-500 cursor-pointer" />
                    <p className="text-lg font-semibold">
                      {formatDateWithCapitalization(
                        currentDate,
                        locales,
                        locale
                      )}
                    </p>
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
              selectable
              resizable={false}
              step={5}
              timeslots={12}
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
        onOpenChange={handleAppointmentDialogClose}
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
