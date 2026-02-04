"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { CustomAlert } from "@/components/ui/CustomAlert";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { useTranslation } from "@/hooks/useTranslation";
import { BiLogoGoogle } from "react-icons/bi";
import { Switch } from "@/components/ui/switch";
import { BiCalendar, BiChevronDown, BiChevronUp } from "react-icons/bi";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";

interface GoogleCalendar {
  calendarId: string;
  summary: string;
  backgroundColor: string;
  primary?: boolean;
}

interface ServiceSchedule {
  dayOfWeek: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_SCHEDULES: ServiceSchedule[] = DAYS_OF_WEEK.map((day) => ({
  dayOfWeek: day,
  isOpen: false,
  startTime: "09:00",
  endTime: "18:00",
}));

export interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: ServiceWithRelations | null;
}

export function ServiceFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: ServiceFormModalProps) {
  const { t } = useTranslation("services");
  const isEditMode = !!item;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; categoryId: string }[]
  >([]);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedGoogleCalendar, setSelectedGoogleCalendar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Schedule state
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>(DEFAULT_SCHEDULES);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  
  // Class package state
  const [isClassPackage, setIsClassPackage] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: "",
      commission: "",
      slots: "",
      classes: "",
      providerId: "",
      startDate: "",
      endDate: "",
      categoryId: "",
      subCategoryId: "",
      image: "",
    },
  });

  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setError("");
      try {
        const [catRes, subRes, provRes, gcalRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
          fetch("/api/providers"),
          fetch("/api/google-calendar/calendars"),
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();
        const provData = await provRes.json();
        const gcalData = await gcalRes.json();
        setCategories(catData.data || []);
        setSubCategories(subData.data || []);
        setProviders(provData.data || []);
        setGoogleCalendars(gcalData.calendars || []);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadData") || "Failed to load form data");
      }
    };

    load();

    if (item) {
      const serviceItem = item as ServiceWithRelations & { 
        googleCalendarId?: string;
        classes?: number;
        providerId?: string;
        startDate?: string;
        endDate?: string;
      };
      reset({
        name: item.name,
        description: item.description ?? "",
        duration: item.duration.toString(),
        price: item.price.toString(),
        commission: item.commission.toString(),
        slots: item.slots ? item.slots.toString() : "",
        classes: serviceItem.classes ? serviceItem.classes.toString() : "",
        providerId: serviceItem.providerId ?? "",
        startDate: serviceItem.startDate ? new Date(serviceItem.startDate).toISOString().split('T')[0] : "",
        endDate: serviceItem.endDate ? new Date(serviceItem.endDate).toISOString().split('T')[0] : "",
        categoryId: item.categoryId ?? "",
        subCategoryId: item.subCategoryId ?? "",
        image: item.image ?? "",
      });
      setSelectedGoogleCalendar(serviceItem.googleCalendarId || "");
      setImageFile(null);
      
      // Load schedules if service has custom schedules
      const serviceWithSchedules = item as ServiceWithRelations & { 
        useCustomSchedule?: boolean;
        schedules?: ServiceSchedule[];
      };
      setUseCustomSchedule(serviceWithSchedules.useCustomSchedule || false);
      if (serviceWithSchedules.schedules && serviceWithSchedules.schedules.length > 0) {
        // Merge existing schedules with default ones
        const mergedSchedules = DAYS_OF_WEEK.map((day) => {
          const existing = serviceWithSchedules.schedules?.find(
            (s) => s.dayOfWeek === day
          );
          return existing || {
            dayOfWeek: day,
            isOpen: false,
            startTime: "09:00",
            endTime: "18:00",
          };
        });
        setSchedules(mergedSchedules);
        setScheduleExpanded(true);
      } else {
        setSchedules(DEFAULT_SCHEDULES);
        setScheduleExpanded(false);
      }
      
      // Set isClassPackage based on whether service has classes
      setIsClassPackage(!!serviceItem.classes && serviceItem.classes > 0);
    } else {
      reset({
        name: "",
        description: "",
        duration: "",
        price: "",
        commission: "",
        slots: "",
        classes: "",
        providerId: "",
        startDate: "",
        endDate: "",
        categoryId: "",
        subCategoryId: "",
        image: "",
      });
      setSelectedGoogleCalendar("");
      setImageFile(null);
      setUseCustomSchedule(false);
      setSchedules(DEFAULT_SCHEDULES);
      setScheduleExpanded(false);
      setIsClassPackage(false);
    }
  }, [open, item, reset, t]);

  const onSubmit = async (values: ServiceFormData) => {
    setError("");
    setLoading(true);
    try {
      let imageUrl = values.image;

      // Upload image if a file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...values,
        duration: Number(values.duration),
        price: Number(values.price),
        commission: Number(values.commission),
        slots: values.slots ? Number(values.slots) : null,
        classes: values.classes ? Number(values.classes) : null,
        providerId: values.providerId || null,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        image: imageUrl,
        googleCalendarId: selectedGoogleCalendar || null,
        useCustomSchedule,
        schedules: useCustomSchedule ? schedules : [],
      };

      const response = await fetch("/api/services", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode ? { ...payload, id: item?.id } : payload
        ),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to ${isEditMode ? "update" : "create"} service`
        );
      }

      // Show toast immediately and close dialog
      toast.success(isEditMode ? t("serviceUpdatedSuccess") : t("serviceCreatedSuccess"));
      reset();
      setImageFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("updateService") || "Update Service" : t("addService") || "Add Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("updateServiceDescription") || "Update the details of the service."
              : t("addServiceDescription") || "Fill in the details to add a new service."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              {t("name") || "Name"}<span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder={t("enterServiceName") || "Enter service name"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              {t("serviceDescription") || "Description"}
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder={t("enterServiceDescription") || "Enter service description"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("category") || "Category"}
            </label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("subCategoryId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory") || "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("subcategory") || "Subcategory"}
            </label>
            <Controller
              control={control}
              name="subCategoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectSubcategory") || "Select a subcategory"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories
                      .filter(
                        (sub) =>
                          !watchedCategoryId ||
                          sub.categoryId === watchedCategoryId
                      )
                      .map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subCategoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subCategoryId.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="text-sm font-medium text-gray-700"
              >
                {t("durationMin") || "Duration (min)"}<span className="text-red-500">*</span>
              </label>
              <input
                id="duration"
                type="number"
                {...register("duration")}
                placeholder="60"
                min="1"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.duration.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slots"
                className="text-sm font-medium text-gray-700"
              >
                {t("slots") || "Concurrent Slots"}
              </label>
              <input
                id="slots"
                type="number"
                {...register("slots")}
                placeholder={t("slotsPlaceholder") || "Use calendar default"}
                min="1"
                max="100"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-500">
                {t("slotsDescription") || "Leave empty to use calendar default, or set a specific number"}
              </p>
              {errors.slots && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.slots.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
                {t("price") || "Price"}<span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                {...register("price")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="commission"
                className="text-sm font-medium text-gray-700"
              >
                {t("commission") || "Commission"}<span className="text-red-500">*</span>
              </label>
              <input
                id="commission"
                type="number"
                {...register("commission")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.commission && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.commission.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Provider/Instructor Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("provider") || "Instructor/Provider"}
            </label>
            <Controller
              control={control}
              name="providerId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProvider") || "Select an instructor"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-gray-500">{t("noProvider") || "No instructor assigned"}</span>
                    </SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.providerId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.providerId.message as string}
              </p>
            )}
          </div>

          {/* Class Package Toggle */}
          <div className="space-y-3 border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BiCalendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  {t("classPackage") || "Class Package"}
                </span>
              </div>
              <Switch
                checked={isClassPackage}
                onCheckedChange={(checked) => {
                  setIsClassPackage(checked);
                  if (!checked) {
                    // Clear class package fields when disabled
                    setValue("classes", "");
                    setValue("startDate", "");
                    setValue("endDate", "");
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t("classPackageDescription") || "Enable this if the service is a package of multiple classes with a date range. Class packages are sold as packages and won't appear in the appointment calendar."}
            </p>

            {isClassPackage && (
              <div className="space-y-4 pt-3 border-t border-blue-200">
                {/* Classes Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="classes"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("classes") || "Number of Classes"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="classes"
                    type="number"
                    {...register("classes")}
                    placeholder={t("classesPlaceholder") || "e.g. 8, 12, 16"}
                    min="1"
                    step="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-gray-500">
                    {t("classesDescription") || "Number of classes to schedule between start and end dates"}
                  </p>
                  {errors.classes && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.classes.message as string}
                    </p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("startDate") || "Start Date"}
                    </label>
                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? parseISO(field.value) : undefined}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          placeholder={t("selectStartDate") || "Select start date"}
                        />
                      )}
                    />
                    <p className="text-xs text-gray-500">
                      {t("startDateDescription") || "When the class package begins"}
                    </p>
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("endDate") || "End Date"}
                    </label>
                    <Controller
                      control={control}
                      name="endDate"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value ? parseISO(field.value) : undefined}
                          onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          placeholder={t("selectEndDate") || "Select end date"}
                        />
                      )}
                    />
                    <p className="text-xs text-gray-500">
                      {t("endDateDescription") || "When the class package ends"}
                    </p>
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endDate.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("serviceImage") || "Service Image"}
            </label>
            <ImageDropzone
              value={watch("image")}
              onChange={(file) => setImageFile(file)}
              onError={(error) => setError(error)}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image.message as string}
              </p>
            )}
          </div>

          {/* Google Calendar Integration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <BiLogoGoogle className="w-4 h-4 text-blue-500" />
                {t("googleCalendar") || "Google Calendar"}
              </div>
            </label>
            {googleCalendars.length > 0 ? (
              <Select
                value={selectedGoogleCalendar}
                onValueChange={(value) => setSelectedGoogleCalendar(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectGoogleCalendar") || "Select a Google Calendar"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-gray-500">{t("noGoogleCalendar") || "No Google Calendar"}</span>
                  </SelectItem>
                  {googleCalendars.map((gcal) => (
                    <SelectItem key={gcal.calendarId} value={gcal.calendarId}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: gcal.backgroundColor }}
                        />
                        <span>{gcal.summary}</span>
                        {gcal.primary && (
                          <span className="text-xs text-gray-400 ml-1">(Primary)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-sm text-gray-500">
                  {t("noGoogleCalendarsConnected") || "No Google Calendar connected. Connect your Google account in settings to sync appointments."}
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {t("googleCalendarSyncDescription") || "Appointments for this service will be added to the selected Google Calendar"}
            </p>
          </div>

          {/* Service-Specific Schedule */}
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BiCalendar className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  {t("customSchedule") || "Custom Availability"}
                </span>
              </div>
              <Switch
                checked={useCustomSchedule}
                onCheckedChange={(checked) => {
                  setUseCustomSchedule(checked);
                  if (checked) setScheduleExpanded(true);
                }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t("customScheduleDescription") || "Set specific days and hours when this service is available. If disabled, the business schedule will be used."}
            </p>

            {useCustomSchedule && (
              <>
                <button
                  type="button"
                  onClick={() => setScheduleExpanded(!scheduleExpanded)}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {scheduleExpanded ? (
                    <>
                      <BiChevronUp className="w-4 h-4" />
                      {t("hideSchedule") || "Hide schedule"}
                    </>
                  ) : (
                    <>
                      <BiChevronDown className="w-4 h-4" />
                      {t("showSchedule") || "Show schedule"}
                    </>
                  )}
                </button>

                {scheduleExpanded && (
                  <div className="space-y-3 mt-3">
                    {schedules.map((schedule, index) => (
                      <div
                        key={schedule.dayOfWeek}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                      >
                        <div className="w-24">
                          <Switch
                            checked={schedule.isOpen}
                            onCheckedChange={(checked) => {
                              const newSchedules = [...schedules];
                              newSchedules[index] = { ...schedule, isOpen: checked };
                              setSchedules(newSchedules);
                            }}
                          />
                        </div>
                        <span className={`w-24 text-sm font-medium ${schedule.isOpen ? "text-gray-700" : "text-gray-400"}`}>
                          {t(schedule.dayOfWeek.toLowerCase()) || schedule.dayOfWeek}
                        </span>
                        {schedule.isOpen && (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={schedule.startTime || "09:00"}
                              onChange={(e) => {
                                const newSchedules = [...schedules];
                                newSchedules[index] = { ...schedule, startTime: e.target.value };
                                setSchedules(newSchedules);
                              }}
                              className="px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="time"
                              value={schedule.endTime || "18:00"}
                              onChange={(e) => {
                                const newSchedules = [...schedules];
                                newSchedules[index] = { ...schedule, endTime: e.target.value };
                                setSchedules(newSchedules);
                              }}
                              className="px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        )}
                        {!schedule.isOpen && (
                          <span className="text-sm text-gray-400 italic">
                            {t("closed") || "Closed"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading || isSubmitting}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting
                ? isEditMode
                  ? t("updating") || "Updating..."
                  : t("creating") || "Creating..."
                : isEditMode
                ? t("updateService") || "Update Service"
                : t("createService") || "Create Service"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
