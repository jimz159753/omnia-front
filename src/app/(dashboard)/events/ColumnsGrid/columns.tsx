import { GridColDef } from "@mui/x-data-grid";

export interface Event {
  id: number;
  name: string;
  date: string;
  status: string;
}

export const columns: GridColDef<Event>[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "name",
    headerName: "Event Name",
    width: 250,
  },
  {
    field: "date",
    headerName: "Date",
    width: 150,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
  },
];
