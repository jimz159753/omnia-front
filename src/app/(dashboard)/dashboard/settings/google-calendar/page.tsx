"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { BiPlus, BiCalendar, BiLinkExternal, BiCheck, BiShareAlt, BiX, BiUser, BiTrash } from "react-icons/bi";
import { FiLoader, FiTrash2 } from "react-icons/fi";
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

interface AclRule {
  id: string;
  role: string;
  scope: {
    type: string;
    value: string;
  };
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

  // Sharing Dialog State
  const [isSharingDialogOpen, setIsSharingDialogOpen] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<GoogleCalendar | null>(null);
  const [aclRules, setAclRules] = useState<AclRule[]>([]);
  const [aclLoading, setAclLoading] = useState(false);
  const [newShareEmail, setNewShareEmail] = useState("");
  const [isAddingShare, setIsAddingShare] = useState(false);

  const predefinedColors = [
    { color: "#039BE5", name: "Blue" },
    { color: "#7986CB", name: "Lavender" },
    { color: "#33B679", name: "Green" },
    { color: "#E67C73", name: "Flamingo" },
    { color: "#F6BF26", name: "Banana" },
    { color: "#F4511E", name: "Tangerine" },
    { color: "#616161", name: "Graphite" },
    { color: "#0B8043", name: "Basil" },
    { color: "#D50000", name: "Tomato" },
    { color: "#8E24AA", name: "Grape" },
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
      toast.error(t("failedToFetchCalendars") || "Failed to fetch calendars");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcl = async (calendarId: string) => {
    try {
      setAclLoading(true);
      const response = await fetch(`/api/google-calendar/acl?calendarId=${calendarId}`);
      if (response.ok) {
        const data = await response.json();
        setAclRules(data.items || []);
      } else {
        toast.error(t("failedToFetchAcl") || "Failed to load sharing settings");
      }
    } catch (error) {
      console.error("Error fetching ACL:", error);
      toast.error(t("failedToFetchAcl") || "Failed to load sharing settings");
    } finally {
      setAclLoading(false);
    }
  };

  const openSharingDialog = (calendar: GoogleCalendar) => {
    setActiveCalendar(calendar);
    setAclRules([]);
    setNewShareEmail("");
    setIsSharingDialogOpen(true);
    fetchAcl(calendar.calendarId);
  };

  const handleAddShare = async () => {
    if (!activeCalendar || !newShareEmail) return;

    try {
      setIsAddingShare(true);
      const response = await fetch("/api/google-calendar/acl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId: activeCalendar.calendarId,
          email: newShareEmail,
          role: "reader", // Default to reader
        }),
      });

      if (response.ok) {
        toast.success(t("sharedSuccessfully") || "Calendar shared successfully");
        setNewShareEmail("");
        fetchAcl(activeCalendar.calendarId);
      } else {
        const data = await response.json();
        toast.error(data.error || t("failedToShare") || "Failed to share calendar");
      }
    } catch (error) {
      console.error("Error sharing calendar:", error);
      toast.error(t("failedToShare") || "Failed to share calendar");
    } finally {
      setIsAddingShare(false);
    }
  };

  const handleRemoveShare = async (ruleId: string) => {
    if (!activeCalendar) return;
    
    if (!confirm(t("confirmRemoveShare") || "Are you sure you want to remove this user?")) return;

    try {
      const response = await fetch(
        `/api/google-calendar/acl?calendarId=${activeCalendar.calendarId}&ruleId=${ruleId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success(t("shareRemoved") || "Access removed");
        setAclRules(aclRules.filter(rule => rule.id !== ruleId));
      } else {
        toast.error(t("failedToRemoveShare") || "Failed to remove access");
      }
    } catch (error) {
      console.error("Error removing share:", error);
      toast.error(t("failedToRemoveShare") || "Failed to remove access");
    }
  };

  useEffect(() => {
    fetchCalendars();

    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(t("googleCalendarConnected") || "Google Calendar connected successfully!");
      window.history.replaceState({}, "", "/dashboard/settings/google-calendar");
    }

    if (error) {
      toast.error(`${t("failedToConnect") || "Failed to connect"}: ${error}`);
      window.history.replaceState({}, "", "/dashboard/settings/google-calendar");
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
        toast.error(t("failedToGenerateAuth") || "Failed to generate authorization URL");
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
      toast.error(t("failedToConnectGoogle") || "Failed to connect to Google Calendar");
    }
  };

  const handleDisconnect = async () => {
    if (!user || !confirm(t("confirmDisconnect") || "Are you sure you want to disconnect?")) return;

    try {
      setLoading(true);
      await fetch(`/api/google-calendar/calendars?userId=${user.id}`, {
        method: "DELETE",
      });
      toast.success(t("googleCalendarDisconnected") || "Google Calendar disconnected");
      setCalendarData({ connected: false, calendars: [] });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error(t("failedToDisconnect") || "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async () => {
    if (!user || !newCalendar.name.trim()) {
      toast.error(t("calendarNameRequired") || "Calendar name is required");
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
        toast.error(data.error || t("failedToCreateCalendar") || "Failed to create calendar");
      }
    } catch (error) {
      console.error("Error creating calendar:", error);
      toast.error(t("failedToCreateCalendar") || "Failed to create calendar");
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
        toast.error(data.error || t("failedToUpdateCalendar") || "Failed to update calendar");
      }
    } catch (error) {
      console.error("Error updating calendar:", error);
      toast.error(t("failedToUpdateCalendar") || "Failed to update calendar");
    }
  };

  // Loading state
  if (loading && !calendarData) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <FiLoader className="w-8 h-8 animate-spin text-brand-500 mb-4" />
          <p className="text-gray-500">{t("loading") || "Loading..."}</p>
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (!calendarData?.connected) {
    return (
      <Card className="shadow-none">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FcGoogle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl">{t("googleCalendar") || "Google Calendar"}</CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            {t("googleCalendarDescription") || "Connect your Google account to sync appointments and manage your calendars directly from here."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-4 pb-8">
          <div className="flex flex-col gap-3 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <BiCheck className="w-5 h-5 text-green-500" />
              <span>{t("syncAppointments") || "Sync appointments automatically"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BiCheck className="w-5 h-5 text-green-500" />
              <span>{t("manageCalendars") || "Manage multiple calendars"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BiCheck className="w-5 h-5 text-green-500" />
              <span>{t("realTimeUpdates") || "Real-time updates"}</span>
            </div>
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={loading}
            className="h-12 px-6 text-base bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
          >
            <FcGoogle className="w-6 h-6 mr-3" />
            {t("connectGoogleCalendar") || "Connect Google Calendar"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected state
  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="shadow-none border-green-200 bg-green-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FcGoogle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {t("googleCalendar") || "Google Calendar"}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    {t("connected") || "Connected"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {calendarData.email}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <FiTrash2 className="w-4 h-4 mr-2" />
              {t("disconnect") || "Disconnect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendars Card */}
      <Card className="shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BiCalendar className="w-5 h-5 text-brand-500" />
                {t("myCalendars") || "My Calendars"}
              </CardTitle>
              <CardDescription>
                {t("calendarsDescription") || "Enable or disable calendars to sync with your appointments"}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-brand-500 hover:bg-brand-600">
              <BiPlus className="w-5 h-5 mr-1" />
              {t("createCalendar") || "Create Calendar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {calendarData.calendars.length === 0 ? (
              <div className="py-12 text-center">
                <BiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t("noCalendarsFound") || "No calendars found"}</p>
              </div>
            ) : (
              calendarData.calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Color indicator */}
                    <div
                      className="w-4 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    
                    {/* Calendar info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-medium text-gray-900 truncate">
                          {calendar.name}
                        </h4>
                        {calendar.isPrimary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">
                            {t("primary") || "Primary"}
                          </span>
                        )}
                      </div>
                      {calendar.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {calendar.description}
                        </p>
                      )}
                    </div>

                    {/* Color picker */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg">
                      {predefinedColors.slice(0, 6).map(({ color, name }) => (
                        <button
                          key={color}
                          title={name}
                          className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                            calendar.backgroundColor === color 
                              ? "ring-2 ring-offset-2 ring-gray-400" 
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            handleUpdateCalendar(calendar.calendarId, {
                              backgroundColor: color,
                            })
                          }
                        />
                      ))}
                      <div className="relative group">
                        <button className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 hover:scale-110 transition-all text-white text-xs font-bold">
                          +
                        </button>
                        <div className="absolute right-0 top-8 hidden group-hover:flex flex-wrap gap-1.5 p-2 bg-white rounded-lg shadow-lg border z-10 w-32">
                          {predefinedColors.map(({ color, name }) => (
                            <button
                              key={color}
                              title={name}
                              className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                                calendar.backgroundColor === color 
                                  ? "ring-2 ring-offset-1 ring-gray-400" 
                                  : ""
                              }`}
                              style={{ backgroundColor: color }}
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

                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSharingDialog(calendar)}
                      className="text-gray-500 hover:text-brand-600 hover:bg-brand-50"
                      title={t("shareCalendar") || "Share Calendar"}
                    >
                      <BiShareAlt className="w-5 h-5" />
                    </Button>

                    {/* Enable toggle */}
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                      <label
                        htmlFor={`enabled-${calendar.id}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {calendar.isEnabled 
                          ? (t("enabled") || "Enabled") 
                          : (t("disabled") || "Disabled")}
                      </label>
                      <Switch
                        id={`enabled-${calendar.id}`}
                        checked={calendar.isEnabled}
                        onCheckedChange={(checked) =>
                          handleUpdateCalendar(calendar.calendarId, {
                            isEnabled: checked,
                          })
                        }
                        className={calendar.isEnabled ? "bg-brand-500" : "bg-gray-300"}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Calendar Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiPlus className="w-5 h-5 text-brand-500" />
              {t("createNewCalendar") || "Create New Calendar"}
            </DialogTitle>
            <DialogDescription>
              {t("createCalendarDescription") || "Create a new calendar in your Google account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                {t("calendarName") || "Calendar Name"} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={newCalendar.name}
                onChange={(e) =>
                  setNewCalendar({ ...newCalendar, name: e.target.value })
                }
                placeholder={t("calendarNamePlaceholder") || "e.g., Work Calendar"}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                {t("description") || "Description"}
              </label>
              <input
                id="description"
                type="text"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                value={newCalendar.description}
                onChange={(e) =>
                  setNewCalendar({
                    ...newCalendar,
                    description: e.target.value,
                  })
                }
                placeholder={t("descriptionPlaceholder") || "Optional description"}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                {t("color") || "Color"}
              </label>
              <div className="flex gap-2 flex-wrap">
                {predefinedColors.map(({ color, name }) => (
                  <button
                    key={color}
                    type="button"
                    title={name}
                    className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                      newCalendar.backgroundColor === color
                        ? "ring-2 ring-offset-2 ring-brand-500"
                        : "ring-1 ring-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
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
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button 
              onClick={handleCreateCalendar} 
              disabled={loading || !newCalendar.name.trim()}
              className="bg-brand-500 hover:bg-brand-600"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  {t("creating") || "Creating..."}
                </>
              ) : (
                <>
                  <BiPlus className="w-4 h-4 mr-1" />
                  {t("createCalendar") || "Create Calendar"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sharing Dialog */}
      <Dialog open={isSharingDialogOpen} onOpenChange={setIsSharingDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiShareAlt className="w-5 h-5 text-brand-500" />
              {t("shareCalendar") || "Share Calendar"} - {activeCalendar?.name}
            </DialogTitle>
            <DialogDescription>
              {t("shareCalendarDescription") || "Manage who has access to this calendar"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Add User Section */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {t("addByEmail") || "Add people"}
                </label>
                <div className="relative">
                  <BiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="email@example.com"
                    value={newShareEmail}
                    onChange={(e) => setNewShareEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddShare();
                      }
                    }}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddShare} 
                disabled={isAddingShare || !newShareEmail}
                className="bg-brand-500 hover:bg-brand-600 mb-0.5"
              >
                {isAddingShare ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  t("invite") || "Invite"
                )}
              </Button>
            </div>

            {/* List Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {t("peopleWithAccess") || "People with access"}
              </h4>
              <div className="space-y-3">
                {aclLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    {t("loading") || "Loading..."}
                  </div>
                ) : aclRules.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    {t("noShares") || "Not shared with anyone yet"}
                  </p>
                ) : (
                  aclRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium text-sm">
                          {(rule.scope.value || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {rule.scope.type === 'default' ? 'Public' : (rule.scope.value || "Unknown")}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {rule.role === "writer" ? "Can edit" : 
                             rule.role === "owner" ? "Owner" : 
                             rule.role === "reader" ? "Can view" : rule.role}
                          </p>
                        </div>
                      </div>
                      
                      {rule.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveShare(rule.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <BiTrash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsSharingDialogOpen(false)}
            >
              {t("done") || "Done"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
