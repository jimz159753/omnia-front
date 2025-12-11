"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { defaultLocale } from "./config";

// Get the saved language from localStorage or use default
const savedLanguage = typeof window !== "undefined" 
  ? localStorage.getItem("i18nextLng") || defaultLocale
  : defaultLocale;

i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    lng: savedLanguage,
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Save language to localStorage whenever it changes
i18next.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("i18nextLng", lng);
  }
});

export default i18next;

