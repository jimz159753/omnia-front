"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import {
  BiCalendar,
  BiGift,
  BiRefresh,
  BiMessageDetail,
  BiCheck,
  BiEdit,
  BiX,
  BiCog,
  BiSend,
  BiCheckCircle,
  BiErrorCircle,
} from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WhatsAppReminder {
  id: string;
  type: string;
  name: string;
  isEnabled: boolean;
  timing: number;
  timingUnit: string;
  messageTemplate: string;
  createdAt: string;
  updatedAt: string;
}

interface WhatsAppStatus {
  configured: boolean;
  status: {
    hasAccountSid: boolean;
    hasAuthToken: boolean;
    hasWhatsAppNumber: boolean;
  };
}

const reminderTypeIcons: Record<string, React.ReactNode> = {
  appointment: <BiCalendar className="w-6 h-6" />,
  confirmation: <BiCheck className="w-6 h-6" />,
  followup: <BiRefresh className="w-6 h-6" />,
  birthday: <BiGift className="w-6 h-6" />,
  custom: <BiMessageDetail className="w-6 h-6" />,
};

const reminderTypeColors: Record<string, string> = {
  appointment: "bg-blue-100 text-blue-600",
  confirmation: "bg-green-100 text-green-600",
  followup: "bg-purple-100 text-purple-600",
  birthday: "bg-pink-100 text-pink-600",
  custom: "bg-gray-100 text-gray-600",
};

export default function RemindersPage() {
  const { t } = useTranslation("settings");
  const [reminders, setReminders] = useState<WhatsAppReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [editingReminder, setEditingReminder] = useState<WhatsAppReminder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    timing: 24,
    timingUnit: "hours",
    messageTemplate: "",
  });

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/whatsapp-reminders");
      const data = await response.json();
      if (data.data) {
        setReminders(data.data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error(t("remindersLoadError") || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp/send");
      const data = await response.json();
      setWhatsappStatus(data);
    } catch (error) {
      console.error("Error fetching WhatsApp status:", error);
      setWhatsappStatus({ configured: false, status: { hasAccountSid: false, hasAuthToken: false, hasWhatsAppNumber: false } });
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    fetchWhatsAppStatus();
  }, [fetchReminders, fetchWhatsAppStatus]);

  const handleToggleReminder = async (reminder: WhatsAppReminder) => {
    try {
      const response = await fetch(`/api/whatsapp-reminders?id=${reminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !reminder.isEnabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      toast.success(
        reminder.isEnabled
          ? t("reminderDisabled") || "Reminder disabled"
          : t("reminderEnabled") || "Reminder enabled"
      );
      fetchReminders();
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast.error(t("reminderUpdateError") || "Failed to update reminder");
    }
  };

  const handleEditClick = (reminder: WhatsAppReminder) => {
    setEditingReminder(reminder);
    setEditForm({
      name: reminder.name,
      timing: reminder.timing,
      timingUnit: reminder.timingUnit,
      messageTemplate: reminder.messageTemplate,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReminder) return;

    try {
      const response = await fetch(
        `/api/whatsapp-reminders?id=${editingReminder.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      toast.success(t("reminderUpdateSuccess") || "Reminder updated successfully");
      setIsEditDialogOpen(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error(t("reminderUpdateError") || "Failed to update reminder");
    }
  };

  const handleSendTest = async () => {
    if (!testPhoneNumber.trim()) {
      toast.error(t("phoneRequired") || "Phone number is required");
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: testPhoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t("testMessageSent") || "Test message sent successfully!");
        setIsTestDialogOpen(false);
        setTestPhoneNumber("");
      } else {
        toast.error(data.error || t("testMessageFailed") || "Failed to send test message");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error(t("testMessageFailed") || "Failed to send test message");
    } finally {
      setSendingTest(false);
    }
  };

  const getTimingLabel = (reminder: WhatsAppReminder) => {
    if (reminder.timing === 0) {
      return t("immediately") || "Immediately";
    }
    const unitLabel =
      reminder.timingUnit === "hours"
        ? reminder.timing === 1
          ? t("hour") || "hour"
          : t("hours") || "hours"
        : reminder.timing === 1
        ? t("day") || "day"
        : t("days") || "days";

    if (reminder.type === "appointment") {
      return `${reminder.timing} ${unitLabel} ${t("before") || "before"}`;
    }
    if (reminder.type === "followup") {
      return `${reminder.timing} ${unitLabel} ${t("after") || "after last visit"}`;
    }
    return `${reminder.timing} ${unitLabel}`;
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "appointment":
        return t("appointmentReminderDesc") || "Remind clients before their appointment";
      case "confirmation":
        return t("confirmationReminderDesc") || "Send confirmation when appointment is booked";
      case "followup":
        return t("followupReminderDesc") || "Remind clients to book again after their visit";
      case "birthday":
        return t("birthdayReminderDesc") || "Send birthday greetings to clients";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
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
              <CardTitle className="flex items-center gap-2">
                <BiMessageDetail className="w-6 h-6 text-green-500" />
                {t("whatsappReminders") || "WhatsApp Reminders"}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {t("remindersDescription") ||
                  "Configure automatic WhatsApp reminders for your clients"}
              </p>
            </div>
            <Button
              onClick={() => setIsTestDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!whatsappStatus?.configured}
            >
              <BiSend className="w-4 h-4" />
              {t("sendTestMessage") || "Send Test"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WhatsApp Configuration Status */}
          <div
            className={`border rounded-lg p-4 flex items-start gap-3 ${
              whatsappStatus?.configured
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                whatsappStatus?.configured ? "bg-green-100" : "bg-amber-100"
              }`}
            >
              {whatsappStatus?.configured ? (
                <BiCheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <BiCog className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  whatsappStatus?.configured ? "text-green-800" : "text-amber-800"
                }`}
              >
                {whatsappStatus?.configured
                  ? t("whatsappConnected") || "WhatsApp Connected"
                  : t("whatsappNotConfigured") || "WhatsApp Not Configured"}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  whatsappStatus?.configured ? "text-green-700" : "text-amber-700"
                }`}
              >
                {whatsappStatus?.configured
                  ? t("whatsappReadyDesc") ||
                    "Your WhatsApp Business API is connected and ready to send messages."
                  : t("whatsappConfigureDesc") ||
                    "Configure your Twilio WhatsApp credentials to start sending messages."}
              </p>
              {!whatsappStatus?.configured && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-amber-800">
                    {t("missingCredentials") || "Missing credentials:"}
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {!whatsappStatus?.status.hasAccountSid && (
                      <li className="flex items-center gap-1">
                        <BiErrorCircle className="w-3 h-3" />
                        TWILIO_ACCOUNT_SID
                      </li>
                    )}
                    {!whatsappStatus?.status.hasAuthToken && (
                      <li className="flex items-center gap-1">
                        <BiErrorCircle className="w-3 h-3" />
                        TWILIO_AUTH_TOKEN
                      </li>
                    )}
                    {!whatsappStatus?.status.hasWhatsAppNumber && (
                      <li className="flex items-center gap-1">
                        <BiErrorCircle className="w-3 h-3" />
                        TWILIO_WHATSAPP_NUMBER
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Template Variables Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">
              {t("availableVariables") || "Available Variables"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                "{clientName}",
                "{date}",
                "{time}",
                "{serviceName}",
                "{businessName}",
                "{staffName}",
              ].map((variable) => (
                <span
                  key={variable}
                  className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={`shadow-none border transition-all ${
                  reminder.isEnabled
                    ? "border-gray-200"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${
                        reminderTypeColors[reminder.type] ||
                        reminderTypeColors.custom
                      }`}
                    >
                      {reminderTypeIcons[reminder.type] ||
                        reminderTypeIcons.custom}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {reminder.name}
                        </h4>
                        {reminder.isEnabled && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {t("active") || "Active"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {getTypeDescription(reminder.type)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BiCalendar className="w-4 h-4" />
                          {getTimingLabel(reminder)}
                        </span>
                      </div>

                      {/* Message Preview */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">
                          {t("messagePreview") || "Message Preview"}:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                          {reminder.messageTemplate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleReminder(reminder)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          reminder.isEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            reminder.isEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(reminder)}
                        className="text-xs"
                      >
                        <BiEdit className="w-4 h-4 mr-1" />
                        {t("edit") || "Edit"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reminders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BiMessageDetail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noReminders") || "No reminders configured"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Reminder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiEdit className="w-5 h-5" />
              {t("editReminder") || "Edit Reminder"}
            </DialogTitle>
            <DialogDescription>
              {t("editReminderDescription") ||
                "Customize the reminder settings and message template"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("reminderName") || "Reminder Name"}
              </label>
              <input
                id="name"
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="timing" className="text-sm font-medium">
                  {t("timing") || "Timing"}
                </label>
                <input
                  id="timing"
                  type="number"
                  min="0"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={editForm.timing}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      timing: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="timingUnit" className="text-sm font-medium">
                  {t("timingUnit") || "Unit"}
                </label>
                <select
                  id="timingUnit"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={editForm.timingUnit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, timingUnit: e.target.value })
                  }
                >
                  <option value="hours">{t("hours") || "Hours"}</option>
                  <option value="days">{t("days") || "Days"}</option>
                </select>
              </div>
            </div>

            {/* Message Template */}
            <div className="space-y-2">
              <label htmlFor="messageTemplate" className="text-sm font-medium">
                {t("messageTemplate") || "Message Template"}
              </label>
              <textarea
                id="messageTemplate"
                rows={8}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                value={editForm.messageTemplate}
                onChange={(e) =>
                  setEditForm({ ...editForm, messageTemplate: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                {t("templateHelp") ||
                  "Use variables like {clientName}, {date}, {time}, {serviceName}, {businessName} to personalize messages"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingReminder(null);
              }}
            >
              <BiX className="w-4 h-4 mr-1" />
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleSaveEdit}>
              <BiCheck className="w-4 h-4 mr-1" />
              {t("saveChanges") || "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Message Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiSend className="w-5 h-5 text-green-500" />
              {t("sendTestMessage") || "Send Test Message"}
            </DialogTitle>
            <DialogDescription>
              {t("testMessageDescription") ||
                "Send a test WhatsApp message to verify your configuration"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="testPhone" className="text-sm font-medium">
                {t("phoneNumber") || "Phone Number"}
              </label>
              <input
                id="testPhone"
                type="tel"
                placeholder="+52 123 456 7890"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                {t("phoneNumberHelp") ||
                  "Enter the phone number with country code (e.g., +52 for Mexico)"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTestDialogOpen(false);
                setTestPhoneNumber("");
              }}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={sendingTest || !testPhoneNumber.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendingTest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t("sending") || "Sending..."}
                </>
              ) : (
                <>
                  <BiSend className="w-4 h-4 mr-1" />
                  {t("sendTest") || "Send Test"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
