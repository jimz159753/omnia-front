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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingRestTime ? t("editRestTime") : t("addRestTime")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("selectDay")}
            </label>
            <Controller
              name="dayOfWeek"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
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
              <p className="text-xs text-red-500">{errors.dayOfWeek.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
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
            <label className="text-sm font-medium text-gray-700">
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

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <BiSave className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? tCommon("loading") ?? "Saving..."
                  : editingRestTime
                  ? t("updateRestTime")
                  : t("addRestTime")}
              </span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

