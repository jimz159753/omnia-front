"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getUsersColumns, type User } from "@/components/users/users-columns";
import { UserDialog } from "@/components/dialogs/UserDialog";
import { toast } from "sonner";
import { FiPlus, FiUsers } from "react-icons/fi";

export function UsersPage() {
  const { t } = useTranslation("settings");
  const [users, setUsers] = useState<User[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setUsers(json.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(t("usersLoadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm(t("confirmDeleteUser"))) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete user");
      }

      toast.success(t("userDeleteSuccess"));
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("userDeleteError");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers className="w-6 h-6 text-brand-500" />
            <p className="text-2xl font-semibold">{t("usersHeader")}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setIsUserDialogOpen(true);
            }}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            {t("addUser")}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">{t("usersDescription")}</p>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <DataTable
            columns={getUsersColumns({
              t,
              onEdit: (user) => {
                setEditingUser(user);
                setIsUserDialogOpen(true);
              },
              onDelete: handleDeleteUser,
            })}
            data={users}
            searchKey="name"
            searchPlaceholder={t("searchUsers")}
          />
        )}
      </div>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={(open) => {
          setIsUserDialogOpen(open);
          if (!open) {
            setEditingUser(null);
          }
        }}
        onSuccess={fetchUsers}
        editingUser={editingUser}
      />
    </div>
  );
}
