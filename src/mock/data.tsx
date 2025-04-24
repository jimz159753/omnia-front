import { IMenuItem, IUserInfo } from '@/components/constants';

export const userInfo: IUserInfo = {
    name: "Minerva",
    email: "mnrvbecerra@gmail.com",
    imgSrc:
      "https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };
  
export const items: IMenuItem[] = [
    {
      icon: 'mdi-light:account',
      title: "Clients",
    },
      {
        icon: 'mdi-light:calendar',
        title: "Events",
      },
      {
        icon: 'material-symbols-light:finance-mode-outline-rounded',
        title: "Analytics",
      },
      {
        icon: 'material-symbols-light:confirmation-number-outline',
        title: "Vouchers",
      },
      {
        icon: 'mdi-light:tag',
        title: "Discounts",
      },
  ];
  
export const rows = [
    { id: 1, phone: "331234567", name: "Jon", email: 'jon@gmail.com', staff: "Staff", payment_method: "Bank Transfer" },
    { id: 2, phone: "331234567", name: "Cersei", email: 'cersei@gmail.com', staff: "Staff", payment_method: "PayPal" },
    { id: 3, phone: "331234567", name: "Jaime", email: 'jaime@gmail.com', staff: "Staff", payment_method: "Credit Card" },
    { id: 4, phone: "331234567", name: "Arya", email: 'aria@gmail.com', staff: "Staff", payment_method: "Cash" },
    { id: 5, phone: "331234567", name: "Arya", email: 'aria2@gmail.com', staff: "Staff", payment_method: "Credit Card" },
    { id: 6, phone: "331234567", name: "Daenerys", email: 'daenerys@gmail.com', staff: "Staff", payment_method: "Cash" },
    { id: 7, phone: "331234567", name: 'Raul', email: 'raul@gmail.com', staff: "Staff", payment_method: "Cash" },
  ];