import { GridColDef } from "@mui/x-data-grid";

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
    field: "url",
    headerName: "URL",
    width: 150,
  },
  {
    field: "date",
    headerName: "Date",
    width: 150,
  },
  {
    field: "price",
    headerName: "Price",
    width: 150,
  },
];
