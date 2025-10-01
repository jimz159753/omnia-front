import { GridColDef } from "@mui/x-data-grid";
import { ISales } from "@/constants";

export const salesColumns = (): GridColDef<ISales>[] => [
  {
    field: "date",
    headerName: "Fecha",
  },
  {
    field: "client",
    headerName: "Cliente",
  },
  {
    field: "product_id",
    headerName: "ID del producto",
  },
  {
    field: "product_description",
    headerName: "Descripción del producto",
  },
  {
    field: "unit",
    headerName: "Unidad",
  },
  {
    field: "unit_price",
    headerName: "Precio unitario",
  },
  {
    field: "total_price",
    headerName: "Precio total",
  },
  {
    field: "status",
    headerName: "Estatus",
  },
  {
    field: "pending_payment",
    headerName: "Pago pendiente",
  },
  {
    field: "account",
    headerName: "Cuenta",
  },
  {
    field: "seller",
    headerName: "Vendedor",
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
    field: "omnia_income",
    headerName: "Ingreso Omnia",
  },
  {
    field: "comment",
    headerName: "Comentario",
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
