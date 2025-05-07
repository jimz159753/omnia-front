
import { clients } from "@/mock/data";
import { Grid } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import GeneticDataGrid from "@/app/components/GeneticDataGrid";
import { columns } from "./ColumnsGrid/columns";

const Clients = () => {

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        <GeneticDataGrid
          loading={false}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={clients}
          columns={columns as GridColDef<GridValidRowModel>[]}
        />
      </Grid>
    </Grid>
  );
};

export default Clients;
