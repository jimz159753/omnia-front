import { IMenuItem, IUserInfo } from "@/components/constants";

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

export const clients = [
  {
    id: 1,
    phone: "331234567",
    name: "Jon",
    email: "jon@gmail.com",
    staff: "Staff",
    payment_method: "Bank Transfer",
    createdAt: "2023-10-01",
  },
  {
    id: 2,
    phone: "331234567",
    name: "Cersei",
    email: "cersei@gmail.com",
    staff: "Staff",
    payment_method: "PayPal",
    createdAt: "2023-10-02",
  },
  {
    id: 3,
    phone: "331234567",
    name: "Jaime",
    email: "jaime@gmail.com",
    staff: "Staff",
    payment_method: "Credit Card",
    createdAt: "2023-10-03",
  },
  {
    id: 4,
    phone: "331234567",
    name: "Arya",
    email: "aria@gmail.com",
    staff: "Staff",
    payment_method: "Cash",
    createdAt: "2023-10-04",
  },
  {
    id: 5,
    phone: "331234567",
    name: "Arya",
    email: "aria2@gmail.com",
    staff: "Staff",
    payment_method: "Credit Card",
    createdAt: "2023-10-05",
  },
  {
    id: 6,
    phone: "331234567",
    name: "Daenerys",
    email: "daenerys@gmail.com",
    staff: "Staff",
    payment_method: "Cash",
    createdAt: "2023-10-06",
  },
  {
    id: 7,
    phone: "331234567",
    name: "Raul",
    email: "raul@gmail.com",
    staff: "Staff",
    payment_method: "Cash",
    createdAt: "2023-10-07",
  },
];

export const events = [
  {
    id: 1,
    title: "Event 1",
    createdAt: "2023-10-01",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 1",
  },
  {
    id: 2,
    title: "Event 2",
    createdAt: "2023-10-02",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 2",
  },
  {
    id: 3,
    title: "Event 3",
    createdAt: "2023-10-03",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 3",
  },
  {
    id: 4,
    title: "Event 4",
    createdAt: "2023-10-04",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 4",
  },
  {
    id: 5,
    title: "Event 5",
    createdAt: "2023-10-05",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 5",
  },
  {
    id: 6,
    title: "Event 6",
    createdAt: "2023-10-06",
    date: "2023-10-01",
    url: "http://espacioomnia.com/cal",
    price: 500,
    description: "Description 6",
  },
];
