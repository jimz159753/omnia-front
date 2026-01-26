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
  staffId?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  items?: Array<{
    id?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product?: { id?: string; name: string };
    service?: { id?: string; name: string };
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

