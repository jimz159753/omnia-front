"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { BiUser, BiLock, BiSave } from "react-icons/bi";
import { ImageDropzone } from "@/components/ui/image-dropzone";

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.any().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function AccountSettingsForm() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { isSubmitting: isSubmittingPassword, errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            resetProfile({
              name: json.data.name || "",
              email: json.data.email || "",
            });
            if (json.data.avatar) {
              setAvatarPreview(json.data.avatar);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchUserProfile();
  }, [resetProfile]);

  const onSubmitProfile = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData();
      if (values.name) formData.append("name", values.name);
      if (values.email) formData.append("email", values.email);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/api/account", {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || "Failed to update profile"
        );
      }

      toast.success(t("profileUpdateSuccess"));
      if (json?.data?.avatar) {
        setAvatarPreview(json.data.avatar);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("profileUpdateError");
      toast.error(errorMessage);
    }
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || "Failed to change password"
        );
      }

      toast.success(t("passwordChangeSuccess"));
      resetPassword();
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("passwordChangeError");
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* Profile Settings */}
      <div className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <BiUser className="w-6 h-6 text-brand-500" />
          <p className="text-2xl font-medium">{t("profileSettings")}</p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {t("profileSettingsDescription")}
        </p>

        <form
          onSubmit={handleSubmitProfile(onSubmitProfile)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("accountName")}
              </label>
              <input
                {...registerProfile("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("accountName")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("accountEmail")}
              </label>
              <input
                {...registerProfile("email")}
                type="email"
                className="w-full rounded-md border border-gray-300 text-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("accountEmail")}
                disabled
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("accountAvatar")}
              </label>
              <ImageDropzone
                value={avatarPreview || undefined}
                onChange={(file: File | null) => {
                  setAvatarFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setAvatarPreview(null);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <BiSave className="w-5 h-5" />
              <span>
                {isSubmittingProfile
                  ? tCommon("loading") ?? "Saving..."
                  : t("saveProfile")}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="pt-6 border-t border-gray-300">
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <BiLock className="w-6 h-6 text-brand-500" />
            <p className="text-2xl font-medium">{t("changePassword")}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {t("changePasswordDescription")}
          </p>

          <form
            onSubmit={handleSubmitPassword(onSubmitPassword)}
            className="space-y-4"
          >
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("currentPassword")}
                </label>
                <input
                  {...registerPassword("currentPassword")}
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={t("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("newPassword")}
                </label>
                <input
                  {...registerPassword("newPassword")}
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={t("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("confirmPassword")}
                </label>
                <input
                  {...registerPassword("confirmPassword")}
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={t("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <BiLock className="w-5 h-5" />
                <span>
                  {isSubmittingPassword
                    ? tCommon("loading") ?? "Changing..."
                    : t("changePasswordButton")}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
