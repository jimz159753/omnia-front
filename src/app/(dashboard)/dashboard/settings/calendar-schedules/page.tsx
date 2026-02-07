"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import {
  BiCalendar,
  BiPlus,
  BiEdit,
  BiTrash,
  BiLink,
  BiCopy,
  BiCheck,
  BiX,
  BiUpload,
  BiImage,
  BiUser,
  BiPalette,
  BiCog,
  BiInfoCircle,
  BiIdCard,
} from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  image: string;
  slots: number | null;
  classes?: number | null; // Class packages have classes > 0
}

interface BookingCalendarService {
  id: string;
  serviceId: string;
  isEnabled: boolean;
  service: Service;
}

interface BookingCalendar {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  description: string | null;
  backgroundImage: string | null;
  logoImage: string | null;
  primaryColor: string;
  isActive: boolean;
  showOnMainPage: boolean;
  slots: number;
  googleCalendarId: string | null;
  mercadoPagoEnabled: boolean;
  services: BookingCalendarService[];
  createdAt: string;
}

export default function CalendarSchedulesPage() {
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(true);
  const [calendars, setCalendars] = useState<BookingCalendar[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<BookingCalendar | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<BookingCalendar | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Refs for hidden inputs
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const backgroundUploadRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    description: "",
    backgroundImage: "",
    logoImage: "",
    primaryColor: "#059669",
    mercadoPagoEnabled: false,
    serviceIds: [] as string[],
  });

  const fetchCalendars = useCallback(async () => {
    try {
      const response = await fetch("/api/booking-calendars");
      if (response.ok) {
        const data = await response.json();
        setCalendars(data);
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
      toast.error(t("errorLoadingCalendars") || "Error loading calendars");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services?pageSize=100");
      if (response.ok) {
        const data = await response.json();
        // Filter out class packages (services with classes > 0)
        // Class packages are sold as products, not booked through calendars
        const regularServices = (data.data || []).filter(
          (s: Service) => !s.classes || s.classes <= 0
        );
        setServices(regularServices);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  useEffect(() => {
    fetchCalendars();
    fetchServices();
  }, [fetchCalendars, fetchServices]);

  const openCreateDialog = () => {
    setEditingCalendar(null);
    setFormData({
      name: "",
      fullName: "",
      email: "",
      phone: "",
      description: "",
      backgroundImage: "",
      logoImage: "",
      primaryColor: "#059669",
      mercadoPagoEnabled: false,
      serviceIds: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (calendar: BookingCalendar) => {
    setEditingCalendar(calendar);
    setFormData({
      name: calendar.name,
      fullName: calendar.fullName,
      email: calendar.email,
      phone: calendar.phone,
      description: calendar.description || "",
      backgroundImage: calendar.backgroundImage || "",
      logoImage: calendar.logoImage || "",
      primaryColor: calendar.primaryColor,
      mercadoPagoEnabled: calendar.mercadoPagoEnabled || false,
      serviceIds: calendar.services.map((s) => s.serviceId),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.fullName || !formData.email || !formData.phone) {
      toast.error(t("fillRequiredFields") || "Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const url = "/api/booking-calendars";
      const method = editingCalendar ? "PUT" : "POST";
      const body = editingCalendar
        ? { id: editingCalendar.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          editingCalendar
            ? t("calendarUpdated") || "Calendar updated"
            : t("calendarCreated") || "Calendar created"
        );
        setIsDialogOpen(false);
        fetchCalendars();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save calendar");
      }
    } catch (error) {
      console.error("Error saving calendar:", error);
      toast.error("Failed to save calendar");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (calendar: BookingCalendar) => {
    setCalendarToDelete(calendar);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!calendarToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/booking-calendars?id=${calendarToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("calendarDeleted") || "Calendar deleted");
        fetchCalendars();
        setDeleteDialogOpen(false);
        setCalendarToDelete(null);
      } else {
        toast.error("Failed to delete calendar");
      }
    } catch (error) {
      console.error("Error deleting calendar:", error);
      toast.error("Failed to delete calendar");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (calendar: BookingCalendar) => {
    try {
      const response = await fetch("/api/booking-calendars", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: calendar.id,
          isActive: !calendar.isActive,
        }),
      });

      if (response.ok) {
        fetchCalendars();
        toast.success(
          calendar.isActive
            ? t("calendarDeactivated") || "Calendar deactivated"
            : t("calendarActivated") || "Calendar activated"
        );
      }
    } catch (error) {
      console.error("Error toggling calendar:", error);
    }
  };

  const toggleShowOnMainPage = async (calendar: BookingCalendar) => {
    try {
      const response = await fetch("/api/booking-calendars", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: calendar.id,
          showOnMainPage: !calendar.showOnMainPage,
        }),
      });

      if (response.ok) {
        fetchCalendars();
        toast.success(
          !calendar.showOnMainPage
            ? t("calendarSetAsMainPage") || "Calendar set as main page calendar"
            : t("calendarRemovedFromMainPage") || "Calendar removed from main page"
        );
      }
    } catch (error) {
      console.error("Error toggling main page calendar:", error);
    }
  };

  const copyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(t("linkCopied") || "Link copied to clipboard");
  };

  const handleFileUpload = async (
    file: File,
    type: "background" | "logo"
  ) => {
    const setUploading = type === "background" ? setUploadingBackground : setUploadingLogo;
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          [type === "background" ? "backgroundImage" : "logoImage"]: data.url,
        }));
        toast.success(t("imageUploaded") || "Image uploaded");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-omnia-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BiCalendar className="w-6 h-6 text-omnia-blue" />
              {t("calendarSchedules") || "Calendar Schedules"}
            </CardTitle>
            <Button onClick={openCreateDialog} className="bg-omnia-blue hover:bg-omnia-blue/90">
              <BiPlus className="w-4 h-4 mr-2" />
              {t("createCalendar") || "Create Calendar"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t("calendarSchedulesDesc") ||
              "Create shareable booking calendars with your contact information and services."}
          </p>
        </CardHeader>
      </Card>

      {/* Calendars List */}
      {calendars.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BiCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {t("noCalendars") || "No calendars yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("createFirstCalendar") ||
                "Create your first shareable booking calendar to start receiving appointments."}
            </p>
            <Button onClick={openCreateDialog} className="bg-omnia-blue hover:bg-omnia-blue/90">
              <BiPlus className="w-4 h-4 mr-2" />
              {t("createCalendar") || "Create Calendar"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {calendars.map((calendar) => (
            <Card
              key={calendar.id}
              className={`overflow-hidden ${!calendar.isActive ? "opacity-60" : ""}`}
            >
              {/* Background Preview */}
              <div
                className="h-24 bg-gradient-to-br from-omnia-dark to-omnia-navy relative"
                style={
                  calendar.backgroundImage
                    ? {
                        backgroundImage: `url(${calendar.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : { backgroundColor: calendar.primaryColor }
                }
              >
                {calendar.logoImage && (
                  <div className="absolute bottom-0 left-4 translate-y-1/2">
                    <img
                      src={calendar.logoImage}
                      alt="Logo"
                      className="w-16 h-16 rounded-full border-4 border-white object-cover bg-white"
                    />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Switch
                    checked={calendar.isActive}
                    onCheckedChange={() => toggleActive(calendar)}
                  />
                </div>
              </div>

              <CardContent className={`p-4 ${calendar.logoImage ? "pt-10" : "pt-4"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{calendar.name}</h3>
                    <p className="text-sm text-gray-500">{calendar.fullName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {calendar.services.length} {t("services") || "services"}
                      {calendar.services.some((s) => s.service.slots != null && s.service.slots > 1) && (
                        <span className="ml-1">
                          • {calendar.services.filter((s) => s.service.slots != null && s.service.slots > 1).length} {t("withConcurrentSlots") || "with concurrent slots"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(calendar.slug, calendar.id)}
                      title={t("copyLink") || "Copy link"}
                    >
                      {copiedId === calendar.id ? (
                        <BiCheck className="w-4 h-4 text-omnia-blue" />
                      ) : (
                        <BiCopy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/book/${calendar.slug}`, "_blank")}
                      title={t("openLink") || "Open link"}
                    >
                      <BiLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(calendar)}
                      title={t("edit") || "Edit"}
                    >
                      <BiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(calendar)}
                      title={t("delete") || "Delete"}
                      className="text-red-500 hover:text-red-700"
                    >
                      <BiTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Show on Main Page Toggle */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BiCalendar className="w-4 h-4 text-omnia-blue" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("showOnMainPage") || "Show on Main Page"}
                      </span>
                    </div>
                    <Switch
                      checked={calendar.showOnMainPage}
                      onCheckedChange={() => toggleShowOnMainPage(calendar)}
                    />
                  </div>
                  {calendar.showOnMainPage && (
                    <p className="text-xs text-omnia-blue mt-2 flex items-center gap-1">
                      <BiCheck className="w-3 h-3" />
                      {t("displayedOnMainPage") || "This calendar is displayed on the main page"}
                    </p>
                  )}
                </div>

                {/* Shareable Link */}
                <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                  <BiLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate">
                    {window.location.origin}/book/{calendar.slug}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh] bg-omnia-light border-omnia-navy/20 flex flex-col">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BiCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {editingCalendar
                    ? t("editCalendar") || "Edit Calendar"
                    : t("createCalendar") || "Create Calendar"}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm">
                  {editingCalendar
                    ? t("editCalendarDescription") || "Update the settings and appearance of your booking calendar."
                    : t("createCalendarDescription") || "Configure your new booking calendar to start receiving appointments."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-omnia-light/50">
            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Basic Info Section */}
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-omnia-navy/10 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                      <BiIdCard className="w-3.5 h-3.5 text-omnia-blue" />
                    </div>
                    <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">{t("calendarDetails")}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                        {t("calendarName") || "Calendar Name"} *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("calendarNamePlaceholder") || "e.g., Main Booking"}
                        className="h-10 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                        {t("description") || "Description"}
                      </label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t("descriptionPlaceholder") || "Brief description..."}
                        className="rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue min-h-[80px] text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Info Section */}
                <div className="bg-white rounded-xl border border-omnia-navy/10 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                      <BiUser className="w-3.5 h-3.5 text-omnia-blue" />
                    </div>
                    <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">{t("contactInformation")}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">{t("fullName") || "Full Name"} *</label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="h-10 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">{t("email") || "Email"} *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-10 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">{t("phone") || "Phone"} *</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+52 33..."
                          className="h-10 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appearance and Config Column */}
              <div className="space-y-5">
                {/* Visual Section */}
                <div className="bg-white rounded-xl border border-omnia-navy/10 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                      <BiPalette className="w-3.5 h-3.5 text-omnia-blue" />
                    </div>
                    <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">{t("appearanceAndBranding")}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider mb-2 block">{t("primaryColor") || "Primary Color"}</label>
                      <div className="flex items-center gap-3 relative">
                        <div 
                          className="w-10 h-10 rounded-xl border shadow-sm cursor-pointer relative z-10" 
                          style={{ backgroundColor: formData.primaryColor }}
                          onClick={() => colorPickerRef.current?.click()}
                        />
                        <input
                          ref={colorPickerRef}
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="absolute pointer-events-none opacity-0 w-10 h-10 left-0"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="h-9 w-28 text-xs font-mono rounded-lg border-2 border-omnia-navy/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider mb-2 block">{t("backgroundImage") || "Background"}</label>
                        <div
                          className="relative h-24 rounded-xl border-2 border-dashed border-omnia-navy/10 hover:border-omnia-blue transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-omnia-light/30"
                          onClick={() => backgroundUploadRef.current?.click()}
                        >
                          {formData.backgroundImage ? (
                            <img src={formData.backgroundImage} alt="BG" className="w-full h-full object-cover" />
                          ) : (
                            <BiImage className="w-6 h-6 text-omnia-navy/20" />
                          )}
                          {uploadingBackground && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-omnia-blue"></div></div>}
                        </div>
                        <input ref={backgroundUploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "background")} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider mb-2 block">{t("logoImage") || "Logo"}</label>
                        <div
                          className="relative h-24 rounded-xl border-2 border-dashed border-omnia-navy/10 hover:border-omnia-blue transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-omnia-light/30"
                          onClick={() => logoUploadRef.current?.click()}
                        >
                          {formData.logoImage ? (
                            <img src={formData.logoImage} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <BiUpload className="w-6 h-6 text-omnia-navy/20" />
                          )}
                          {uploadingLogo && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-omnia-blue"></div></div>}
                        </div>
                        <input ref={logoUploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "logo")} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white rounded-xl border border-omnia-navy/10 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                      <BiCog className="w-3.5 h-3.5 text-omnia-blue" />
                    </div>
                    <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">{t("advancedConfiguration")}</span>
                  </div>

                  <div className="p-3 bg-omnia-blue/5 border border-omnia-blue/10 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-omnia-dark font-medium text-xs">
                        <BiCheck className="w-4 h-4 text-omnia-blue" />
                        {t("mercadoPagoIntegration") || "Mercado Pago"}
                      </div>
                      <Switch
                        checked={formData.mercadoPagoEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, mercadoPagoEnabled: checked })}
                        className="scale-90"
                      />
                    </div>
                    <p className="text-[10px] text-omnia-navy/60 leading-tight">
                      {t("mercadoPagoDescription") || "Allow clients to pay online before finishing the checkout."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Selection Section */}
            <div className="bg-white rounded-xl border border-omnia-navy/10 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                  <BiCheck className="w-3.5 h-3.5 text-omnia-blue" />
                </div>
                <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">{t("availableServices")}</span>
              </div>

              <div className="border border-omnia-navy/5 rounded-xl overflow-hidden bg-omnia-light/20">
                <div className="max-h-[200px] overflow-y-auto divide-y divide-omnia-navy/5">
                  {services.length === 0 ? (
                    <div className="p-8 text-center text-omnia-navy/40 italic text-sm">
                      {t("noServicesAvailable") || "No hay servicios disponibles"}
                    </div>
                  ) : (
                    services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-4 p-3 hover:bg-omnia-blue/5 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={formData.serviceIds.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                          className="border-omnia-navy/20 data-[state=checked]:bg-omnia-blue data-[state=checked]:border-omnia-blue"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-omnia-dark text-sm truncate">{service.name}</p>
                          <p className="text-xs text-omnia-navy/60 flex items-center gap-2">
                            <span>{service.duration} min</span>
                            <span className="w-1 h-1 rounded-full bg-omnia-navy/20" />
                            <span className="font-semibold text-omnia-blue">${service.price}</span>
                          </p>
                        </div>
                        {service.slots != null && service.slots > 1 && (
                          <span className="text-[10px] bg-omnia-blue/10 text-omnia-blue font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {service.slots} {t("slots") || "slots"}
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-bold text-omnia-navy/40 uppercase tracking-widest">
                  {formData.serviceIds.length} {t("servicesSelected") || "servicios seleccionados"}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-omnia-navy/10 shrink-0 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              className="h-11 px-6 rounded-xl border-2 border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5 font-medium transition-all"
            >
              {t("cancel") || "Cancelar"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="h-11 px-8 rounded-xl bg-omnia-blue hover:bg-omnia-blue/90 text-white font-bold shadow-lg shadow-omnia-blue/25 transition-all flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
              ) : (
                <BiCheck className="w-5 h-5" />
              )}
              {editingCalendar
                ? t("saveChanges") || "Guardar Cambios"
                : t("createCalendar") || "Crear Calendario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-omnia-light border-omnia-navy/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <BiTrash className="w-5 h-5 text-red-600" />
              </div>
              {t("confirmDeleteCalendar") || "Delete Calendar"}
            </DialogTitle>
            <DialogDescription className="text-omnia-navy mt-2">
              {t("confirmDeleteCalendarDesc") || 
                "Are you sure you want to delete this calendar? This action cannot be undone and clients will no longer be able to book through its link."}
              {calendarToDelete && (
                <span className="block mt-2 font-semibold text-omnia-dark">
                  Calendar: {calendarToDelete.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-6 border-t border-omnia-navy/10 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-omnia-navy/20 hover:bg-omnia-navy/5"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              {t("delete") || "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
