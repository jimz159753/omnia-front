"use client";

import * as React from "react";
import { FiClock, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value?: string; // Format: "HH:MM"
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minuteStep?: 5 | 10 | 15 | 30;
  businessHoursStart?: string; // Format: "HH:MM"
  businessHoursEnd?: string; // Format: "HH:MM"
}

export function TimePicker({
  value = "09:00",
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  minuteStep = 5,
  businessHoursStart = "09:00",
  businessHoursEnd = "18:00",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse current time
  const [hours, minutes] = value.split(":").map(Number);

  const incrementHours = () => {
    const newHours = (hours + 1) % 24;
    onChange?.(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  const decrementHours = () => {
    const newHours = hours === 0 ? 23 : hours - 1;
    onChange?.(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  const incrementMinutes = () => {
    const newMinutes = (minutes + minuteStep) % 60;
    const newHours = newMinutes < minutes ? (hours + 1) % 24 : hours;
    onChange?.(
      `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  const decrementMinutes = () => {
    const newMinutes =
      minutes - minuteStep < 0 ? 60 - minuteStep : minutes - minuteStep;
    const newHours =
      newMinutes > minutes ? (hours === 0 ? 23 : hours - 1) : hours;
    onChange?.(
      `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-semibold h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <FiClock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="start">
        <div className="flex flex-col items-center gap-4">
          {/* Time Spinner */}
          <div className="flex items-center justify-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementHours}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FiChevronUp className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-2xl font-bold w-20 text-center my-2">
                {hours.toString().padStart(2, "0")}
              </div>
              <button
                onClick={decrementHours}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FiChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Separator */}
            <div className="text-5xl font-bold text-gray-400">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <button
                onClick={incrementMinutes}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FiChevronUp className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-2xl font-bold w-20 text-center my-2">
                {minutes.toString().padStart(2, "0")}
              </div>
              <button
                onClick={decrementMinutes}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FiChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Business Hours Info */}
          <div className="w-full pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Business hours:{" "}
              <span className="font-medium text-gray-900">
                {businessHoursStart} - {businessHoursEnd}
              </span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
