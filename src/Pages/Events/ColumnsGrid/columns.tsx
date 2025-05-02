import { formatCurrency } from "@/utils";
import { Typography } from "@mui/material";
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
    width: 250,
  },
  {
    field: "title",
    headerName: "Title",
    width: 250,
  },
  {
    field: "description",
    headerName: "Description",
    width: 250,
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
    renderCell: (params) => {
      return <Typography>{formatCurrency(Number(params.row.price))}</Typography>;
    },
  },
];
