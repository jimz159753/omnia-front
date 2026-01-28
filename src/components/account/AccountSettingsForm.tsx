"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { BiUser, BiSave } from "react-icons/bi";

import { ImageDropzone } from "@/components/ui/image-dropzone";

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.any().optional(),
});


type ProfileFormValues = z.infer<typeof profileSchema>;

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
    </>
  );
}
