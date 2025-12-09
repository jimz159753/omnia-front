"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FiGlobe, FiSettings } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

const Settings = () => {
  const { t } = useTranslation("settings");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FiSettings className="w-8 h-8 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
      </div>

      <div className="grid gap-6">
        {/* Language Settings Card */}
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

        {/* Future Settings Sections */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-gray-500">
              {t("additionalSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{t("moreSettingsSoon")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
