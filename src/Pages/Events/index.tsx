import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/Pages/Events/ColumnsGrid/columns";
import { Grid } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid-pro";
import React, { useEffect, useState } from "react";
import EventForm from "@/components/Forms/Event";
import PanelContent from "./PanelContent";
import { IEventType } from "@/constants";
import { getEventTypes } from "@/api/services/cal";

const Events = () => {
  const [events, setEvents] = useState<IEventType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEventTypes()
  }, [])

  const fetchEventTypes = async () => {
    const data = await getEventTypes();
    const eventTypes = data.eventTypeGroups[0].eventTypes
    setEvents(eventTypes)
    setIsLoading(false)
  }

  const handleExpand = () => {
    console.log("collapsed");
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={8}>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={events}
          columns={columns as GridColDef<GridValidRowModel>[]}
          getDetailPanelContent={PanelContent}
          onDetailPanelExpandedRowIdsChange={handleExpand}
        />
      </Grid>
      <Grid size={4}>
        <EventForm />
      </Grid>
    </Grid>
  );
};

export default Events;
