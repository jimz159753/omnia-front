"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export default function Settings() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.replace("/dashboard/settings/business-details");
      } else {
        router.replace("/dashboard/settings/calendar-schedules");
      }
    }
  }, [router, user, isLoading]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
