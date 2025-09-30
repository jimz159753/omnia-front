import moon from "@/assets/images/moon.webp";
import butterfly from "@/assets/images/butterfly.webp";
import hand from "@/assets/images/hand.webp";
import frontdesk from "@/assets/images/frontdesk.webp";
import cosmetology from "@/assets/images/cosmetology.webp";
import massage from "@/assets/images/massage.webp";
import mirrors from "@/assets/images/mirrors.webp";
import plants from "@/assets/images/plants.webp";
import products from "@/assets/images/products.webp";
import yard from "@/assets/images/yard.webp";

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
  firts: [1, 2, 3, 4, 5, 6, 7],
  second: [3, 12, 23, 3, 15, 16, 17],
  third: [11, 32, 23, 14, 15, 26, 37],
  fourth: [10, 21, 13, 24, 15, 26, 17],
};
export const xLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
];

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

// Bookings

export interface IBookingResponse {
  status: string;
  data: IBooking[];
}

export interface IBooking {
  id: number;
  uid: string;
  title: string;
  description: string;
  hosts: Host[];
  status: "accepted" | "pending" | "rejected" | "cancelled"; // Add other possible statuses if needed
  start: string; // ISO 8601 date string
  end: string; // ISO 8601 date string
  duration: number;
  eventTypeId: number;
  eventType: {
    id: number;
    slug: string;
  };
  meetingUrl: string;
  location: string;
  absentHost: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  metadata: Record<string, unknown>;
  rating: number | null;
  icsUid: string;
  attendees: Attendee[];
  guests: unknown[]; // Could be more specific if guest structure is known
  bookingFieldsResponses: {
    email: string;
    name: string;
    guests: unknown[]; // Could be more specific
    notes: string;
    title: string;
    location: {
      value: string;
      optionValue: string;
    };
    [key: string]: unknown; // For additional dynamic fields
  };
}

interface Host {
  id: number;
  name: string;
  email: string;
  username: string;
  timeZone: string;
}

interface Attendee {
  name: string;
  email: string;
  timeZone: string;
  language: string;
  absent: boolean;
  phoneNumber?: string; // Optional as it wasn't in your example
}

// Clients

export interface IClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  checkin: string;
  payments: IPayment[];
}

export interface IPayment {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

export interface IService {
  id: string;
  label: string;
  description: string;
}

export const navigationItems = [
  { id: "conocenos", label: "Conocenos" },
  { id: "servicios", label: "Servicios" },
  { id: "espacios", label: "Espacios" },
  { id: "reservas", label: "Reservas" },
  { id: "contacto", label: "Contacto" },
];

export const services: IService[] = [
  {
    id: "masajes",
    label: "Masajes",
    description:
      "Liberación, descanso y presencia a través del tacto consciente. Nuestros masajes son una pausa para el cuerpo y una caricia para el alma.",
  },
  {
    id: "tarot",
    label: "Tarot",
    description:
      "Más que una lectura de cartas, es un espacio de conexión contigo mismo, donde podrás encontrar claridad, orientación y nuevas perspectivas para tu vida.",
  },
  {
    id: "cosmetologia",
    label: "Cosmetología",
    description:
      "Cada tratamiento está diseñado para realzar tu belleza natural mientras disfrutas de un momento de relajación y conexión contigo mismo. Utilizamos productos de calidad y, en algunos casos, naturales, buscando siempre un equilibrio entre salud, estética y bienestar integral.",
  },
  {
    id: "reiki",
    label: "Reiki",
    description:
      "A través de la imposición de manos, se canaliza energía vital para desbloquear, armonizar y revitalizar tu campo energético.",
  },
  {
    id: "meditacion",
    label: "Meditación",
    description:
      "Durante cada práctica aprenderás a observar tus pensamientos sin juicio, soltar tensiones y abrir espacio a la serenidad y la claridad. Nuestras sesiones son aptas tanto para principiantes como para personas con experiencia.",
  },
  {
    id: "terapias",
    label: "Terapias",
    description:
      "Ofrecemos diferentes terapias alternativas que buscan armonizar tu energía, liberar bloqueos y acompañarte en tu camino de transformación personal.",
  },
];

export const aboutImages = [
  {
    id: 1,
    image: frontdesk,
  },
  {
    id: 2,
    image: cosmetology,
  },

  {
    id: 3,
    image: massage,
  },
  {
    id: 4,
    image: mirrors,
  },
  {
    id: 5,
    image: plants,
  },
  {
    id: 6,
    image: products,
  },
  {
    id: 7,
    image: yard,
  },
];

export const tagSpaces = [
  {
    id: 1,
    name: "tranquilidad",
  },
  {
    id: 2,
    name: "cuidado",
  },
  {
    id: 3,
    name: "recuperacion",
  },
  {
    id: 4,
    name: "paz",
  },
  {
    id: 5,
    name: "tempo",
  },
  {
    id: 6,
    name: "calma",
  },
  {
    id: 7,
    name: "equilibrio",
  },
  {
    id: 8,
    name: "momento",
  },
];

export const values = [
  {
    id: 1,
    title: "Misión",
    image: moon,
    description:
      "Promover el desarrollo integral de las personas mediante experiencias que unan mente, cuerpo y espíritu, construyendo una comunidad consciente y solidaria.",
  },
  {
    id: 2,
    title: "Visión",
    image: butterfly,
    description:
      "Ser un referente en el desarrollo integral de las personas, ofreciendo experiencias que unan mente, cuerpo y espíritu en una comunidad consciente y solidaria.",
  },
  {
    id: 3,
    title: "Valores",
    image: hand,
    description:
      "Una casa holística se guía por valores de equilibrio, sostenibilidad y bienestar, creando un espacio que nutre la mente, el cuerpo y el espíritu.",
  },
];
