import {
  Controller,
  UseFormRegister,
  Control,
  FieldErrors,
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
import { useAuth } from "@/hooks/useAuth";
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
}: AppointmentDetailsSectionProps) => {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  // Get current user's display name
  const currentUserName = user?.name || user?.email || "";

  // Calculate derived values
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const duration = selectedService?.duration || 0;
  const price = selectedService?.price || 0;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">{t("appointmentDetails")}</h3>
      </div>

      {/* Service details in card layout */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Staff */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("staffLabel")}
            </label>
            {isAdmin ? (
              <Controller
                control={control}
                name="staffId"
                rules={{ required: "Staff is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-11 rounded-xl border-2 border-gray-200">
                      <SelectValue placeholder={t("selectStaff")} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <input
                type="text"
                readOnly
                disabled
                value={currentUserName}
                className="w-full h-11 rounded-xl border-2 border-gray-100 px-4 text-sm bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
              />
            )}
            {errors.staffId && (
              <p className="text-xs text-red-600">
                {errors.staffId.message as string}
              </p>
            )}
          </div>

          {/* Service */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("serviceLabel")}
            </label>
            <Controller
              control={control}
              name="serviceId"
              rules={{ required: "Service is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-2 border-gray-200">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("durationLabel")}
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={selectedServiceId ? `${duration} min` : ""}
                className="w-full h-11 rounded-xl border-2 border-gray-100 px-4 text-sm bg-gray-50 text-gray-600 font-medium"
                placeholder="0 min"
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("price")}
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={selectedServiceId ? `$${price.toFixed(2)}` : ""}
                className="w-full h-11 rounded-xl border-2 border-gray-100 px-4 text-sm bg-gray-50 text-gray-600 font-medium"
                placeholder="$0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Package Info */}
      {selectedService && (selectedService.classes || selectedService.provider) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3 animate-in slide-in-from-top-2">
           <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Detalles del Paquete</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {selectedService.classes && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-700/70 uppercase tracking-wider">
                  {t("classes") || "Classes"}
                </label>
                <p className="text-sm font-bold text-blue-900">
                  {selectedService.classes} {t("sessions") || "sessions"}
                </p>
              </div>
            )}
            {selectedService.provider && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-700/70 uppercase tracking-wider">
                  {t("instructor") || "Instructor"}
                </label>
                <p className="text-sm font-bold text-blue-900">
                  {selectedService.provider.name}
                </p>
              </div>
            )}
            {selectedService.startDate && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-700/70 uppercase tracking-wider">
                  {t("startDate") || "Start Date"}
                </label>
                <p className="text-sm font-bold text-blue-900">
                  {new Date(selectedService.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedService.endDate && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-700/70 uppercase tracking-wider">
                  {t("endDate") || "End Date"}
                </label>
                <p className="text-sm font-bold text-blue-900">
                  {new Date(selectedService.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIncludeNotes(!includeNotes)}
          className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${includeNotes ? "bg-indigo-500 border-indigo-500" : "border-gray-300 group-hover:border-indigo-400"}`}>
            {includeNotes && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className={`text-sm font-medium ${includeNotes ? "text-indigo-700" : "text-gray-600 group-hover:text-indigo-600"}`}>
            {t("addAppointmentNote")}
          </span>
        </button>

        {includeNotes && (
          <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
            <textarea
              {...register("notes")}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
              placeholder={t("notesPlaceholderAppointment")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

