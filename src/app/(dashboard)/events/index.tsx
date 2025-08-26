import GeneticDataGrid from "@/app/components/GeneticDataGrid";
import { columns } from "@/app/dashboard/events/ColumnsGrid/columns";
import { Grid } from "@mui/material";
import {
  GridColDef,
  GridRowId,
  GridValidRowModel,
  DataGridProProps,
} from "@mui/x-data-grid-pro";
import React, { useEffect, useState } from "react";
import PanelContent from "./PanelContent";
import { IEventType, IBooking } from "@/constants";
import { getBookingsByEventTypeId, getEventTypes } from "@/api/services";
import CustomModal from "@/app/components/ui/CustomModal";
import ModalContent from "./ModalContent";

const Events = () => {
  const [events, setEvents] = useState<IEventType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] =
    React.useState(() => new Set<GridRowId>());

  const getDetailPanelContent = (params: {
    row: IBooking;
    id: GridRowId;
    column?: GridColDef;
  }) => (
    <PanelContent
      row={params.row}
      setSelectedBooking={setSelectedBooking}
      bookings={bookings}
      setIsOpenModal={setIsOpenModal}
    />
  );

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    const data = await getEventTypes();
    const eventTypes = data.eventTypeGroups[0].eventTypes;
    setEvents(eventTypes);
    setIsLoading(false);
  };

  const handleDetailPanelExpandedRowIdsChange = React.useCallback<
    NonNullable<DataGridProProps["onDetailPanelExpandedRowIdsChange"]>
  >(async (newIds) => {
    const newIdsArray = Array.from(newIds);
    if (newIds.size > 1) {
      const newSet = new Set<GridRowId>();
      newSet.add(newIdsArray[newIdsArray.length - 1]);
      setDetailPanelExpandedRowIds(newSet);
    } else {
      setDetailPanelExpandedRowIds(newIds);
    }
    if (newIdsArray.length) {
      const lastGroupId = newIdsArray[newIdsArray.length - 1];
      const data = await getBookingsByEventTypeId(lastGroupId.toString());
      setBookings(data);
    }
  }, []);

  return (
    <Grid container spacing={2} sx={{ marginTop: "20px", width: "100%" }}>
      <Grid size={12}>
        <GeneticDataGrid
          loading={isLoading}
          sx={{ borderRadius: "8px", border: "1px solid #ccc" }}
          data={events}
          columns={columns as GridColDef<GridValidRowModel>[]}
          getDetailPanelContent={getDetailPanelContent}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={
            handleDetailPanelExpandedRowIdsChange
          }
        />
        <CustomModal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
          <ModalContent selectedBooking={selectedBooking} />
        </CustomModal>
      </Grid>
    </Grid>
  );
};

export default Events;
