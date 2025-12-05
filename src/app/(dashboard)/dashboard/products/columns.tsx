"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, Category, SubCategory } from "@/generated/prisma";
import { MoreHorizontalFill } from "akar-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2 } from "lucide-react";

// Extended type to include the category and subcategory relations
export type ProductWithCategory = Product & {
  category: Category & {
    subCategory: SubCategory | null;
  };
};

interface GetColumnsParams {
  onUpdate: (item: ProductWithCategory) => void;
  onDelete: (item: ProductWithCategory) => void;
}

export const getColumns = ({
  onUpdate,
  onDelete,
}: GetColumnsParams): ColumnDef<ProductWithCategory>[] => [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const src = row.getValue("image") as string;
      return (
        <div className="flex items-center justify-center">
          {src ? (
            <img
              src={src}
              alt={row.original.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              N/A
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      return row.original.category?.name || "N/A";
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <div
          className={`font-medium ${
            stock <= 10 ? "text-red-500" : stock <= 50 ? "text-yellow-500" : ""
          }`}
        >
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue("cost"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(cost);
      return <div className="text-muted-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString("es-MX")}</div>;
    },
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

