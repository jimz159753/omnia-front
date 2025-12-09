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
              <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessName")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessName")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessCategory")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessCategory")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessWebsite")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessRFC")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessRFC")}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessAddress")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessAddress")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessCountry")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessCountry")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessPhone")}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={t("businessPhone")}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessDescription")}
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    rows={3}
                    placeholder={t("businessDescription")}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("businessLogo")}
                  </label>
                  <input
                    type="file"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </form>
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
