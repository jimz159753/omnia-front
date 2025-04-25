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

export interface IEventType {
  id: string;
  eventName: string;
  title: string;
  description: string;
  length: string;
  price: number;
}