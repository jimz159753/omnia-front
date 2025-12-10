"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, Category, SubCategory, Provider } from "@/generated/prisma";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import i18next from "@/i18n";
import Image from "next/image";

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
      accessorKey: "image",
      header: translateProducts("image"),
      cell: ({ row }: CellInfo) => {
        const src = row.getValue("image") as string;
        return (
          <div className="flex items-center justify-center">
            {src ? (
              <Image
                src={src}
                alt={row.original.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
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
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onUpdate(item)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity hover:bg-brand-500/10 rounded-md p-2"
            >
              <FiEdit className="w-4 h-4 cursor-pointer" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity text-red-500 hover:bg-red-500/10 rounded-md p-2"
            >
              <FiTrash2 className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
        );
      },
    },
  ];
};
