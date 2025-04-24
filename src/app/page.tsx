"use client";
import { Grid } from "@mui/material";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/components/GeneticDataGrid/columns";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { items, rows, userInfo } from "@/mock/data";
import { StyledContainer } from "./page.styles";
import UserForm from "@/components/Forms/Users";
import SideBar from "@/components/SideBar";

export default function Home() {
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
      <SideBar userInfo={userInfo} items={items} />
      <Grid size={10} sx={{ backgroundColor: "#F1F1F1", height: "100vh" }}>
        <StyledContainer>
          <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
          <Grid size={8}>
            <GeneticDataGrid
              sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
              data={rows}
              columns={columns as GridColDef<GridValidRowModel>[]}
            />
          </Grid>
          <Grid size={4}>
            <UserForm />
          </Grid>
          </Grid>
        </StyledContainer>
      </Grid>
    </Grid>
  );
}
