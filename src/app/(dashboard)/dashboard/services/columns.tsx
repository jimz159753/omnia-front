"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Service, Category, SubCategory } from "@/generated/prisma";

import { FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";
import i18next from "@/i18n";
import Image from "next/image";

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
export type ServiceWithRelations = Service & {
  category: Category & {
    subCategory: SubCategory | null;
  };
  subCategory: SubCategory;
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
      accessorKey: "image",
      header: translateServices("image"),
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
                unoptimized
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
      header: translateServices("category"),
      cell: ({ row }: CellInfo) => {
        return row.original.category?.name || "N/A";
      },
    },
    {
      accessorKey: "subCategory.name",
      header: translateServices("subcategory"),
      cell: ({ row }: CellInfo) => {
        return row.original.subCategory?.name || "N/A";
      },
    },
    {
      accessorKey: "duration",
      header: `${translateServices("duration")} (min)`,
      cell: ({ row }: CellInfo) => {
        const duration = row.getValue("duration") as number;
        return <div className="font-medium">{duration} min</div>;
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
        return <div className="font-medium">{formatted}</div>;
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
        return <div className="text-muted-foreground">{formatted}</div>;
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
      accessorKey: "actions",
      header: () => (
        <div className="text-center">{translateCommon("actions")}</div>
      ),
      cell: ({ row }: CellInfo) => {
        const item = row.original;

        return (
          <div className="flex justify-center">
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
