"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { TimePicker } from "rsuite";
import {
  Dialog,
  DialogContent,
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
import { BiSave } from "react-icons/bi";
import "rsuite/dist/rsuite.min.css";

const restTimeSchema = z.object({
  dayOfWeek: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type RestTimeFormValues = z.infer<typeof restTimeSchema>;

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Helper function to convert time string to Date object
const timeStringToDate = (timeString?: string): Date | null => {
  if (!timeString) return null;
  const today = new Date();
  const [hours, minutes] = timeString.split(":");
  today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return today;
};

// Helper function to convert Date object to time string
const dateToTimeString = (date: Date | null): string => {
  if (!date) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

interface RestTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingRestTime?: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  } | null;
}

export function RestTimeDialog({
  open,
  onOpenChange,
  onSuccess,
  editingRestTime,
}: RestTimeDialogProps) {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestTimeFormValues>({
    resolver: zodResolver(restTimeSchema),
    defaultValues: {
      dayOfWeek: editingRestTime?.dayOfWeek || "",
      startTime: editingRestTime?.startTime || "12:00",
      endTime: editingRestTime?.endTime || "13:00",
    },
  });

  // Reset form when editingRestTime changes
  useEffect(() => {
    if (editingRestTime) {
      reset({
        dayOfWeek: editingRestTime.dayOfWeek,
        startTime: editingRestTime.startTime,
        endTime: editingRestTime.endTime,
      });
    } else {
      reset({
        dayOfWeek: "",
        startTime: "12:00",
        endTime: "13:00",
      });
    }
  }, [editingRestTime, reset, open]);

  const onSubmit = async (values: RestTimeFormValues) => {
    setIsSubmitting(true);
    try {
      const url = editingRestTime
        ? `/api/rest-times?id=${editingRestTime.id}`
        : "/api/rest-times";
      const method = editingRestTime ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || `Failed to ${editingRestTime ? "update" : "add"} rest time`
        );
      }

      toast.success(
        editingRestTime ? t("restTimeUpdateSuccess") : t("restTimeAddSuccess")
      );
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Rest time error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : editingRestTime
          ? t("restTimeUpdateError")
          : t("restTimeAddError");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {editingRestTime ? t("editRestTime") : t("addRestTime")}
              </DialogTitle>
              <p className="text-white/70 text-sm">Configura un tiempo de descanso</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Day Selection Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("selectDay")}</span>
            </div>
            <Controller
              name="dayOfWeek"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-300 transition-colors">
                    <SelectValue placeholder={t("selectDay")} />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {t(`day${day.charAt(0).toUpperCase() + day.slice(1)}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dayOfWeek && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.dayOfWeek.message}
              </p>
            )}
          </div>

          {/* Time Range Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("startTime")}
                </label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      format="hh:mm aa"
                      value={timeStringToDate(field.value)}
                      onChange={(date) => field.onChange(dateToTimeString(date))}
                      cleanable={false}
                      placement="bottomStart"
                      showMeridiem
                      style={{ width: "100%" }}
                      container={() => document.body}
                      preventOverflow
                    />
                  )}
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("endTime")}
                </label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      format="hh:mm aa"
                      value={timeStringToDate(field.value)}
                      onChange={(date) => field.onChange(dateToTimeString(date))}
                      cleanable={false}
                      placement="bottomStart"
                      showMeridiem
                      style={{ width: "100%" }}
                      container={() => document.body}
                      preventOverflow
                    />
                  )}
                />
                {errors.endTime && (
                  <p className="text-xs text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-amber-500/25 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {tCommon("loading") ?? "Saving..."}
                </>
              ) : (
                <>
                  <BiSave className="w-5 h-5" />
                  <span>
                    {editingRestTime
                      ? t("updateRestTime")
                      : t("addRestTime")}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

