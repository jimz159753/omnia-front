"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { BiCheck, BiPlus, BiTrash, BiX } from "react-icons/bi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GoogleCalendar {
  id: string;
  calendarId: string;
  name: string;
  description: string;
  backgroundColor: string;
  isPrimary: boolean;
  isEnabled: boolean;
}

interface CalendarData {
  connected: boolean;
  email?: string;
  calendars: GoogleCalendar[];
}

export default function GoogleCalendarPage() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    name: "",
    description: "",
    backgroundColor: "#039BE5",
  });

  const predefinedColors = [
    "#039BE5", // Blue
    "#7986CB", // Purple
    "#33B679", // Green
    "#E67C73", // Red
    "#F6BF26", // Yellow
    "#F4511E", // Orange
    "#616161", // Gray
    "#0B8043", // Dark Green
    "#D50000", // Dark Red
    "#8E24AA", // Magenta
  ];

  const fetchCalendars = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/google-calendar/calendars?userId=${user.id}`
      );
      const data = await response.json();

      if (data.connected) {
        setCalendarData(data);
      } else {
        setCalendarData({ connected: false, calendars: [] });
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
      toast.error("Failed to fetch calendars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();

    // Check for OAuth callback params
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success("Google Calendar connected successfully!");
      // Clear URL params
      window.history.replaceState(
        {},
        "",
        "/dashboard/settings/google-calendar"
      );
    }

    if (error) {
      toast.error(`Failed to connect: ${error}`);
      window.history.replaceState(
        {},
        "",
        "/dashboard/settings/google-calendar"
      );
    }
  }, [searchParams, user]);

  const handleConnect = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/google-calendar/oauth/authorize?userId=${user.id}`
      );
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Failed to generate authorization URL");
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
      toast.error("Failed to connect to Google Calendar");
    }
  };

  const handleDisconnect = async () => {
    if (!user || !confirm("Are you sure you want to disconnect?")) return;

    try {
      setLoading(true);
      await fetch(`/api/google-calendar/calendars?userId=${user.id}`, {
        method: "DELETE",
      });
      toast.success("Google Calendar disconnected");
      setCalendarData({ connected: false, calendars: [] });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async () => {
    if (!user || !newCalendar.name.trim()) {
      toast.error("Calendar name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/google-calendar/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...newCalendar,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsCreateDialogOpen(false);
        setNewCalendar({
          name: "",
          description: "",
          backgroundColor: "#039BE5",
        });
        fetchCalendars();
      } else {
        toast.error(data.error || "Failed to create calendar");
      }
    } catch (error) {
      console.error("Error creating calendar:", error);
      toast.error("Failed to create calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCalendar = async (
    calendarId: string,
    updates: Partial<GoogleCalendar>
  ) => {
    if (!user) return;

    try {
      const response = await fetch("/api/google-calendar/calendars", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          calendarId,
          ...updates,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchCalendars();
      } else {
        toast.error(data.error || "Failed to update calendar");
      }
    } catch (error) {
      console.error("Error updating calendar:", error);
      toast.error("Failed to update calendar");
    }
  };

  if (loading && !calendarData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!calendarData?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Google account to manage your calendars and sync
            appointments.
          </p>
          <Button onClick={handleConnect} disabled={loading}>
            <FcGoogle className="w-5 h-5 mr-2" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Calendar</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Connected as: {calendarData.email}
              </p>
            </div>
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Calendars</h3>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <BiPlus className="w-5 h-5 mr-1" />
              Create Calendar
            </Button>
          </div>

          <div className="space-y-3">
            {calendarData.calendars.map((calendar) => (
              <Card key={calendar.id} className="shadow-none border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {calendar.name}
                        </h4>
                        {calendar.isPrimary && (
                          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      {calendar.description && (
                        <p className="text-xs text-gray-600">
                          {calendar.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`enabled-${calendar.id}`}
                          className="text-xs cursor-pointer font-medium"
                        >
                          Enabled
                        </label>
                        <input
                          type="checkbox"
                          id={`enabled-${calendar.id}`}
                          checked={calendar.isEnabled}
                          onChange={(e) =>
                            handleUpdateCalendar(calendar.calendarId, {
                              isEnabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: color,
                              borderColor:
                                calendar.backgroundColor === color
                                  ? "#000"
                                  : "transparent",
                            }}
                            onClick={() =>
                              handleUpdateCalendar(calendar.calendarId, {
                                backgroundColor: color,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Calendar Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Calendar</DialogTitle>
            <DialogDescription>
              Create a new calendar in your Google account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Calendar Name *
              </label>
              <input
                id="name"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newCalendar.name}
                onChange={(e) =>
                  setNewCalendar({ ...newCalendar, name: e.target.value })
                }
                placeholder="e.g., Work Calendar"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <input
                id="description"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newCalendar.description}
                onChange={(e) =>
                  setNewCalendar({
                    ...newCalendar,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        newCalendar.backgroundColor === color
                          ? "#000"
                          : "#ddd",
                    }}
                    onClick={() =>
                      setNewCalendar({
                        ...newCalendar,
                        backgroundColor: color,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCalendar} disabled={loading}>
              Create Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
