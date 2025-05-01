import { IClientForm, IMenuItem, IUserInfo } from "@/constants";
import { EventInput } from "@fullcalendar/core/index.js";

export const userInfo: IUserInfo = {
  name: "Minerva",
  email: "mnrvbecerra@gmail.com",
  imgSrc:
    "https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

export const items: IMenuItem[] = [
  {
    icon: "mdi-light:account",
    title: "Clients",
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

export const clients: IClientForm[] = [
  {
    id: 1,
    phone: "331234567",
    name: "Jon",
    email: "jon@gmail.com",
    staff: "Staff",
    paymentMethod: "Credit Card",
    createdAt: "2023-10-01",
    amount: 100,
  },
  {
    id: 2,
    phone: "331234567",
    name: "Cersei",
    email: "cersei@gmail.com",
    staff: "Staff",
    paymentMethod: "PayPal",
    createdAt: "2023-10-02",
    amount: 0,
  },
  {
    id: 3,
    phone: "331234567",
    name: "Jaime",
    email: "jaime@gmail.com",
    staff: "Staff",
    paymentMethod: "Credit Card",
    createdAt: "2023-10-03",
    amount: 0,
  },
  {
    id: 4,
    phone: "331234567",
    name: "Arya",
    email: "aria@gmail.com",
    staff: "Staff",
    paymentMethod: "Cash",
    createdAt: "2023-10-04",
    amount: 0,
  },
  {
    id: 5,
    phone: "331234567",
    name: "Arya",
    email: "aria2@gmail.com",
    staff: "Staff",
    paymentMethod: "Credit Card",
    createdAt: "2023-10-05",
    amount: 0,
  },
];


export const events: EventInput[] = [
  {
    title: 'Team Meeting',
    start: new Date(),
    end: new Date(),
    extendedProps: {
      id: 1,
      name: 'Team Meeting',
      description: 'Weekly team sync with product and engineering'
    }
  },
  {
    title: 'Client Call',
    start: '2025-04-15T10:30:00',
    end: '2025-04-15T11:30:00',
    extendedProps: {
      id: 2,
      name: 'Client Call',
      description: 'Discuss project requirements with ABC Corp'
    }
  }
];