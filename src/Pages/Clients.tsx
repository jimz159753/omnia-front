import UserForm from '@/components/Forms/Users';
import GeneticDataGrid from '@/components/GeneticDataGrid';
import { columns } from '@/components/GeneticDataGrid/columns';
import { rows } from '@/mock/data';
import { Grid } from '@mui/material';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import React from 'react'

const Clients = () => <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
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

export default Clients;