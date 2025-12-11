"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { BusinessDetailsForm } from "@/components/business/BusinessDetailsForm";
import { FiGlobe } from "react-icons/fi";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function BusinessDetailsPage() {
  const { t } = useTranslation("settings");

  return (
    <>
      <div>
        <BusinessDetailsForm />
        <div>
          <p className="flex items-center gap-2">
            <FiGlobe className="w-5 h-5 text-brand-500" />
            {t("languagePreferences")}
          </p>
        </div>
        <div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                {t("selectLanguage")}
              </label>
              <p className="text-sm text-gray-500 mb-4">
                {t("languageDescription")}
              </p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
