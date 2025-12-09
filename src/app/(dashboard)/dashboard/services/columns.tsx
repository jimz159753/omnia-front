"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Service, Category, SubCategory } from "@/generated/prisma";
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
export type ServiceWithRelations = Service & {
  category: Category & {
    subCategory: SubCategory | null;
  };
  subCategory: SubCategory;
};

interface GetColumnsParams {
  onUpdate: (item: ServiceWithRelations) => void;
  onDelete: (item: ServiceWithRelations) => void;
}

const tCommon = (key: string) => i18next.t(`common:${key}`);
const tServices = (key: string) => i18next.t(`services:${key}`);

export const getColumns = ({
  onUpdate,
  onDelete,
}: GetColumnsParams): ColumnDef<ServiceWithRelations>[] => [
  {
    accessorKey: "image",
    header: tServices("image"),
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
    accessorKey: "name",
    header: tCommon("name"),
  },
  {
    accessorKey: "description",
    header: tCommon("description"),
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
    header: tServices("category"),
    cell: ({ row }) => {
      return row.original.category?.name || "N/A";
    },
  },
  {
    accessorKey: "subCategory.name",
    header: tServices("subcategory"),
    cell: ({ row }) => {
      return row.original.subCategory?.name || "N/A";
    },
  },
  {
    accessorKey: "duration",
    header: `${tServices("duration")} (min)`,
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return <div className="font-medium">{duration} min</div>;
    },
  },
  {
    accessorKey: "price",
    header: tServices("price"),
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
    accessorKey: "commission",
    header: tServices("commission"),
    cell: ({ row }) => {
      const commission = parseFloat(row.getValue("commission"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(commission);
      return <div className="text-muted-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: tCommon("date"),
    cell: ({ row }) => {
      const { dateStr, timeStr } = formatDateTime(row.getValue("createdAt") as string);
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
    header: () => <div className="text-center">{tCommon("actions")}</div>,
    cell: ({ row }) => {
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
                {tCommon("update")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

