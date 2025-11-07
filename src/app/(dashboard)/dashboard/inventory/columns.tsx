"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Inventory, Category } from "@/generated/prisma";

// Extended type to include the category relation
export type InventoryWithCategory = Inventory & {
  category: Category;
};

export const columns: ColumnDef<InventoryWithCategory>[] = [
  {
    accessorKey: "code",
    header: "Code",
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
    accessorKey: "providerCost",
    header: "Provider Cost",
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue("providerCost"));
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
];

