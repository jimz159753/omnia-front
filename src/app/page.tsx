'use client';
import ListSection from "@/components/ListSection";
import { ProfileCard } from "@/components/ProfileCard";
import { Container, Grid } from "@mui/material";
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Image from "next/image";
import OmniaTitle from '@/assets/images/omnia_title.png'

const userInfo = {
  name: "Ale",
  email: "ale@gmail.com",
  imgSrc: 'https://images.unsplash.com/photo-1529995049601-ef63465a463f?q=80&w=2704&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
}

const items = [
  { icon: <CottageOutlinedIcon color="disabled" sx={{ height: '30px', width: '30px'}} />, title: 'Home' },
  { icon: <SettingsOutlinedIcon color="disabled" sx={{ height: '30px', width: '30px'}}/>, title: 'Settings' },
  { icon: <QuestionMarkOutlinedIcon color="disabled" sx={{ height: '30px', width: '30px'}}/>, title: 'Help' },
  { icon: <InfoOutlinedIcon color="disabled" sx={{ height: '30px', width: '30px'}}/>, title: 'About' },
  { icon: <LogoutOutlinedIcon color="disabled" sx={{ height: '30px', width: '30px'}}/>, title: 'Logout' },
]

export default function Home() {
  const { name, email, imgSrc } = userInfo;
  return (
      <Grid container sx={{ backgroundColor: '#F1F1F1' }}>
        <Grid size={12} height={70} sx={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '20px' }}>
            <Image src={OmniaTitle} alt="Omnia"  height={40} />
        </Grid>
        <Grid size={2} sx={{ backgroundColor: '#FDFDFD', height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ProfileCard name={name} imgSrc={imgSrc} email={email} />
          <ListSection items={items} />
        </Grid>
        <Grid size={10} sx={{ backgroundColor: '#F1F1F1', height: '100vh' }}>
          <Container>
            <h1>Welcome to Omnia</h1>
            <p>Omnia is a platform that allows you to create and manage your own AI agents.</p>
          </Container>
        </Grid>
      </Grid>
  );
}
