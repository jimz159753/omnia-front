"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FcGoogle } from "react-icons/fc";

interface GoogleCalendar {
  id: string;
  calendarId: string;
  name: string;
  backgroundColor: string;
  isPrimary: boolean;
  isEnabled: boolean;
}

interface GoogleCalendarSelectorProps {
  value?: string;
  onChange: (calendarId: string) => void;
  userId: string;
  error?: string;
}

export const GoogleCalendarSelector: React.FC<
  GoogleCalendarSelectorProps
> = ({ value, onChange, userId, error }) => {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/google-calendar/calendars?userId=${userId}`
        );
        const data = await response.json();

        if (data.connected) {
          setConnected(true);
          // Only show enabled calendars
          const enabledCalendars = (data.calendars || []).filter(
            (cal: GoogleCalendar) => cal.isEnabled
          );
          setCalendars(enabledCalendars);

          // Auto-select primary calendar if no value is set
          if (!value && enabledCalendars.length > 0) {
            const primaryCalendar = enabledCalendars.find(
              (cal: GoogleCalendar) => cal.isPrimary
            );
            if (primaryCalendar) {
              onChange(primaryCalendar.calendarId);
            } else {
              onChange(enabledCalendars[0].calendarId);
            }
          }
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [userId, value, onChange]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FcGoogle className="w-4 h-4 animate-spin" />
        <span>Loading calendars...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <FcGoogle className="w-5 h-5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Google Calendar Not Connected
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Go to Settings → Google Calendar to connect your account
          </p>
        </div>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <FcGoogle className="w-5 h-5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">
            No Enabled Calendars
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Enable at least one calendar in Settings → Google Calendar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <FcGoogle className="w-4 h-4" />
        Google Calendar
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select a calendar" />
        </SelectTrigger>
        <SelectContent>
          {calendars.map((calendar) => (
            <SelectItem key={calendar.id} value={calendar.calendarId}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: calendar.backgroundColor }}
                />
                <span>{calendar.name}</span>
                {calendar.isPrimary && (
                  <span className="text-xs text-gray-500">(Primary)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
