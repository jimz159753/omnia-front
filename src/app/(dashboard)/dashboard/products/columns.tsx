"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, Category, SubCategory, Provider } from "@/generated/prisma";
import { FiEdit, FiTrash2, FiAlertCircle, FiTag } from "react-icons/fi";
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
      accessorKey: "product",
      header: translateProducts("product") || "Product",
      cell: ({ row }: CellInfo) => {
        const src = row.original.image as string;
        const name = row.original.name;
        const sku = row.original.sku;
        return (
          <div className="flex items-center gap-3">
            {src ? (
              <Image
                key={src}
                src={src}
                alt={name}
                width={44}
                height={44}
                unoptimized
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{name}</p>
              <p className="text-sm text-gray-500 font-mono">{sku}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category.name",
      header: translateProducts("category"),
      cell: ({ row }: CellInfo) => {
        const category = row.original.category?.name;
        const subCategory = row.original.subCategory?.name;
        return (
          <div>
            {category ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
                <FiTag className="w-3 h-3" />
                {category}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
            {subCategory && (
              <p className="text-xs text-gray-500 mt-1">{subCategory}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "provider.name",
      header: translateProducts("provider") || "Provider",
      cell: ({ row }: CellInfo) => {
        const provider = row.original.provider?.name;
        return provider ? (
          <span className="text-gray-700">{provider}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "stock",
      header: translateCommon("stock"),
      cell: ({ row }: CellInfo) => {
        const stock = row.getValue("stock") as number;
        const minStock = row.original.minStock || 10;
        const isLow = stock <= minStock;
        const isCritical = stock <= Math.floor(minStock / 2);
        
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                isCritical
                  ? "text-red-600"
                  : isLow
                  ? "text-amber-600"
                  : "text-gray-900"
              }`}
            >
              {stock}
            </span>
            {isLow && (
              <FiAlertCircle
                className={`w-4 h-4 ${isCritical ? "text-red-500" : "text-amber-500"}`}
                title={`Low stock (min: ${minStock})`}
              />
            )}
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
        return <span className="text-gray-500">{formatted}</span>;
      },
    },
    {
      accessorKey: "price",
      header: translateCommon("price"),
      cell: ({ row }: CellInfo) => {
        const price = parseFloat(row.getValue("price") as string);
        const cost = parseFloat(row.original.cost as unknown as string);
        const margin = price > 0 ? ((price - cost) / price * 100).toFixed(0) : 0;
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(price);
        return (
          <div>
            <span className="font-semibold text-gray-900">{formatted}</span>
            <p className="text-xs text-gray-500">{margin}% margin</p>
          </div>
        );
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
          <div className="flex justify-center gap-1">
            <button
              onClick={() => onUpdate(item)}
              className="p-2 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title="Edit"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
};
