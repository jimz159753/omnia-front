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

export const getColumns = ({
  onUpdate,
  onDelete,
}: GetColumnsParams): ColumnDef<ServiceWithRelations>[] => [
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
    accessorKey: "subCategory.name",
    header: "Subcategory",
    cell: ({ row }) => {
      return row.original.subCategory?.name || "N/A";
    },
  },
  {
    accessorKey: "duration",
    header: "Duration (min)",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return <div className="font-medium">{duration} min</div>;
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
    accessorKey: "commission",
    header: "Commission",
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
    header: "Created At",
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
    header: () => <div className="text-center">Actions</div>,
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
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

