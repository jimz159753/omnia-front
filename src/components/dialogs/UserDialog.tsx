"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { BiSave } from "react-icons/bi";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["admin", "user"]),
  isActive: z.boolean(),
  avatar: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar: string | null;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingUser?: User | null;
}

export function UserDialog({
  open,
  onOpenChange,
  onSuccess,
  editingUser,
}: UserDialogProps) {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
      avatar: "",
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role as "admin" | "user",
        isActive: editingUser.isActive,
        avatar: editingUser.avatar || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
        avatar: "",
      });
    }
  }, [editingUser, reset, open]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("role", values.role);
      formData.append("isActive", values.isActive.toString());

      if (values.avatar && values.avatar.startsWith("data:")) {
        formData.append("avatar", values.avatar);
      }

      const url = editingUser
        ? `/api/users?id=${editingUser.id}`
        : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || `Failed to ${editingUser ? "update" : "add"} user`
        );
      }

      toast.success(
        editingUser ? t("userUpdateSuccess") : t("userAddSuccess")
      );
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("User error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : editingUser
          ? t("userUpdateError")
          : t("userAddError");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? t("editUser") : t("addUser")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("userAvatar")}
            </label>
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <ImageDropzone
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("userName")}
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("userName")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("userEmail")}
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("userEmail")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("userPassword")} {editingUser && `(${t("leaveBlankToKeep")})`}
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("userPassword")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("userRole")}
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t("roleUser")}</SelectItem>
                    <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label className="text-sm font-medium text-gray-700">
              {t("userActive")}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <BiSave className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? tCommon("loading") ?? "Saving..."
                  : editingUser
                  ? t("updateUser")
                  : t("addUser")}
              </span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

