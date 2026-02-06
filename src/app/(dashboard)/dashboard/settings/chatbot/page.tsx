"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { AdminGuard } from "@/components/guards/AdminGuard";

function ChatBotPageContent() {
  const { t } = useTranslation("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("whatsappChatBot")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Configure your WhatsApp chatbot here.
        </p>
      </CardContent>
    </Card>
  );
}

export default function ChatBotPage() {
  return (
    <AdminGuard>
      <ChatBotPageContent />
    </AdminGuard>
  );
}
