import { GridColDef } from "@mui/x-data-grid-pro";

export interface IRow {
  id: number;
  title: string;
  description: string;
  url: string;
  duration: string;
  price: string;
}

export const columns: GridColDef<IRow>[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "eventName",
    headerName: "Event Name",
    width: 150,
  },
  {
    field: "title",
    headerName: "Title",
    width: 150,
  },
  {
    field: "description",
    headerName: "Description",
    width: 150,
  },
  {
    field: "length",
    headerName: "Duration",
    width: 150,
  },
  {
    field: "price",
    headerName: "Price",
    width: 150,
  },
];
