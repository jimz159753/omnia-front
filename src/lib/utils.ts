import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { Locale } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to capitalize first letter of each word in date
 * @param date - The date to format
 * @param locales - The locale object to use for formatting
 * @param locale - The locale string (e.g., "es-ES" or "en-US")
 * @returns Formatted date string with capitalized day and month names
 * @example formatDateWithCapitalization(new Date(), { "es-ES": es }, "es-ES") // "Viernes, Diciembre 12, 2025"
 */
export const formatDateWithCapitalization = (
  date: Date,
  locales: Record<string, Locale>,
  locale: string
): string => {
  const formatted = format(date, "EEEE, MMMM d, yyyy", {
    locale: locales[locale],
  });

  // Capitalize first letter of day name and month name
  return formatted
    .split(" ")
    .map((word, index) => {
      // Capitalize first word (day) and month (index 1)
      if (index === 0 || index === 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
};
