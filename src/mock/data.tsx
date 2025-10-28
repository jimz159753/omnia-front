import { IMenuItem, IUserInfo } from "@/constants";
import { AlignBottom, Calendar, Percentage, Tag, Ticket } from "akar-icons";

export const userInfo: IUserInfo = {
  name: "Luis Jimenez",
  email: "luisjc140992@gmail.com",
  imgSrc:
    "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?semt=ais_hybrid&w=740&q=80",
};

export const items: IMenuItem[] = [
  {
    icon: () => <AlignBottom size={24} />,
    title: "Analytics",
  },
  {
    icon: () => <Tag size={24} />,
    title: "Sales",
  },
  {
    icon: () => <Calendar size={24} />,
    title: "Events",
  },
  {
    icon: () => <Ticket size={24} />,
    title: "Vouchers",
  },
  {
    icon: () => <Percentage size={24} />,
    title: "Discounts",
  },
];
