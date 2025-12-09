"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, Category, SubCategory, Provider } from "@/generated/prisma";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiEdit, FiTrash2, FiMoreHorizontal, FiCalendar } from "react-icons/fi";
import i18next from "@/i18n";

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

// Extended type to include the category and subcategory relations
export type ProductWithCategory = Product & {
  category: Category & {
    subCategory: SubCategory | null;
  };
  subCategory: SubCategory | null;
  provider: Provider | null;
};

type CellInfo = {
  row: {
    getValue: (key: string) => unknown;
    original: ProductWithCategory;
  };
};

interface GetColumnsParams {
  onUpdate: (item: ProductWithCategory) => void;
  onDelete: (item: ProductWithCategory) => void;
  tCommon?: (key: string) => string;
  tProducts?: (key: string) => string;
}

export const getColumns = ({
  onUpdate,
  onDelete,
  tCommon,
  tProducts,
}: GetColumnsParams): ColumnDef<ProductWithCategory>[] => {
  const translateCommon =
    tCommon ?? ((key: string) => i18next.t(`common:${key}`));
  const translateProducts =
    tProducts ?? ((key: string) => i18next.t(`products:${key}`));

  return [
    {
      accessorKey: "createdAt",
      header: translateProducts("createdAt"),
      cell: ({ row }: CellInfo) => {
        const { dateStr, timeStr } = formatDateTime(
          row.getValue("createdAt") as string
        );
        return (
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-brand-500" />
            <div className="leading-tight">
              <div>{dateStr}</div>
              <div className="text-xs text-gray-500">{timeStr}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "image",
      header: translateProducts("image"),
      cell: ({ row }: CellInfo) => {
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
      header: translateProducts("sku"),
    },
    {
      accessorKey: "name",
      header: translateCommon("name"),
    },
    {
      accessorKey: "description",
      header: translateCommon("description"),
      cell: ({ row }: CellInfo) => {
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
      header: translateProducts("category"),
      cell: ({ row }: CellInfo) => {
        return row.original.category?.name || "N/A";
      },
    },
    {
      accessorKey: "stock",
      header: translateCommon("stock"),
      cell: ({ row }: CellInfo) => {
        const stock = row.getValue("stock") as number;
        return (
          <div
            className={`font-medium ${
              stock <= 10
                ? "text-red-500"
                : stock <= 50
                ? "text-yellow-500"
                : ""
            }`}
          >
            {stock}
          </div>
        );
      },
    },
    {
      accessorKey: "cost",
      header: translateCommon("cost"),
      cell: ({ row }: CellInfo) => {
        const cost = parseFloat(row.getValue("cost") as string);
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(cost);
        return <div className="text-muted-foreground">{formatted}</div>;
      },
    },
    {
      accessorKey: "price",
      header: translateCommon("price"),
      cell: ({ row }: CellInfo) => {
        const price = parseFloat(row.getValue("price") as string);
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "actions",
      header: () => (
        <div className="text-center">{translateCommon("actions")}</div>
      ),
      cell: ({ row }: CellInfo) => {
        const item = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <FiMoreHorizontal className="w-4 h-4 cursor-pointer" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onUpdate(item)}
                  className="cursor-pointer"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  {translateCommon("update")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  {translateCommon("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
