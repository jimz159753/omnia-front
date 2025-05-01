import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/Pages/Events/ColumnsGrid/columns";
import { Grid, Typography } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid-pro";
import React, { useEffect, useState } from "react";
import PanelContent from "./PanelContent";
import { IEventType, IBooking } from "@/constants";
import { getBookingsByEventTypeId, getEventTypes } from "@/api/services/cal";
import CustomModal from "@/components/ui/CustomModal";

const Events = () => {
  const [events, setEvents] = useState<IEventType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)

  useEffect(() => {
    fetchEventTypes()
  }, [])

  const fetchEventTypes = async () => {
    const data = await getEventTypes();
    const eventTypes = data.eventTypeGroups[0].eventTypes;
    setEvents(eventTypes)
    setIsLoading(false)
  }

  const handleExpand = async (groupIds?: Set<string>) => {
    if(groupIds && groupIds.size) {
      const groupIdsArray = Array.from(groupIds);
      const lastGroupId = groupIdsArray[groupIdsArray.length - 1];
      const data = await getBookingsByEventTypeId(lastGroupId);
      console.log('bookings ', data)
      setBookings(data)
    }
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={events}
          columns={columns as GridColDef<GridValidRowModel>[]}
          getDetailPanelContent={(row) => <PanelContent row={row} setSelectedBooking={setSelectedBooking} bookings={bookings} />}
          onDetailPanelExpandedRowIdsChange={handleExpand}
        />
        <CustomModal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
          <Typography>
            {selectedBooking?.name}
          </Typography>
        </CustomModal>
      </Grid>
    </Grid>
  );
};

export default Events;
