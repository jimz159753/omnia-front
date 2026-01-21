import {
  Controller,
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/useTranslation";
import { GoogleCalendarSelector } from "./GoogleCalendarSelector";
import type {
  Service,
  User,
  AppointmentFormValues,
} from "@/hooks/useAppointmentDetails";

interface AppointmentDetailsSectionProps {
  control: Control<AppointmentFormValues>;
  register: UseFormRegister<AppointmentFormValues>;
  errors: FieldErrors<AppointmentFormValues>;
  users: User[];
  services: Service[];
  includeNotes: boolean;
  setIncludeNotes: (value: boolean) => void;
  selectedServiceId: string;
  userId: string;
  setValue: UseFormSetValue<AppointmentFormValues>;
  selectedCalendarId?: string;
}

/**
 * Appointment Details Section Component
 * Displays staff, service, duration, price, and notes fields
 */
export const AppointmentDetailsSection = ({
  control,
  register,
  errors,
  users,
  services,
  includeNotes,
  setIncludeNotes,
  selectedServiceId,
  userId,
  setValue,
  selectedCalendarId,
}: AppointmentDetailsSectionProps) => {
  const { t } = useTranslation("common");

  // Calculate derived values
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const duration = selectedService?.duration || 0;
  const price = selectedService?.price || 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold">{t("appointmentDetails")}</h3>

      {/* Service details in horizontal layout */}
      <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-md">
        {/* Staff */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {t("staffLabel")}
          </label>
          <Controller
            control={control}
            name="staffId"
            rules={{ required: "Staff is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t("selectStaff")} />
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

        {/* Service */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {t("serviceLabel")}
          </label>
          <Controller
            control={control}
            name="serviceId"
            rules={{ required: "Service is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t("selectService")} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
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

        {/* Duration (auto-calculated) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {t("durationLabel")}
          </label>
          <input
            type="text"
            readOnly
            value={selectedServiceId ? `${duration} min` : ""}
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50"
            placeholder="0 min"
          />
        </div>

        {/* Price (auto-calculated) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {t("price")}
          </label>
          <input
            type="text"
            readOnly
            value={selectedServiceId ? `$${price.toFixed(2)}` : ""}
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50"
            placeholder="$0.00"
          />
        </div>
      </div>

      {/* Notes Checkbox */}
      <div className="border-t p-4">
        <div
          className="flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Controller
            control={control}
            name="includeNotes"
            render={({ field }) => (
              <Checkbox
                id="include-notes"
                checked={field.value}
                onCheckedChange={(checked) => {
                  const boolValue = Boolean(checked);
                  field.onChange(boolValue);
                  setIncludeNotes(boolValue);
                }}
              />
            )}
          />
          <label
            htmlFor="include-notes"
            className="text-sm font-semibold text-gray-800 cursor-pointer select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {t("addAppointmentNote")}
          </label>
        </div>
      </div>

      {/* Notes Textarea */}
      {includeNotes && (
        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <label className="text-sm font-semibold text-gray-700">
            {t("notesLabel")}
          </label>
          <textarea
            {...register("notes")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            placeholder={t("notesPlaceholderAppointment")}
            rows={4}
          />
        </div>
      )}

      {/* Google Calendar Selector */}
      <div className="border-t pt-4">
        <GoogleCalendarSelector
          value={selectedCalendarId}
          onChange={(calendarId) => setValue("googleCalendarId", calendarId)}
          userId={userId}
          error={errors.googleCalendarId?.message}
        />
      </div>
    </div>
  );
};
