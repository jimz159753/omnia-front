"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { BiBuilding } from "react-icons/bi";
import {
  businessSchema,
  type BusinessFormValues,
} from "@/lib/validations/business";
import { ImageDropzone } from "@/components/ui/image-dropzone";

export function BusinessDetailsForm() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
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
      }
    };
    fetchBusiness();
  }, [reset]);

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
      if (!res.ok) throw new Error("Failed to save business");
      const json = await res.json();
      toast.success(t("businessSaveSuccess"));
      if (json?.data?.logo) {
        setLogoPreview(json.data.logo);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("businessSaveError"));
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <BiBuilding className="w-5 h-5 text-brand-500" />
        <p className="text-lg font-medium">{t("businessDetailsTitle")}</p>
      </div>
      <div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
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
            <select
              {...register("language")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="en">{t("businessLanguageEnglish")}</option>
              <option value="es">{t("businessLanguageSpanish")}</option>
            </select>
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
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-800">
              {t("faqHeader")}
            </p>
            <div className="space-y-2 pt-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("parking")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("faqParking")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("acceptCards")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("faqCards")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("acceptCash")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("faqCash")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("petFriendly")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("faqPets")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("freeWifi")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("faqWifi")}
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-800">
              {t("whatsappDetailsTitle")}
            </p>
            <div className="space-y-2 pt-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("whatsappReminders")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("whatsappReminders")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("whatsappCredits")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("whatsappCredits")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("whatsappChatBot")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t("whatsappChatBot")}
              </label>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? tCommon("loading") ?? "Saving..."
                : t("businessFormSave")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
