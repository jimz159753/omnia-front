"use client";

// Minimal column typing to keep DataTable interoperability
export type ColumnDef<T> = {
  accessorKey?: string;
  header?: string;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

export interface TicketRow {
  id: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
  notes?: string;
  items?: Array<{
    quantity: number;
    unitPrice: number;
    total: number;
    product?: { name: string };
    service?: { name: string };
  }>;
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

