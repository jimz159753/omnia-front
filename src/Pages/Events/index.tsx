import GeneticDataGrid from '@/components/GeneticDataGrid';
import { columns } from '@/Pages/Events/ColumnsGrid/columns';
import { events } from '@/mock/data';
import { Grid } from '@mui/material';
import { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import React from 'react'
import EventForm from '@/components/Forms/Event';

const Events = () => <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
<Grid size={8}>
  <GeneticDataGrid
    sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
    data={events}
    columns={columns as GridColDef<GridValidRowModel>[]}
  />
</Grid>
<Grid size={4}>
  <EventForm />
</Grid>
</Grid>

export default Events;