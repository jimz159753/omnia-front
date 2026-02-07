"use client";

import { useState, useEffect, useMemo } from "react";
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

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"]),
  position: z.string().optional(),
  isActive: z.boolean(),
  avatar: z.string().optional(),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
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
    setError,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      position: "",
      isActive: true,
      avatar: "",
    },
  });

  const validationEmail = watch("email");

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role as "admin" | "user",
        position: editingUser.position || "",
        isActive: editingUser.isActive,
        avatar: editingUser.avatar || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "user",
        position: "",
        isActive: true,
        avatar: "",
      });
    }
  }, [editingUser, reset, open]);

  const onSubmit = async (values: UserFormValues) => {
    // Password validation only for editing users (if provided)

    // Validate password for editing users (if provided)
    if (editingUser && values.password && values.password.length > 0 && values.password.length < 6) {
      setError("password", {
        type: "manual",
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.password) {
        formData.append("password", values.password);
      }
      formData.append("role", values.role);
      formData.append("position", values.position || "");
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
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh]">
        {/* Header with gradient */}
        <div className="bg-[#0f1933] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {editingUser ? t("editUser") : t("addUser")}
              </DialogTitle>
              <p className="text-white/70 text-sm">Gestiona los usuarios del sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Avatar Upload Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-[#1e8bf8]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1e8bf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("userAvatar")}</span>
            </div>
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <ImageDropzone
                  value={field.value}
                  onChange={(file) => {
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        field.onChange(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              )}
            />
          </div>

          {/* Basic Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#1c3058]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1c3058]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Información básica</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userName")}
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e8bf8] focus:border-transparent transition-all"
                  placeholder="Nombre completo"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userEmail")}
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e8bf8] focus:border-transparent transition-all"
                  placeholder="correo@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {editingUser ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userPassword")} <span className="text-gray-400 normal-case">({t("leaveBlankToKeep")})</span>
                </label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e8bf8] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#1e8bf8]/5 border border-[#1e8bf8]/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-[#1e8bf8]/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#1e8bf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#0f1933] font-bold">Invitation via Email</p>
                </div>
                <p className="text-xs text-[#1c3058]">An invitation will be sent to <strong>{validationEmail || "the user"}</strong> to complete registration and set their password.</p>
              </div>
            )}
          </div>

          {/* Role & Settings Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#1c3058]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1c3058]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol y configuración</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userRole")}
                </label>
                {editingUser?.role === "admin" ? (
                  <input
                    type="text"
                    value={t("roleAdmin")}
                    disabled
                    className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                  />
                ) : (
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder={t("selectRole")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {t("roleUser")}
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#1e8bf8]"></span>
                              {t("roleAdmin")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("userPosition")}
                </label>
                <input
                  {...register("position")}
                  type="text"
                  className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e8bf8] focus:border-transparent transition-all"
                  placeholder="Ej: Gerente"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#1e8bf8] data-[state=checked]:border-[#1e8bf8]"
                  />
                )}
              />
              <div>
                <label className="font-medium text-gray-800 text-sm">
                  {t("userActive")}
                </label>
                <p className="text-xs text-gray-500">El usuario puede acceder al sistema</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0f1933] hover:bg-[#1c3058] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#0f1933]/25 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {tCommon("loading") ?? "Saving..."}
                </>
              ) : (
                <>
                  <BiSave className="w-5 h-5" />
                  <span>
                    {editingUser
                      ? t("updateUser")
                      : t("addUser")}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

