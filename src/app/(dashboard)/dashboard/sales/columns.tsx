"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Sale } from "@/generated/prisma";
import { MoreHorizontalFill } from "akar-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2 } from "lucide-react";

interface GetColumnsParams {
  onUpdate: (item: Sale) => void;
  onDelete: (item: Sale) => void;
}

export const getColumns = ({
  onUpdate,
  onDelete,
}: GetColumnsParams): ColumnDef<Sale>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div>{date.toLocaleDateString("es-MX")}</div>;
    },
  },
  {
    accessorKey: "client",
    header: "Client",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[200px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "units",
    header: "Units",
  },
  {
    accessorKey: "finalPrice",
    header: "Final Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("finalPrice"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "realIncome",
    header: "Real Income",
    cell: ({ row }) => {
      const income = parseFloat(row.getValue("realIncome"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(income);
      return <div className="font-medium text-green-600">{formatted}</div>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const isPaid = status === "Pagado";
      return (
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isPaid
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "seller",
    header: "Seller",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <MoreHorizontalFill className="w-4 h-4 cursor-pointer" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onUpdate(item)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
