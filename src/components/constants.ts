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

export enum TabNames {
  Clients = "Clients",
  Events = "Events",
  Analytics = "Analytics",
  Vouchers = "Vouchers",
  Discounts = "Discounts",
}
