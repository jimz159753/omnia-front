// Tabs

export enum TabNames {
  Clients = "Clients",
  Events = "Events",
  Analytics = "Analytics",
  Vouchers = "Vouchers",
  Discounts = "Discounts",
}

// Charts

export const rooms = {
  firts: [1,2,3,4,5,6,7],
  second: [3,12,23,3,15,16,17],
  third: [11,32,23,14,15,26,37],
  fourth: [10,21,13,24,15,26,17],
}
export const xLabels = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// General

export enum Variant {
  filled = "filled",
  outlined = "outlined",
  standard = "standard",
  contained = "contained",
}

export interface IUserInfo {
  name: string;
  email: string;
  imgSrc: string;
}

export interface IMenuItem {
  title: string;
  icon: string;
}

export const paymentMethods = [
  { id: 1, name: "Credit Card" },
  { id: 2, name: "Bank Transfer" },
  { id: 3, name: "Cash" },
]

export interface IClientForm {
  id?: number;
  createdAt?: string;
  name: string;
  phone: string;
  email: string;
  staff: string;
  paymentMethod: string;
  amount: number;
}

// Event-types

export interface IEventTypeResponse {
  status: string;
  data: {
    eventTypeGroups: EventTypeGroup[];
  };
}

interface EventTypeGroup {
  teamId: null;
  bookerUrl: string;
  membershipRole: null;
  profile: {
    slug: string;
    name: string;
    image: string;
  };
  eventTypes: IEventType[];
  metadata: {
    membershipCount: number;
    readOnly: boolean;
  };
}

export interface IEventType {
  id: number;
  teamId: null;
  schedulingType: null;
  userId: number;
  metadata: {
    apps?: {
      giphy?: {
        enabled: boolean;
        thankYouPage: string;
      };
      stripe?: {
        enabled: boolean;
        credentialId: number;
        appCategories: string[];
        price: number;
        currency: string;
        paymentOption: string;
      };
    };
    multipleDuration?: number[];
  };
  description: string;
  hidden: boolean;
  slug: string;
  length: number;
  title: string;
  requiresConfirmation: boolean;
  position: number;
  offsetStart: number;
  profileId: null;
  eventName: string | null;
  parentId: null;
  timeZone: null;
  periodType: string;
  periodStartDate: null;
  periodEndDate: null;
  periodDays: number | null;
  periodCountCalendarDays: null;
  lockTimeZoneToggleOnBookingPage: boolean;
  requiresBookerEmailVerification: boolean;
  disableGuests: boolean;
  hideCalendarNotes: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  seatsPerTimeSlot: null;
  onlyShowFirstAvailableSlot: boolean;
  seatsShowAttendees: boolean;
  seatsShowAvailabilityCount: boolean;
  scheduleId: null;
  price: number;
  currency: string;
  slotInterval: null;
  successRedirectUrl: null;
  isInstantEvent: boolean;
  aiPhoneCallConfig: null;
  assignAllTeamMembers: boolean;
  recurringEvent: null;
  locations: {
    type: string;
    address?: string;
    displayLocationPublicly?: boolean;
  }[];
  bookingFields: {
    name: string;
    type: string;
    sources: {
      id: string;
      type: string;
      label: string;
      fieldRequired?: boolean;
    }[];
    editable: string;
    required: boolean;
    defaultLabel?: string;
    defaultPlaceholder?: string;
    label?: string;
    hidden?: boolean;
    placeholder?: string;
    disableOnPrefill?: boolean;
    getOptionsAt?: string;
    optionsInputs?: {
      [key: string]: {
        type: string;
        required: boolean;
        placeholder: string;
      };
    };
    hideWhenJustOneOption?: boolean;
    views?: {
      id: string;
      label: string;
    }[];
    options?: {
      label: string;
      value: string;
    }[];
  }[];
  useEventTypeDestinationCalendarEmail: boolean;
  secondaryEmailId: null;
  bookingLimits: Record<string, unknown> | null;
  durationLimits: Record<string, unknown>;
  hashedLink: unknown[];
  children: unknown[];
  hosts: unknown[];
  safeDescription?: string;
  userIds: number[];
}
