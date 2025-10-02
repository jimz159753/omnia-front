import { IMenuItem, IUserInfo } from "@/constants";

export const userInfo: IUserInfo = {
  name: "Minerva",
  email: "mnrvbecerra@gmail.com",
  imgSrc:
    "https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

export const items: IMenuItem[] = [
  {
    icon: "mdi-light:credit-card",
    title: "Sales",
  },
  {
    icon: "mdi-light:calendar",
    title: "Events",
  },
  {
    icon: "material-symbols-light:finance-mode-outline-rounded",
    title: "Analytics",
  },
  {
    icon: "material-symbols-light:confirmation-number-outline",
    title: "Vouchers",
  },
  {
    icon: "mdi-light:tag",
    title: "Discounts",
  },
];
