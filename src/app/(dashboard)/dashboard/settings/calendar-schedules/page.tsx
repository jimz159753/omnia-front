"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
        setServices(data.data || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteCalendar") || "Are you sure you want to delete this calendar?")) {
      return;
    }

    try {
      const response = await fetch(`/api/booking-calendars?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("calendarDeleted") || "Calendar deleted");
        fetchCalendars();
      } else {
        toast.error("Failed to delete calendar");
      }
    } catch (error) {
      console.error("Error deleting calendar:", error);
      toast.error("Failed to delete calendar");
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
              <BiCalendar className="w-6 h-6 text-emerald-500" />
              {t("calendarSchedules") || "Calendar Schedules"}
            </CardTitle>
            <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
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
            <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
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
                className="h-24 bg-gradient-to-br from-emerald-500 to-teal-600 relative"
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
                        <BiCheck className="w-4 h-4 text-green-500" />
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
                      onClick={() => handleDelete(calendar.id)}
                      title={t("delete") || "Delete"}
                      className="text-red-500 hover:text-red-700"
                    >
                      <BiTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Shareable Link */}
                <div className="mt-4 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCalendar
                ? t("editCalendar") || "Edit Calendar"
                : t("createCalendar") || "Create Calendar"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("calendarName") || "Calendar Name"} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("calendarNamePlaceholder") || "e.g., Main Booking"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fullName") || "Full Name"} *
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("fullNamePlaceholder") || "e.g., John Doe"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("email") || "Email"} *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("emailPlaceholder") || "email@example.com"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("phone") || "Phone"} *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t("phonePlaceholder") || "+52 33 1234 5678"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("description") || "Description"}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("descriptionPlaceholder") || "Brief description of your services..."}
                rows={3}
              />
            </div>

            {/* Images */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("backgroundImage") || "Background Image"}
                </label>
                <div
                  className="relative h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors cursor-pointer overflow-hidden"
                  onClick={() => document.getElementById("background-upload")?.click()}
                >
                  {formData.backgroundImage ? (
                    <img
                      src={formData.backgroundImage}
                      alt="Background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <BiImage className="w-8 h-8 mb-2" />
                      <span className="text-sm">{t("uploadBackground") || "Upload background"}</span>
                    </div>
                  )}
                  {uploadingBackground && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "background");
                  }}
                />
                {formData.backgroundImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-red-500"
                    onClick={() => setFormData({ ...formData, backgroundImage: "" })}
                  >
                    <BiX className="w-4 h-4 mr-1" />
                    {t("remove") || "Remove"}
                  </Button>
                )}
              </div>

              {/* Logo Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("logoImage") || "Logo Image"}
                </label>
                <div
                  className="relative h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors cursor-pointer overflow-hidden flex items-center justify-center"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  {formData.logoImage ? (
                    <img
                      src={formData.logoImage}
                      alt="Logo"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <BiUpload className="w-8 h-8 mb-2" />
                      <span className="text-sm">{t("uploadLogo") || "Upload logo"}</span>
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "logo");
                  }}
                />
                {formData.logoImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-red-500"
                    onClick={() => setFormData({ ...formData, logoImage: "" })}
                  >
                    <BiX className="w-4 h-4 mr-1" />
                    {t("remove") || "Remove"}
                  </Button>
                )}
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("primaryColor") || "Primary Color"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border-0"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>

            {/* Services Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("selectServices") || "Select Services"}
              </label>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {services.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {t("noServicesAvailable") || "No services available"}
                  </div>
                ) : (
                  services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <Checkbox
                        checked={formData.serviceIds.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {service.duration} min • ${service.price}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.serviceIds.length} {t("servicesSelected") || "services selected"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                {editingCalendar
                  ? t("saveChanges") || "Save Changes"
                  : t("createCalendar") || "Create Calendar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
