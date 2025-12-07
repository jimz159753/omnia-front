"use client";
import { useEffect, useState } from "react";
import { items } from "@/constants";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { AddNewDialog } from "@/components/dialogs/AddNewDialog";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const handleAddNewSelect = (value: string) => {
    if (!value) return;
    setIsDialogOpen(false);
    if (value === "client") {
      setIsClientFormOpen(true);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <CustomLoadingSpinner />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <SideBar items={items} setIsDialogOpen={setIsDialogOpen} />
        <div className="flex-1">
          <div className="flex flex-col justify-start items-stretch m-0 p-4 min-h-auto max-w-full">
            {children}
          </div>
        </div>
        <AddNewDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSelect={handleAddNewSelect}
        />

        <ClientFormDialog
          open={isClientFormOpen}
          onOpenChange={setIsClientFormOpen}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </div>
    </div>
  );
}
