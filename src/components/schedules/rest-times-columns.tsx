"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export interface RestTime {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface RestTimesColumnsProps {
  t: (key: string) => string;
  onEdit: (restTime: RestTime) => void;
  onDelete: (id: string) => void;
}

// Helper function to convert 24-hour time to 12-hour format
const formatTo12Hour = (time: string): string => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

export const getRestTimesColumns = ({
  t,
  onEdit,
  onDelete,
}: RestTimesColumnsProps): ColumnDef<RestTime>[] => [
  {
    accessorKey: "dayOfWeek",
    header: t("day"),
    cell: ({ row }) => {
      const day = row.getValue("dayOfWeek") as string;
      return (
        <span className="font-medium capitalize">
          {t(`day${day.charAt(0).toUpperCase() + day.slice(1)}`)}
        </span>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: t("startTime"),
    cell: ({ row }) => {
      const time = row.getValue("startTime") as string;
      return <span className="text-gray-600">{formatTo12Hour(time)}</span>;
    },
  },
  {
    accessorKey: "endTime",
    header: t("endTime"),
    cell: ({ row }) => {
      const time = row.getValue("endTime") as string;
      return <span className="text-gray-600">{formatTo12Hour(time)}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }) => {
      const restTime = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(restTime)}
            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title={t("edit")}
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(restTime.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title={t("delete")}
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];

