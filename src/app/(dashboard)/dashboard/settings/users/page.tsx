"use client";

import { UsersPage } from "@/components/users/UsersPage";
import { AdminGuard } from "@/components/guards/AdminGuard";

export default function Users() {
  return (
    <AdminGuard>
      <UsersPage />
    </AdminGuard>
  );
}
