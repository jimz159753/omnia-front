import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import { IMenuItem, IUserInfo } from '@/components/constants';

export const userInfo: IUserInfo = {
    name: "Minerva",
    email: "mnrvbecerra@gmail.com",
    imgSrc:
      "https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };
  
export const items: IMenuItem[] = [
    {
      icon: (
        <GroupOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Clients",
    },
    {
      icon: (
        <CalendarMonthOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Events",
    },
    {
      icon: (
        <LeaderboardOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Analytics",
    },
    {
      icon: (
        <ConfirmationNumberOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Vouchers",
    },
    {
      icon: (
        <DiscountOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Discounts",
    },
  ];
  
export const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  ];