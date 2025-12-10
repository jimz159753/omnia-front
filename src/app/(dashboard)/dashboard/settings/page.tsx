"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FiGlobe } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { BusinessDetailsForm } from "@/components/business/BusinessDetailsForm";

const Settings = () => {
  const { t } = useTranslation("settings");

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("configurationHeader")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {t("businessHeader")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("businessDetailsTitle")}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• {t("businessDetailsItem")}</li>
                    <li>• {t("businessServices")}</li>
                    <li>• {t("businessUsers")}</li>
                    <li>• {t("businessSchedules")}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {t("accountHeader")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("accountDetailsTitle")}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• {t("accountDetailsItem")}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {t("whatsappHeader")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("whatsappDetailsTitle")}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• {t("whatsappDetailsItem")}</li>
                    <li>• {t("whatsappReminders")}</li>
                    <li>• {t("whatsappCredits")}</li>
                    <li>• {t("whatsappChatBot")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("businessDetailsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {t("businessFormDescription")}
              </p>
              <BusinessDetailsForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiGlobe className="w-5 h-5 text-brand-500" />
                {t("languagePreferences")}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
