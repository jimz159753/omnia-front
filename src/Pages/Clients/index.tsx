import UserForm from "@/components/Forms/Users";
import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/Pages/Clients/ColumnsGrid/columns";
import { clients } from "@/mock/data";
import { Grid } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { useState } from "react";
import { IClientForm } from "@/components/constants";

const Clients = () => {
  const [data, setData] = useState<IClientForm[]>(clients);
  const [form, setForm] = useState<IClientForm>({
    id: 0,
    name: "",
    phone: "",
    email: "",
    staff: "",
    paymentMethod: "",
    createdAt: new Date().toISOString(),
    amount: 0,
  });

  const handleAddClient = (client: IClientForm) => {
    const newClient = {
      id: clients.length + 1,
      name: client.name,
      phone: client.phone,
      email: client.email,
      staff: client.staff,
      paymentMethod: client.paymentMethod,
      createdAt: new Date().toISOString(),
      amount: client.amount,
    };
    setData((prev) => [...prev, newClient]);
  }

  console.log('data', data);
  
  return (
  <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
    <Grid size={8}>
      <GeneticDataGrid
        sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
        data={data}
        columns={columns as GridColDef<GridValidRowModel>[]}
      />
    </Grid>
    <Grid size={4}>
      <UserForm setForm={setForm} form={form} handleAddClient={handleAddClient}/>
    </Grid>
  </Grid>
)};

export default Clients;
