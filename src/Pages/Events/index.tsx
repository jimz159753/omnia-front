import GeneticDataGrid from "@/components/GeneticDataGrid";
import { columns } from "@/Pages/Events/ColumnsGrid/columns";
import { Box, Grid, Typography } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid-pro";
import React, { useEffect, useState } from "react";
import PanelContent from "./PanelContent";
import { IEventType, IBooking } from "@/constants";
import { getBookingsByEventTypeId, getEventTypes } from "@/api/services/cal";
import CustomModal from "@/components/ui/CustomModal";
import { formatDateToDateTime, formatDateToTime } from "@/utils";
import { StyledBox, StyledTypography } from "./Events.styles";

const Events = () => {
  const [events, setEvents] = useState<IEventType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    const data = await getEventTypes();
    const eventTypes = data.eventTypeGroups[0].eventTypes;
    setEvents(eventTypes);
    setIsLoading(false);
  };

  const handleExpand = async (groupIds?: Set<string>) => {
    if (groupIds && groupIds.size) {
      const groupIdsArray = Array.from(groupIds);
      const lastGroupId = groupIdsArray[groupIdsArray.length - 1];
      const data = await getBookingsByEventTypeId(lastGroupId);
      setBookings(data);
    }
  };

  console.log("selectedBooking ", selectedBooking);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={events}
          columns={columns as GridColDef<GridValidRowModel>[]}
          getDetailPanelContent={(row) => (
            <PanelContent
              row={row}
              setSelectedBooking={setSelectedBooking}
              bookings={bookings}
              setIsOpenModal={setIsOpenModal}
            />
          )}
          onDetailPanelExpandedRowIdsChange={handleExpand}
        />
        <CustomModal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
          <StyledBox>
            <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
              {selectedBooking?.title}
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              {selectedBooking?.bookingFieldsResponses.email}
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              {selectedBooking?.createdAt &&
                formatDateToDateTime(selectedBooking.createdAt)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                marginY: "10px",
              }}
            >
              <StyledTypography>
                {selectedBooking?.start &&
                  formatDateToTime(selectedBooking.start)}
              </StyledTypography>
              <StyledTypography>
                {selectedBooking?.end && formatDateToTime(selectedBooking.end)}
              </StyledTypography>
            </Box>
            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
              {selectedBooking?.location}
            </Typography>
          </StyledBox>
        </CustomModal>
      </Grid>
    </Grid>
  );
};

export default Events;
