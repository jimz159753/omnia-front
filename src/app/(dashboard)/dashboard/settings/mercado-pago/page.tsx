"use client";

import { MercadoPagoSettings } from "@/components/business/MercadoPagoSettings";
import { AdminGuard } from "@/components/guards/AdminGuard";

export default function MercadoPagoSettingsPage() {
  return (
    <AdminGuard>
      <MercadoPagoSettings />
    </AdminGuard>
  );
}
