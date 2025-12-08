"use client";

import React from "react";

type ColumnDef<T> = {
  id?: string;
  accessorKey?: string;
  header: () => React.ReactNode | null;
  cell: (context: {
    row: {
      id: string;
      original: T;
      getValue: (key: string) => unknown;
      table: { options: { meta?: Record<string, unknown> } };
    };
  }) => React.ReactNode;
};

type RowContext = {
  row: {
    id: string;
    original: Client;
    getValue: (key: string) => unknown;
    table: { options: { meta?: Record<string, unknown> } };
  };
};

interface Ticket {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product?: { name: string };
  service?: { name: string };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  createdAt: string;
  tickets: Ticket[];
}

export type ClientRow = Client;

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

export const getColumns = (): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }: RowContext) => {
      const name = row.getValue("name") as string;
      return <div className="text-left font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left">Email</div>,
    cell: ({ row }: RowContext) => {
      const email = row.getValue("email") as string;
      return <div className="text-left">{email}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-left">Phone</div>,
    cell: ({ row }: RowContext) => {
      const phone = row.getValue("phone") as string;
      return <div className="text-left">{phone}</div>;
    },
  },
  {
    accessorKey: "instagram",
    header: () => <div className="text-left">Instagram</div>,
    cell: ({ row }: RowContext) => {
      const instagram = row.getValue("instagram") as string;
      return <div className="text-left">{instagram || "-"}</div>;
    },
  },
  {
    accessorKey: "address",
    header: () => <div className="text-left">Address</div>,
    cell: ({ row }: RowContext) => {
      const address = row.getValue("address") as string;
      return <div className="text-left">{address || "-"}</div>;
    },
  },
  {
    accessorKey: "tickets",
    header: () => <div className="text-center">Tickets</div>,
    cell: ({ row }: RowContext) => {
      const tickets = row.getValue("tickets") as Ticket[];
      return (
        <div className="text-center">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-800">
            {tickets.length}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">Joined</div>,
    cell: ({ row }: RowContext) => {
      const date = row.getValue("createdAt") as string;
      const { dateStr, timeStr } = formatDateTime(date);
      return (
        <div className="text-center leading-tight">
          <div>{dateStr}</div>
          <div className="text-xs text-gray-500">{timeStr}</div>
        </div>
      );
    },
  },
];
