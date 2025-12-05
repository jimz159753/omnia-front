"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { SearchIcon } from "lucide-react";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  loading?: boolean;
}

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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onSearch?.(value);
  };

  return (
    <div className="space-y-4">
      {searchKey && onSearch && (
        <div className="flex items-end justify-end w-full">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
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
