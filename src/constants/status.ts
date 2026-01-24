import i18next from "@/i18n";

export enum TicketStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Done = "Done",
  Canceled = "Canceled",
}

const LEGACY_ALIASES: Record<string, TicketStatus> = {
  completed: TicketStatus.Done,
  cancelled: TicketStatus.Canceled,
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.Pending]: "Pending",
  [TicketStatus.Confirmed]: "Confirmed",
  [TicketStatus.Done]: "Done",
  [TicketStatus.Canceled]: "Canceled",
};

export const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  [TicketStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [TicketStatus.Confirmed]: "bg-blue-100 text-blue-800",
  [TicketStatus.Done]: "bg-green-100 text-green-800",
  [TicketStatus.Canceled]: "bg-red-100 text-red-800",
};

export function normalizeTicketStatus(
  status: string | null | undefined
): TicketStatus | undefined {
  if (!status) return undefined;
  const normalized = status.toLowerCase();

  // Check legacy aliases first
  if (status in LEGACY_ALIASES) return LEGACY_ALIASES[status];

  // Check against enum values (case-insensitive)
  if (normalized === "pending") return TicketStatus.Pending;
  if (normalized === "confirmed") return TicketStatus.Confirmed;
  if (normalized === "done") return TicketStatus.Done;
  if (normalized === "canceled" || normalized === "cancelled") return TicketStatus.Canceled;

  return undefined;
}

export function getStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeTicketStatus(status);
  if (!normalized) return status || "";
  const translation = i18next.t(`status:${normalized}`);
  if (translation && translation !== `status:${normalized}`) {
    return translation;
  }
  return STATUS_LABELS[normalized];
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  const normalized = normalizeTicketStatus(status);
  if (!normalized) return STATUS_BADGE_CLASSES[TicketStatus.Pending];
  return STATUS_BADGE_CLASSES[normalized];
}
