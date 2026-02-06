"use client";

import { AccountSettingsForm } from "@/components/account/AccountSettingsForm";
import { AdminGuard } from "@/components/guards/AdminGuard";

export default function AccountPage() {
  return (
    <AdminGuard>
      <AccountSettingsForm />
    </AdminGuard>
  );
}
