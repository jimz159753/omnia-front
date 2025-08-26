import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns, Event } from "./ColumnsGrid/columns";
import { Grid } from "@mui/material";
import { useState, useEffect } from "react";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Placeholder data for now
  const mockEvents: Event[] = [
    { id: 1, name: "Event 1", date: "2024-01-01", status: "Active" },
    { id: 2, name: "Event 2", date: "2024-01-02", status: "Pending" },
  ];

  useEffect(() => {
    setEvents(mockEvents);
    setIsLoading(false);
  }, []);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        {/* <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={events}
          columns={columns}
        /> */}
      </Grid>
    </Grid>
  );
};

export default Events;
