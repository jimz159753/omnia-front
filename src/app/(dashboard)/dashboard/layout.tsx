"use client";
import { useEffect, useState } from "react";
import { items } from "@/constants";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarIcon, ShoppingBagIcon, UserPlusIcon } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleGroupItems = [
    {
      value: "appointment",
      label: "New appointment",
      icon: CalendarIcon,
      className: "rounded-r-none border-r-0",
      colorBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      value: "sale",
      label: "New Sale",
      icon: ShoppingBagIcon,
      className: "rounded-none border-r-0",
      colorBg: "bg-green-500/20",
      iconColor: "text-green-500",
    },
    {
      value: "client",
      label: "New Client",
      icon: UserPlusIcon,
      className: "rounded-l-none",
      colorBg: "bg-fuchsia-500/20",
      iconColor: "text-fuchsia-500",
    },
  ];

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New</DialogTitle>
              <DialogDescription>
                Choose the type of item you want to add.
              </DialogDescription>
            </DialogHeader>
            <ToggleGroup
              type="single"
              variant="outline"
              className="flex justify-center gap-0"
            >
              {toggleGroupItems.map((item) => {
                const Icon = item.icon;
                return (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={item.label}
                    className={`${item.className} h-48 w-32 flex flex-col items-center justify-between py-10`}
                  >
                    <div
                      className={`${item.colorBg} rounded-full h-14 w-14 flex items-center justify-center`}
                    >
                      <Icon className={`${item.iconColor} w-8 h-8`} />
                    </div>
                    {item.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
