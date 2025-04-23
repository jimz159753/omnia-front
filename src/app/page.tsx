"use client";
import ListSection from "@/components/ListSection";
import { ProfileCard } from "@/components/ProfileCard";
import { Container, Grid } from "@mui/material";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/components/GeneticDataGrid/columns";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { items, rows, userInfo } from "@/mock/data";

export default function Home() {
  const { name, email, imgSrc } = userInfo;
  return (
    <Grid container sx={{ backgroundColor: "#F1F1F1" }}>
      <Grid
        size={12}
        height={70}
        sx={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Image src={OmniaTitle} alt="Omnia" height={40} />
      </Grid>
      <Grid
        size={2}
        sx={{
          backgroundColor: "#FDFDFD",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ProfileCard name={name} imgSrc={imgSrc} email={email} />
        <ListSection items={items} />
      </Grid>
      <Grid size={10} sx={{ backgroundColor: "#F1F1F1", height: "100vh" }}>
        <Container>
          <h1>Welcome to Omnia</h1>
          <p>
            Omnia is a platform that allows you to create and manage your own AI
            agents.
          </p>
          <GeneticDataGrid
            data={rows}
            columns={columns as GridColDef<GridValidRowModel>[]}
          />
        </Container>
      </Grid>
    </Grid>
  );
}
