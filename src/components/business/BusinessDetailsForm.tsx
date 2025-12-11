"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { BiBuilding, BiGlobe, BiSave } from "react-icons/bi";
import { FiMessageCircle } from "react-icons/fi";

import {
  businessSchema,
  type BusinessFormValues,
} from "@/lib/validations/business";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BusinessDetailsForm() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();
  const { i18n } = useI18nTranslation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      category: "",
      website: "",
      rfc: "",
      address: "",
      country: "",
      phone: "",
      description: "",
      facebook: "",
      twitter: "",
      instagram: "",
      parking: false,
      acceptCards: false,
      acceptCash: false,
      petFriendly: false,
      freeWifi: false,
      whatsappReminders: false,
      whatsappCredits: false,
      whatsappChatBot: false,
      logo: undefined,
      language: "en",
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const faqItems = [
    {
      name: "parking" as const,
      label: t("faqParking"),
      description: t("faqParkingDescription"),
    },
    {
      name: "acceptCards" as const,
      label: t("faqCards"),
      description: t("faqCardsDescription"),
    },
    {
      name: "acceptCash" as const,
      label: t("faqCash"),
      description: t("faqCashDescription"),
    },
    {
      name: "petFriendly" as const,
      label: t("faqPets"),
      description: t("faqPetsDescription"),
    },
    {
      name: "freeWifi" as const,
      label: t("faqWifi"),
      description: t("faqWifiDescription"),
    },
  ];

  useEffect(() => {
    const fetchBusiness = async () => {
      const res = await fetch("/api/business");
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        const data = json.data;
        reset({
          name: data.name ?? "",
          category: data.category ?? "",
          website: data.website ?? "",
          rfc: data.rfc ?? "",
          address: data.address ?? "",
          country: data.country ?? "",
          phone: data.phone ?? "",
          description: data.description ?? "",
          facebook: data.facebook ?? "",
          twitter: data.twitter ?? "",
          instagram: data.instagram ?? "",
          parking: data.parking ?? false,
          acceptCards: data.acceptCards ?? false,
          acceptCash: data.acceptCash ?? false,
          petFriendly: data.petFriendly ?? false,
          freeWifi: data.freeWifi ?? false,
          whatsappReminders: data.whatsappReminders ?? false,
          whatsappCredits: data.whatsappCredits ?? false,
          whatsappChatBot: data.whatsappChatBot ?? false,
          language: data.language ?? "en",
          logo: undefined,
        });
        if (data.logo) setLogoPreview(data.logo);
        // Set the application language to match the saved business language
        if (data.language && data.language !== i18n.language) {
          i18n.changeLanguage(data.language);
        }
      }
    };
    fetchBusiness();
  }, [reset, i18n]);

  const onSubmit = async (values: BusinessFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "logo") return;
        formData.append(key, value?.toString() ?? "");
      });
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      const res = await fetch("/api/business", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.details || json.error || "Failed to save business"
        );
      }

      toast.success(t("businessSaveSuccess"));
      if (json?.data?.logo) {
        setLogoPreview(json.data.logo);
      }
      // Update the application language to match the saved language
      if (values.language && values.language !== i18n.language) {
        i18n.changeLanguage(values.language);
      }
    } catch (error) {
      console.error("Business save error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("businessSaveError");
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <BiBuilding className="w-6 h-6 text-brand-500" />
        <p className="text-2xl font-medium">{t("businessDetailsTitle")}</p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pb-10">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessName")}
              </label>
              <input
                {...register("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessName")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessCategory")}
              </label>
              <input
                {...register("category")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessCategory")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessWebsite")}
              </label>
              <input
                {...register("website")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessRFC")}
              </label>
              <input
                {...register("rfc")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessRFC")}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("businessAddress")}
              </label>
              <input
                {...register("address")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessAddress")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessCountry")}
              </label>
              <input
                {...register("country")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessCountry")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessLanguage")}
              </label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("businessLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        {t("businessLanguageEnglish")}
                      </SelectItem>
                      <SelectItem value="es">
                        {t("businessLanguageSpanish")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessPhone")}
              </label>
              <input
                {...register("phone")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t("businessPhone")}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("businessDescription")}
              </label>
              <textarea
                {...register("description")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                rows={3}
                placeholder={t("businessDescription")}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("businessLogo")}
              </label>
              <ImageDropzone
                value={logoPreview || undefined}
                onChange={(file: File | null) => {
                  setLogoFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setLogoPreview(null);
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2 py-10 border-y border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <BiGlobe className="w-6 h-6 text-brand-500" />
              <p className="text-2xl font-medium">{t("businessSocialMedia")}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {t("businessSocialMediaDescription")}
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessFacebook")}
              </label>
              <input
                {...register("facebook")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("businessTwitter")}
              </label>
              <input
                {...register("twitter")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                {t("businessInstagram")}
              </label>
              <input
                {...register("instagram")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://instagram.com/youraccount"
              />
            </div>
          </div>
          <div className="space-y-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2 py-10 border-y border-gray-300">
              <div className="flex items-center gap-2 mb-4">
                <FiMessageCircle className="w-6 h-6 text-brand-500" />
                <p className="text-2xl font-medium">{t("faqHeader")}</p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {t("faqDescription")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {faqItems.map((item) => (
                  <Card className="shadow-none" key={item.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Controller
                          name={item.name as keyof BusinessFormValues}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <div className="flex-1">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <BiSave className="w-5 h-5 text-white" />
                <span>
                  {isSubmitting
                    ? tCommon("loading") ?? "Saving..."
                    : t("businessFormSave")}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
