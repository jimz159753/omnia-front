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
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh]">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {isEditMode ? t("updateService") || "Update Service" : t("addService") || "Add Service"}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm">
                {isEditMode
                  ? t("updateServiceDescription") || "Update the details of the service."
                  : t("addServiceDescription") || "Fill in the details to add a new service."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50/50">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Basic Info Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Información Básica</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("name") || "Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      placeholder={t("enterServiceName") || "Enter service name"}
                      className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("serviceDescription") || "Description"}
                    </label>
                    <textarea
                      {...register("description")}
                      placeholder={t("enterServiceDescription") || "Enter service description"}
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("durationMin") || "Duration (min)"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register("duration")}
                        placeholder="60"
                        min="1"
                        className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                      {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message as string}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("slots") || "Concurrent Slots"}
                      </label>
                      <input
                        type="number"
                        {...register("slots")}
                        placeholder="Default"
                        min="1"
                        className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Categorización</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                          <SelectTrigger className="w-full h-10 border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select" />
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
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                          <SelectTrigger className="w-full h-10 border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {subCategories
                              .filter((sub) => !watchedCategoryId || sub.categoryId === watchedCategoryId)
                              .map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Precios y Comisión</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("price") || "Price"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                      <input
                        type="number"
                        {...register("price")}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full h-10 rounded-lg border-2 border-gray-200 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs">{errors.price.message as string}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("commission") || "Commission"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                      <input
                        type="number"
                        {...register("commission")}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full h-10 rounded-lg border-2 border-gray-200 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
                      />
                    </div>
                    {errors.commission && <p className="text-red-500 text-xs">{errors.commission.message as string}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Provider & Class Package Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Configuración Avanzada</h3>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                        <SelectTrigger className="w-full h-10 border-2 border-gray-200 rounded-lg">
                          <SelectValue placeholder={t("selectProvider") || "Select instructor"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none"><span className="text-gray-500">None</span></SelectItem>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BiCalendar className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">{t("classPackage") || "Class Package"}</span>
                    </div>
                    <Switch
                      checked={isClassPackage}
                      onCheckedChange={(checked) => {
                        setIsClassPackage(checked);
                        if (!checked) {
                          setValue("classes", "");
                          setValue("startDate", "");
                          setValue("endDate", "");
                        }
                      }}
                    />
                  </div>
                  
                  {isClassPackage && (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-3 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("classes") || "Number of Classes"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          {...register("classes")}
                          placeholder="e.g. 8"
                          min="1"
                          className="w-full h-10 rounded-lg border-2 border-blue-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("startDate") || "Start"}</label>
                          <Controller
                            control={control}
                            name="startDate"
                            render={({ field }) => (
                              <DatePicker
                                value={field.value ? parseISO(field.value) : undefined}
                                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                placeholder="Select start"
                                className="w-full h-10 border-blue-200"
                              />
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("endDate") || "End"}</label>
                          <Controller
                            control={control}
                            name="endDate"
                            render={({ field }) => (
                              <DatePicker
                                value={field.value ? parseISO(field.value) : undefined}
                                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                placeholder="Select end"
                                className="w-full h-10 border-blue-200"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                      <BiCalendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Horario Personalizado</h3>
                  </div>
                  <Switch
                    checked={useCustomSchedule}
                    onCheckedChange={(checked) => {
                      setUseCustomSchedule(checked);
                      if (checked) setScheduleExpanded(true);
                    }}
                  />
                </div>

                {useCustomSchedule && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <button
                      type="button"
                      onClick={() => setScheduleExpanded(!scheduleExpanded)}
                      className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider hover:text-teal-700"
                    >
                      {scheduleExpanded ? <>Hide Schedule <BiChevronUp /></> : <>Show Schedule <BiChevronDown /></>}
                    </button>

                    {scheduleExpanded && (
                      <div className="space-y-2 mt-2 bg-gray-50/50 p-2 rounded-xl max-h-[250px] overflow-y-auto">
                        {schedules.map((schedule, index) => (
                          <div key={schedule.dayOfWeek} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <Switch
                              checked={schedule.isOpen}
                              onCheckedChange={(checked) => {
                                const newSchedules = [...schedules];
                                newSchedules[index] = { ...schedule, isOpen: checked };
                                setSchedules(newSchedules);
                              }}
                              className="scale-75"
                            />
                            <span className="w-20 text-xs font-medium text-gray-600 truncate">
                              {t(schedule.dayOfWeek.toLowerCase()) || schedule.dayOfWeek}
                            </span>
                            {schedule.isOpen ? (
                              <div className="flex items-center gap-1 flex-1 justify-end">
                                <input
                                  type="time"
                                  value={schedule.startTime || "09:00"}
                                  onChange={(e) => {
                                    const newSchedules = [...schedules];
                                    newSchedules[index] = { ...schedule, startTime: e.target.value };
                                    setSchedules(newSchedules);
                                  }}
                                  className="w-20 px-1 py-1 text-xs border rounded focus:ring-1 focus:ring-teal-500"
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
                                  className="w-20 px-1 py-1 text-xs border rounded focus:ring-1 focus:ring-teal-500"
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic ml-auto mr-2">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Integrations Card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BiLogoGoogle className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Google Calendar</h3>
                </div>
                
                <div className="space-y-2">
                  {googleCalendars.length > 0 ? (
                    <Select
                      value={selectedGoogleCalendar}
                      onValueChange={(value) => setSelectedGoogleCalendar(value === "none" ? "" : value)}
                    >
                      <SelectTrigger className="w-full h-10 border-2 border-gray-200 rounded-lg">
                        <SelectValue placeholder={t("selectGoogleCalendar") || "Select calendar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none"><span className="text-gray-500">{t("noGoogleCalendar")}</span></SelectItem>
                        {googleCalendars.map((gcal) => (
                          <SelectItem key={gcal.calendarId} value={gcal.calendarId}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gcal.backgroundColor }} />
                              <span className="truncate max-w-[180px]">{gcal.summary}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                      <p className="text-xs text-gray-500">No calendars connected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">{t("serviceImage") || "Service Image"}</h3>
            <ImageDropzone
              value={watch("image")}
              onChange={(file) => setImageFile(file)}
              onError={(error) => setError(error)}
            />
          </div>

          <DialogFooter className="gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading || isSubmitting}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 transition-all font-medium"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-violet-500/25 flex items-center gap-2"
            >
              {loading || isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? t("updating") || "Updating..." : t("creating") || "Creating..."}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? t("updateService") || "Update Service" : t("createService") || "Create Service"}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
