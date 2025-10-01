import { DataGrid, GridValidRowModel, GridColDef } from "@mui/x-data-grid";

interface IGeneticDataGridProps<T extends GridValidRowModel> {
  data: T[];
  columns: GridColDef<T>[];
  sx?: object;
  loading: boolean;
}

const GeneticDataGrid = <T extends GridValidRowModel>({
  data,
  columns,
  sx,
  loading,
}: IGeneticDataGridProps<T>) => {
  return (
    <DataGrid
      loading={loading}
      sx={sx}
      rows={data}
      columns={columns}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
    />
  );
};

export default GeneticDataGrid;
