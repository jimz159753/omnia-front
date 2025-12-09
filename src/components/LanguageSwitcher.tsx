"use client";

import { useTranslation } from "react-i18next";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: Locale) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            i18n.language === locale
              ? "bg-brand-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

