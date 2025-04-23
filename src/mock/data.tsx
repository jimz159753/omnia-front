import CottageOutlinedIcon from "@mui/icons-material/CottageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import QuestionMarkOutlinedIcon from "@mui/icons-material/QuestionMarkOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export const userInfo = {
    name: "Ale",
    email: "ale@gmail.com",
    imgSrc:
      "https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };
  
export const items = [
    {
      icon: (
        <CottageOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Home",
    },
    {
      icon: (
        <SettingsOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Settings",
    },
    {
      icon: (
        <QuestionMarkOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Help",
    },
    {
      icon: (
        <InfoOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "About",
    },
    {
      icon: (
        <LogoutOutlinedIcon
          color="disabled"
          sx={{ height: "30px", width: "30px" }}
        />
      ),
      title: "Logout",
    },
  ];
  
export const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  ];