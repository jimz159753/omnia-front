import { DataGrid, GridValidRowModel, GridColDef } from "@mui/x-data-grid";

interface IGeneticDataGridProps<T> {
  data: T[];
  columns: GridColDef<GridValidRowModel>[];
  sx?: object;
}

const GeneticDataGrid = <T,>({ data, columns, sx }: IGeneticDataGridProps<T>) => {
  return (
    <DataGrid
      sx={sx}
      rows={data as GridValidRowModel[]}
      columns={columns}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
    />
  );
};

export default GeneticDataGrid;
