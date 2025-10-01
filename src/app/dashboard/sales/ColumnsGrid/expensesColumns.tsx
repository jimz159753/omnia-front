import { GridColDef } from "@mui/x-data-grid";
import { IExpenses } from "@/constants";

export const expensesColumns = (): GridColDef<IExpenses>[] => [
  {
    field: "date",
    headerName: "Fecha",
  },
  {
    field: "description",
    headerName: "Descripción",
  },
  {
    field: "unit",
    headerName: "Unidad",
  },
  {
    field: "total",
    headerName: "Total",
  },
  {
    field: "status",
    headerName: "Estatus",
  },
  {
    field: "payment_account",
    headerName: "Cuenta de pago",
  },
  {
    field: "account",
    headerName: "Cuenta",
  },
  {
    field: "type",
    headerName: "Tipo",
  },
  {
    field: "provider",
    headerName: "Proveedor",
  },
  {
    field: "provider_payment",
    headerName: "Pago proveedor",
  },
  {
    field: "provider_status",
    headerName: "Estatus proveedor",
  },
  {
    field: "service",
    headerName: "Servicio",
  },
];
