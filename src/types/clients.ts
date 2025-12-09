"use client";

// Minimal column typing to keep DataTable interoperability
export type ColumnDef<T> = {
  accessorKey?: string;
  header?: string;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

export interface TicketRow {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product?: { name: string };
  service?: { name: string };
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  createdAt: string;
  tickets: TicketRow[];
}

export type ActiveTab = "all" | "products" | "appointments" | "notes";
export type ClientFilter = "all" | "recent" | "inactive";

