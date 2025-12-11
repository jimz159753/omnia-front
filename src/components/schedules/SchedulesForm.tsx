"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { BiCalendar, BiSave } from "react-icons/bi";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { TimePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "@/styles/timepicker.css";

const scheduleSchema = z.object({
  monday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  tuesday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  wednesday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  thursday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  friday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  saturday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  sunday: z.object({
    isOpen: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

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
  if (!date) return "09:00";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function SchedulesForm() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      monday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      tuesday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      wednesday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      thursday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      friday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      saturday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
      sunday: { isOpen: false, startTime: "09:00", endTime: "17:00" },
    },
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedules");
        if (res.ok) {
          const json = await res.json();
          if (json?.data && json.data.length > 0) {
            const scheduleData: Partial<ScheduleFormValues> = {};
            json.data.forEach(
              (schedule: {
                dayOfWeek: string;
                isOpen: boolean;
                startTime?: string;
                endTime?: string;
              }) => {
                const day = schedule.dayOfWeek.toLowerCase();
                scheduleData[day as keyof ScheduleFormValues] = {
                  isOpen: schedule.isOpen,
                  startTime: schedule.startTime || "09:00",
                  endTime: schedule.endTime || "17:00",
                };
              }
            );
            reset(scheduleData as ScheduleFormValues);
          }
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    };
    fetchSchedules();
  }, [reset]);

  const onSubmit = async (values: ScheduleFormValues) => {
    try {
      const schedules = Object.entries(values).map(([day, schedule]) => ({
        dayOfWeek: day,
        isOpen: schedule.isOpen,
        startTime: schedule.startTime || null,
        endTime: schedule.endTime || null,
      }));

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || "Failed to save schedules"
        );
      }

      toast.success(t("scheduleSaveSuccess"));
    } catch (error) {
      console.error("Schedule save error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("scheduleSaveError");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <BiCalendar className="w-6 h-6 text-brand-500" />
        <p className="text-2xl font-medium">{t("businessSchedules")}</p>
      </div>
      <p className="text-sm text-gray-500 mb-6">{t("schedulesDescription")}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {daysOfWeek.map((day) => {
          const isOpen = watch(`${day}.isOpen`);

          return (
            <Card key={day} className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Controller
                      name={`${day}.isOpen`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label className="text-sm font-medium capitalize">
                      {t(`day${day.charAt(0).toUpperCase() + day.slice(1)}`)}
                    </label>
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col items-start gap-2 w-full">
                      <label
                        className={`text-sm transition-colors ${
                          isOpen ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {t("startTime")}:
                      </label>
                      <Controller
                        name={`${day}.startTime`}
                        control={control}
                        render={({ field }) => (
                          <TimePicker
                            format="hh:mm aa"
                            value={timeStringToDate(field.value)}
                            onChange={(date) =>
                              field.onChange(dateToTimeString(date))
                            }
                            cleanable={false}
                            disabled={!isOpen}
                            placement="bottomStart"
                            showMeridiem
                            style={{ width: "100%" }}
                          />
                        )}
                      />
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full">
                      <label
                        className={`text-sm transition-colors ${
                          isOpen ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {t("endTime")}:
                      </label>
                      <Controller
                        name={`${day}.endTime`}
                        control={control}
                        render={({ field }) => (
                          <TimePicker
                            format="hh:mm aa"
                            value={timeStringToDate(field.value)}
                            onChange={(date) =>
                              field.onChange(dateToTimeString(date))
                            }
                            cleanable={false}
                            disabled={!isOpen}
                            placement="bottomStart"
                            showMeridiem
                            style={{ width: "100%" }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <BiSave className="w-5 h-5" />
            <span>
              {isSubmitting
                ? tCommon("loading") ?? "Saving..."
                : t("saveSchedules")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
