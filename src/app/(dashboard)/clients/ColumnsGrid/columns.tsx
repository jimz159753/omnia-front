import { Variant, IPayment } from "@/constants";
import { Button } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

export interface IRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  amount: string;
  payments: IPayment[];
}

export const columns = (callback: (id: number) => void): GridColDef<IRow>[] => [
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
    field: "payments",
    headerName: "Payments",
    width: 150,
    renderCell: (params) => (
      <div>{params.row.payments[params.row.payments.length - 1].amount}</div>
    ),
  },
  {
    field: "checkin",
    headerName: "Checkin",
    width: 150,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    renderCell: (params) => {
      return (
        <Button
          onClick={() => callback(params.row.id)}
          variant={Variant.outlined}
        >
          Checkin
        </Button>
      );
    },
  },
];
