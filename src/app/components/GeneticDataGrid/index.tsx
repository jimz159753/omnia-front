import { IBooking } from "@/constants";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  DataGridPro,
  GridValidRowModel,
  GridColDef,
  GridRowId,
  GridCallbackDetails,
} from "@mui/x-data-grid-pro";

interface IGeneticDataGridProps<T> {
  data: T[];
  columns: GridColDef<GridValidRowModel>[];
  sx?: object;
  getDetailPanelContent?: (params: {
    row: IBooking;
    id: GridRowId;
    column?: GridColDef;
  }) => React.ReactNode;
  onDetailPanelExpandedRowIdsChange?: (
    ids: Set<GridRowId>,
    details: GridCallbackDetails
  ) => void;
  loading: boolean;
  detailPanelExpandedRowIds?: Set<GridRowId>;
}

const GeneticDataGrid = <T,>({
  data,
  columns,
  sx,
  getDetailPanelContent,
  onDetailPanelExpandedRowIdsChange,
  loading,
  detailPanelExpandedRowIds,
}: IGeneticDataGridProps<T>) => {
  return (
    <DataGridPro
      loading={loading}
      sx={sx}
      rows={data as IBooking[]}
      columns={columns as GridColDef<IBooking>[]}
      pageSizeOptions={[5]}
      getDetailPanelContent={getDetailPanelContent}
      slots={{
        detailPanelExpandIcon: () => <Icon icon="mynaui:chevron-up" />,
        detailPanelCollapseIcon: () => <Icon icon="mynaui:chevron-down" />,
      }}
      detailPanelExpandedRowIds={detailPanelExpandedRowIds}
      onDetailPanelExpandedRowIdsChange={onDetailPanelExpandedRowIdsChange}
      disableRowSelectionOnClick
    />
  );
};

export default GeneticDataGrid;
