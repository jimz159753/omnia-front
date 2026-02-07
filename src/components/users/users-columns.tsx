"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersColumnsProps {
  t: (key: string) => string;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

type CellContext = {
  row: {
    getValue: (key: string) => unknown;
    original: User;
  };
};

export const getUsersColumns = ({
  t,
  onEdit,
  onDelete,
}: UsersColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "avatar",
    header: t("avatar"),
    cell: ({ row }: CellContext) => {
      const avatar = row.getValue("avatar") as string | null;
      const name = row.original.name;
      return avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium">
          {name.charAt(0).toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }: CellContext) => {
      return (
        <span className="font-medium">{row.getValue("name") as string}</span>
      );
    },
  },
  {
    accessorKey: "email",
    header: t("email"),
    cell: ({ row }: CellContext) => {
      return (
        <span className="text-gray-600">{row.getValue("email") as string}</span>
      );
    },
  },
  {
    accessorKey: "role",
    header: t("role"),
    cell: ({ row }: CellContext) => {
      const role = row.getValue("role") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            role === "admin"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {t(`role${role.charAt(0).toUpperCase() + role.slice(1)}`)}
        </span>
      );
    },
  },
  {
    accessorKey: "position",
    header: t("userPosition"),
    cell: ({ row }: CellContext) => {
      const position = row.getValue("position") as string;
      return (
        <span className="text-gray-600">
          {position || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: t("status"),
    cell: ({ row }: CellContext) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? t("active") : t("inactive")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: t("joinedAt"),
    cell: ({ row }: CellContext) => {
      const createdAt = row.getValue("createdAt") as string;
      const date = new Date(createdAt);
      return (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-brand-500" />
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-gray-400 text-xs">
              {date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">{t("actions")}</div>,
    cell: ({ row }: CellContext) => {
      const user = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
            title={t("edit")}
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {user.role !== "admin" && (
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title={t("delete")}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    },
  },
];
