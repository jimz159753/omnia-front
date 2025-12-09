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
  const normalized = status;

  // Check legacy aliases first
  if (normalized in LEGACY_ALIASES) return LEGACY_ALIASES[normalized];

  // Check against enum values (case-insensitive)
  if (normalized === "Pending") return TicketStatus.Pending;
  if (normalized === "Confirmed") return TicketStatus.Confirmed;
  if (normalized === "Done") return TicketStatus.Done;
  if (normalized === "Canceled") return TicketStatus.Canceled;

  return undefined;
}

export function getStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeTicketStatus(status);
  if (!normalized) return status || "";
  return STATUS_LABELS[normalized];
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  const normalized = normalizeTicketStatus(status);
  if (!normalized) return STATUS_BADGE_CLASSES[TicketStatus.Pending];
  return STATUS_BADGE_CLASSES[normalized];
}
