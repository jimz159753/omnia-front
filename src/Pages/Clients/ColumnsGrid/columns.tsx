import { GridColDef } from "@mui/x-data-grid";

export interface IRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  staff: string;
  payment_method: string;
}

export const columns: GridColDef<IRow>[] = [
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 150,
  },
  {
    field: "email",
    headerName: "Email",
    width: 150,
  },
  {
    field: "staff",
    headerName: "Staff",
    width: 60,
  },
  {
    field: "paymentMethod",
    headerName: "Payment Method",
    width: 150,
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 150,
  },
];
