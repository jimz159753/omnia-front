"use client";

import React, { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import copy from "copy-to-clipboard";

interface AppointmentHeaderProps {
  initialData?: {
    ticketId?: string;
    clientId?: string;
    serviceId?: string;
    notes?: string;
  } | null;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

export function AppointmentHeader({
  initialData,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: AppointmentHeaderProps) {
  const { t } = useTranslation("common");
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopyTicketId = () => {
    if (initialData?.ticketId) {
      copy(initialData.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between border-b p-4">
      {initialData ? (
        <div className="flex items-center gap-2">
          <p className="font-semibold">Ticket</p>
          <button
            type="button"
            onClick={handleCopyTicketId}
            className="text-sm font-semibold flex gap-2 items-center justify-center bg-gray-100 rounded-lg px-3 py-1.5 text-gray-900 hover:bg-gray-200 transition-colors"
          >
            #{initialData.ticketId}
            <FiCopy
              className={`h-4 w-4 ${copied ? "text-green-600" : ""}`}
            />
          </button>
          {copied && (
            <span className="text-xs text-green-600 font-medium">
              Copied!
            </span>
          )}
        </div>
      ) : (
        <p className="font-semibold">{t("createAppointment")}</p>
      )}
      {/* Date and Time Pickers */}
      <div className="flex items-center gap-3">
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Select date"
          className="w-fit"
        />
        <span className="text-gray-400">at</span>
        <TimePicker
          value={selectedTime}
          onChange={setSelectedTime}
          placeholder="Select time"
          className="w-[120px]"
          minuteStep={5}
          businessHoursStart="09:00"
          businessHoursEnd="18:00"
        />
      </div>
    </div>
  );
}

