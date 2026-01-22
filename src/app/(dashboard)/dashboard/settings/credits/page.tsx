"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import {
  BiCreditCard,
  BiMessageDetail,
  BiHistory,
  BiRefresh,
  BiCheck,
  BiX,
  BiPhone,
  BiDollar,
  BiErrorCircle,
  BiLinkExternal,
} from "react-icons/bi";

interface TwilioMessage {
  id: string;
  sid: string;
  recipientPhone: string;
  status: string;
  body?: string;
  bodyPreview?: string;
  direction: string;
  price: string | null;
  priceUnit: string | null;
  errorCode?: number | null;
  errorMessage?: string | null;
  dateSent: string | null;
  dateCreated: string;
}

interface CreditsData {
  configured: boolean;
  balance: number | null;
  currency: string;
  messagesSent: number;
  messagesThisMonth: number;
  totalCostThisMonth?: number;
  error?: string;
}

interface MessagesData {
  configured: boolean;
  messages: TwilioMessage[];
  total: number;
  stats: Record<string, number>;
  totalCost?: number;
  currency?: string;
  error?: string;
}

const statusColors: Record<string, string> = {
  queued: "bg-gray-100 text-gray-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  read: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  undelivered: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  queued: "Queued",
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
  undelivered: "Undelivered",
};

export default function CreditsPage() {
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null);
  const [messagesData, setMessagesData] = useState<MessagesData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "messages">("overview");

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp/credits");
      const data = await response.json();
      setCreditsData(data);
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast.error(t("creditsLoadError") || "Failed to load credits");
    }
  }, [t]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp/messages?limit=30");
      const data = await response.json();
      setMessagesData(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCredits(), fetchMessages()]);
    setRefreshing(false);
    toast.success(t("dataRefreshed") || "Data refreshed");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCredits(), fetchMessages()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCredits, fetchMessages]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null, currency: string = "USD") => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
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

  if (!creditsData?.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BiCreditCard className="w-6 h-6 text-amber-500" />
            {t("whatsappCredits") || "WhatsApp Credits"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <BiErrorCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              {t("twilioNotConfigured") || "Twilio Not Configured"}
            </h3>
            <p className="text-amber-700 mb-4">
              {t("twilioNotConfiguredDesc") ||
                "Configure your Twilio credentials to view your WhatsApp account balance and usage."}
            </p>
            <div className="text-sm text-amber-600 space-y-1">
              <p>• TWILIO_ACCOUNT_SID</p>
              <p>• TWILIO_AUTH_TOKEN</p>
              <p>• TWILIO_WHATSAPP_NUMBER</p>
            </div>
            <a
              href="https://console.twilio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-amber-700 hover:text-amber-900 underline"
            >
              <BiLinkExternal className="w-4 h-4" />
              {t("goToTwilioConsole") || "Go to Twilio Console"}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                {t("twilioBalance") || "Twilio Account Balance"}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">
                  {formatCurrency(creditsData.balance, creditsData.currency)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <BiRefresh className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                {t("refresh") || "Refresh"}
              </Button>
              <a
                href="https://console.twilio.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-100 hover:text-white flex items-center gap-1"
              >
                <BiLinkExternal className="w-3 h-3" />
                {t("manageTwilio") || "Manage in Twilio"}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-green-200 text-xs">
                {t("totalMessagesSent") || "Total Messages"}
              </p>
              <p className="text-2xl font-semibold mt-1">
                {creditsData.messagesSent}
              </p>
            </div>
            <div>
              <p className="text-green-200 text-xs">
                {t("messagesThisMonth") || "This Month"}
              </p>
              <p className="text-2xl font-semibold mt-1">
                {creditsData.messagesThisMonth}
              </p>
            </div>
            <div>
              <p className="text-green-200 text-xs">
                {t("costThisMonth") || "Cost This Month"}
              </p>
              <p className="text-2xl font-semibold mt-1">
                {formatCurrency(messagesData?.totalCost || 0, messagesData?.currency || "USD")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Status Summary */}
      {messagesData?.stats && Object.keys(messagesData.stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(messagesData.stats).map(([status, count]) => (
            <Card key={status} className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    statusColors[status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {statusLabels[status] || status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "overview", label: t("overview") || "Overview", icon: <BiDollar /> },
          { key: "messages", label: t("messageHistory") || "Message History", icon: <BiMessageDetail /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BiCreditCard className="w-5 h-5 text-green-500" />
                {t("accountInfo") || "Account Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">{t("provider") || "Provider"}</span>
                <span className="font-semibold">Twilio</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">{t("balance") || "Balance"}</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(creditsData.balance, creditsData.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">{t("currency") || "Currency"}</span>
                <span className="font-semibold">{creditsData.currency}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">{t("whatsappNumber") || "WhatsApp Number"}</span>
                <span className="font-semibold text-sm">
                  {process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER || "Configured"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BiHistory className="w-5 h-5 text-blue-500" />
                {t("quickActions") || "Quick Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="https://console.twilio.com/us1/billing/manage-billing/billing-overview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BiDollar className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{t("addFunds") || "Add Funds"}</span>
                </div>
                <BiLinkExternal className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://console.twilio.com/us1/monitor/logs/sms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BiMessageDetail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{t("viewAllLogs") || "View All Logs"}</span>
                </div>
                <BiLinkExternal className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BiPhone className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{t("manageWhatsApp") || "Manage WhatsApp"}</span>
                </div>
                <BiLinkExternal className="w-4 h-4 text-gray-400" />
              </a>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t("pricingInfo") || "WhatsApp Pricing"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {t("pricingNote") ||
                    "WhatsApp message pricing varies by country and message type. Template messages typically cost $0.005 - $0.08 per message. Visit your Twilio Console for detailed pricing information."}
                </p>
                <a
                  href="https://www.twilio.com/whatsapp/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-700 hover:text-blue-900 underline"
                >
                  <BiLinkExternal className="w-3 h-3" />
                  {t("viewPricing") || "View WhatsApp Pricing"}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "messages" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t("recentMessages") || "Recent Messages"}
              </CardTitle>
              <span className="text-sm text-gray-500">
                {messagesData?.total || 0} {t("total") || "total"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {messagesData?.messages && messagesData.messages.length > 0 ? (
              <div className="space-y-3">
                {messagesData.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white rounded-full shadow-sm flex-shrink-0">
                        <BiPhone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">
                            {msg.recipientPhone}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              statusColors[msg.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusLabels[msg.status] || msg.status}
                          </span>
                        </div>
                        {msg.bodyPreview && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {msg.bodyPreview}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{formatDate(msg.dateCreated)}</span>
                          {msg.price && (
                            <span className="text-amber-600">
                              {formatCurrency(parseFloat(msg.price), msg.priceUnit || "USD")}
                            </span>
                          )}
                        </div>
                        {msg.errorMessage && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <BiErrorCircle className="w-3 h-3" />
                            {msg.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BiMessageDetail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("noMessages") || "No messages sent yet"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
