"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

interface DateFilterProps {
  value: string;
  selectedDate: Date | undefined;
  onChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  value,
  selectedDate,
  onChange,
  onDateSelect,
}) => {
  const [dateSelectOpen, setDateSelectOpen] = useState(false);

  const getDateFilterLabel = () => {
    if (value === "all") return "All Time";
    if (value === "today") return "Today";
    if (value === "thisMonth") return "This Month";
    if (value === "calendar" && selectedDate) {
      return selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    return "Filter by date";
  };

  return (
    <Select
      value={value}
      onValueChange={onChange}
      open={dateSelectOpen}
      onOpenChange={setDateSelectOpen}
    >
      <SelectTrigger className="w-[180px]">
        <span className="text-sm">{getDateFilterLabel()}</span>
      </SelectTrigger>
      <SelectContent className="flex flex-col gap-2 items-start w-[300px]">
        <SelectItem className="h-10" value="all">
          All Time
        </SelectItem>
        <SelectItem className="h-10" value="today">
          Today
        </SelectItem>
        <SelectItem className="h-10" value="thisMonth">
          This Month
        </SelectItem>
        <div className="w-full p-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Select Date</p>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onDateSelect(date);
              setDateSelectOpen(false);
            }}
            className="w-full"
          />
        </div>
      </SelectContent>
    </Select>
  );
};

export default DateFilter;

