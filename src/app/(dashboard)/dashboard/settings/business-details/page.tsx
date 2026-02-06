"use client";

import { BusinessDetailsForm } from "@/components/business/BusinessDetailsForm";
import { AdminGuard } from "@/components/guards/AdminGuard";

export default function BusinessDetailsPage() {
  return (
    <AdminGuard>
      <BusinessDetailsForm />
    </AdminGuard>
  );
}
