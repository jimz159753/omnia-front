import { Icon } from '@iconify/react/dist/iconify.js';
import { DataGridPro, GridValidRowModel, GridColDef } from '@mui/x-data-grid-pro';


interface IGeneticDataGridProps<T> {
  data: T[];
  columns: GridColDef<GridValidRowModel>[];
  sx?: object;
  getDetailPanelContent?: (params: any ) => React.ReactNode;
  onDetailPanelExpandedRowIdsChange?: () => void;
  loading: boolean;
}

const GeneticDataGrid = <T,>({ data, columns, sx, getDetailPanelContent, onDetailPanelExpandedRowIdsChange, loading }: IGeneticDataGridProps<T>) => {
  return (
    <DataGridPro
      loading={loading}
      sx={sx}
      rows={data as GridValidRowModel[]}
      columns={columns}
      pageSizeOptions={[5]}
      getDetailPanelContent={getDetailPanelContent}
      slots={{
        detailPanelExpandIcon: () => <Icon icon='mynaui:chevron-up' />,
        detailPanelCollapseIcon: () =><Icon icon='mynaui:chevron-down' />
      }}
      onDetailPanelExpandedRowIdsChange={onDetailPanelExpandedRowIdsChange}
      disableRowSelectionOnClick
    />
  );
};

export default GeneticDataGrid;
