import { Grid } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import GeneticDataGrid from "@/app/components/GeneticDataGrid";
import { columns } from "./ColumnsGrid/columns";
import { useState } from "react";
import { checkinClient, getClients } from "@/api/services";
import { useEffect } from "react";
import { IClient } from "@/constants";

const Clients = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const data = await getClients();
    setClients(data);
    setIsLoading(false);
  };

  const handleCheckin = async (id: number) => {
    await checkinClient(id);
    fetchClients();
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={clients}
          columns={columns(handleCheckin) as GridColDef<GridValidRowModel>[]}
        />
      </Grid>
    </Grid>
  );
};

export default Clients;
