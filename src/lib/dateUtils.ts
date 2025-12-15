/**
 * Date utility functions
 * Follows DRY principle - centralized date formatting
 */

/**
 * Get ordinal suffix for a day (1st, 2nd, 3rd, etc.)
 */
export const getOrdinal = (day: number): string => {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return "st";
  if (mod10 === 2 && mod100 !== 12) return "nd";
  if (mod10 === 3 && mod100 !== 13) return "rd";
  return "th";
};

/**
 * Format date and time for ticket display
 */
export const formatTicketDateTime = (
  iso?: string | Date
): { dateStr: string; timeStr: string } => {
  if (!iso) return { dateStr: "-", timeStr: "" };

  const date = iso instanceof Date ? iso : new Date(iso);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const dateStr = `${month} ${day}${getOrdinal(day)}, ${year}`;
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { dateStr, timeStr };
};

