"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * A guard component that restricts access to admin-only pages.
 * Redirects users with "user" role to the settings main page.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete and we have user data
    if (!isLoading && user && user.role !== "admin") {
      router.replace("/dashboard/calendar");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Don't render content if user is not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return <>{children}</>;
}
