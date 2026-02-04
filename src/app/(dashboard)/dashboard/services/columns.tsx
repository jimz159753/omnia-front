"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Service, Category, SubCategory, Provider } from "@/generated/prisma";

import { FiEdit, FiTrash2, FiClock, FiTag } from "react-icons/fi";
import i18next from "@/i18n";
import Image from "next/image";

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString("es-MX", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
};

// Extended type to include the category, subcategory, and provider relations
export type ServiceWithRelations = Service & {
  category: Category & {
    subCategory: SubCategory | null;
  };
  subCategory: SubCategory;
  provider?: Provider | null;
};

type CellInfo = {
  row: {
    getValue: (key: string) => unknown;
    original: ServiceWithRelations;
  };
};

interface GetColumnsParams {
  onUpdate: (item: ServiceWithRelations) => void;
  onDelete: (item: ServiceWithRelations) => void;
  tCommon?: (key: string) => string;
  tServices?: (key: string) => string;
}

export const getColumns = ({
  onUpdate,
  onDelete,
  tCommon,
  tServices,
}: GetColumnsParams): ColumnDef<ServiceWithRelations>[] => {
  const translateCommon =
    tCommon ?? ((key: string) => i18next.t(`common:${key}`));
  const translateServices =
    tServices ?? ((key: string) => i18next.t(`services:${key}`));

  return [
    {
      accessorKey: "service",
      header: translateServices("service") || "Service",
      cell: ({ row }: CellInfo) => {
        const src = row.original.image as string;
        const name = row.original.name;
        const category = row.original.category?.name;
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
              {category && (
                <p className="text-sm text-gray-500">{category}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: translateCommon("description"),
      cell: ({ row }: CellInfo) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[250px]">
            <p className="text-gray-600 truncate" title={description}>
              {description || "-"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "subCategory.name",
      header: translateServices("subcategory"),
      cell: ({ row }: CellInfo) => {
        const subCategory = row.original.subCategory?.name;
        return subCategory ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
            <FiTag className="w-3 h-3" />
            {subCategory}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "duration",
      header: translateServices("duration"),
      cell: ({ row }: CellInfo) => {
        const duration = row.getValue("duration") as number;
        return (
          <div className="flex items-center gap-2 text-gray-700">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{duration} min</span>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: translateServices("price"),
      cell: ({ row }: CellInfo) => {
        const price = parseFloat(row.getValue("price") as string);
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(price);
        return (
          <span className="font-semibold text-gray-900">{formatted}</span>
        );
      },
    },
    {
      accessorKey: "commission",
      header: translateServices("commission"),
      cell: ({ row }: CellInfo) => {
        const commission = parseFloat(row.getValue("commission") as string);
        const formatted = new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(commission);
        return (
          <span className="text-gray-500">{formatted}</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: translateCommon("date"),
      cell: ({ row }: CellInfo) => {
        const { dateStr, timeStr } = formatDateTime(
          row.getValue("createdAt") as string
        );
        return (
          <div className="text-sm">
            <p className="text-gray-900">{dateStr}</p>
            <p className="text-gray-500">{timeStr}</p>
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
