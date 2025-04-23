import { DataGrid, GridValidRowModel, GridColDef } from "@mui/x-data-grid";

interface IGeneticDataGridProps<T> {
  data: T[];
  columns: GridColDef<GridValidRowModel>[];
}

const GeneticDataGrid = <T,>({ data, columns }: IGeneticDataGridProps<T>) => {
  return (
    <DataGrid
      rows={data as GridValidRowModel[]}
      columns={columns}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
    />
  );
};

export default GeneticDataGrid;
