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
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-5 flex items-center justify-between">
      {initialData ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Ticket</p>
            <button
              type="button"
              onClick={handleCopyTicketId}
              className="text-white font-bold flex gap-2 items-center hover:text-white/80 transition-colors"
            >
              #{initialData.ticketId}
              <FiCopy
                className={`h-4 w-4 ${copied ? "text-green-300" : "text-white/70"}`}
              />
            </button>
          </div>
          {copied && (
            <span className="text-xs text-green-300 font-medium bg-green-500/20 px-2 py-1 rounded-full">
              ¡Copiado!
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{t("createAppointment")}</p>
            <p className="text-white/70 text-sm">Agenda una nueva cita</p>
          </div>
        </div>
      )}
      {/* Date and Time Pickers */}
      <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Select date"
          className="w-fit bg-white/90 rounded-lg"
        />
        <span className="text-white/70 font-medium">a las</span>
        <TimePicker
          value={selectedTime}
          onChange={setSelectedTime}
          placeholder="Select time"
          className="w-[120px] bg-white/90 rounded-lg"
          minuteStep={5}
          businessHoursStart="09:00"
          businessHoursEnd="18:00"
        />
      </div>
    </div>
  );
}

