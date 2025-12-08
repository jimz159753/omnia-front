"use client";
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react";
import * as RT from "@/lib/react-table";
// Local shim types to satisfy lint without upstream typings
type ColumnDef<TData = any, TValue = any> = any;
type SortingState = any;
type Cell<TData = any, TValue = any> = any;
type Header<TData = any, TValue = any> = any;
type HeaderGroup<TData = any> = any;
type Row<TData = any> = any;
const { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } =
  RT as any;

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { FiSearch } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  loading?: boolean;
  renderSubComponent?: (row: TData) => React.ReactNode;
}

export type DataTablePropsType<TData, TValue> = DataTableProps<TData, TValue>;

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  searchValue = "",
  pagination,
  onPageChange,
  onSearch,
  loading = false,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = React.useState(searchValue ?? "");
  const debouncedSearch = useDebounce(inputValue, 300);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    getRowId: (row: TData, index: number) => {
      const maybeId = (row as { id?: string }).id;
      return maybeId ?? String(index);
    },
    meta: {
      toggleRowExpanded: (rowId: string) =>
        setExpanded((prev: Record<string, boolean>) => ({
          ...prev,
          [rowId]: !prev[rowId],
        })),
      isRowExpanded: (rowId: string) => !!expanded[rowId],
    },
  });

  React.useEffect(() => {
    setInputValue(searchValue ?? "");
  }, [searchValue]);

  React.useEffect(() => {
    if (!onSearch) return;
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="space-y-4">
      {searchKey && onSearch && (
        <div className="flex items-center justify-end w-full">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder={searchPlaceholder}
              value={inputValue}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(event.target.value)
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
        </div>
      )}
      <div className="rounded-md border relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <CustomLoadingSpinner size={48} />
          </div>
        )}
        <Table>
          <TableHeader className="bg-brand-500/10">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<TData, unknown>) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<TData>) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderSubComponent && expanded[row.id] && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={columns.length}>
                        {renderSubComponent(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination ? (
            <>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{" "}
              of {pagination.total} results (Page {pagination.page} of{" "}
              {pagination.totalPages})
            </>
          ) : (
            `${data.length} row(s) total.`
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(pagination!.page - 1)}
            disabled={!pagination || pagination.page <= 1 || loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange?.(pagination!.page + 1)}
            disabled={
              !pagination || pagination.page >= pagination.totalPages || loading
            }
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Page: ${pagination?.page}, Total: ${
              pagination?.totalPages
            }, Disabled: ${
              !pagination || pagination.page >= pagination.totalPages || loading
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
