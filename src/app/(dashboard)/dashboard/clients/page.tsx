"use client";

import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
type ColumnDef<T> = {
  accessorKey?: string;
  header?: string;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  createdAt: string;
  tickets: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    product: { name: string };
    service: { name: string };
  }>;
}

interface TicketRow {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product?: { name: string };
  service?: { name: string };
  notes?: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "products" | "appointments" | "notes"
  >("all");
  type DataTableWithSubComponent = React.ComponentType<{
    columns: unknown;
    data: unknown[];
    searchKey?: string;
  }>;
  const DataTableWithSub = DataTable as unknown as DataTableWithSubComponent;

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = !term
      ? clients
      : clients.filter((client) => {
          const haystack = [
            client.name,
            client.email,
            client.phone,
            client.instagram,
            client.address,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(term);
        });
    setFilteredClients(filtered);
    if (filtered.length > 0) {
      if (
        !selectedClientId ||
        !filtered.some((c) => c.id === selectedClientId)
      ) {
        setSelectedClientId(filtered[0].id);
      }
    } else {
      setSelectedClientId(null);
    }
  }, [clients, searchTerm, selectedClientId]);

  const selectedClient = useMemo(
    () => filteredClients.find((c) => c.id === selectedClientId) || null,
    [filteredClients, selectedClientId]
  );

  const ticketColumns: ColumnDef<TicketRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Ticket #",
        cell: ({ row }: { row: { original: TicketRow } }) => row.original.id,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: { row: { original: TicketRow } }) =>
          new Date(row.original.createdAt).toLocaleDateString("es-MX"),
      },
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }: { row: { original: TicketRow } }) =>
          row.original.product?.name || "-",
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }: { row: { original: TicketRow } }) =>
          row.original.service?.name || "-",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }: { row: { original: TicketRow } }) =>
          new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(row.original.amount),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: TicketRow } }) => {
          const status = row.original.status;
          const badgeClass =
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800";
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }: { row: { original: TicketRow } }) =>
          row.original.notes || "-",
      },
    ],
    []
  );

  const filteredTickets = useMemo(() => {
    if (!selectedClient) return [];
    const tickets = selectedClient.tickets as TicketRow[];
    if (activeTab === "all") return tickets;
    if (activeTab === "products") {
      return tickets.filter((t) => !!t.product?.name);
    }
    if (activeTab === "appointments") {
      return tickets.filter((t) => !!t.service?.name);
    }
    return tickets.filter((t) => (t.notes || "").trim().length > 0);
  }, [selectedClient, activeTab]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CustomLoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-row gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsClientDialogOpen(true)}
                  className="w-full px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  Add Client
                </button>
              </div>
              <div className="space-y-2">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, instagram, address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-sm text-gray-500">
                  Showing {filteredClients.length} of {clients.length} clients
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`text-left px-3 py-2 rounded-md border transition-colors ${
                      client.id === selectedClientId
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-sm text-gray-600">{client.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {selectedClient ? (
              <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm space-y-2">
                <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingClient(selectedClient);
                      setIsClientDialogOpen(true);
                    }}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    Edit Client
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>
                    <strong>Email:</strong> {selectedClient.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedClient.phone}
                  </p>
                  <p>
                    <strong>Instagram:</strong>{" "}
                    {selectedClient.instagram || "-"}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedClient.address || "-"}
                  </p>
                  <p>
                    <strong>Tickets:</strong> {selectedClient.tickets.length}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No client selected.</p>
            )}
            <div className="flex items-center gap-2">
              {(["all", "products", "appointments", "notes"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${
                      activeTab === tab
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {tab === "all"
                      ? "All"
                      : tab === "products"
                      ? "Products"
                      : tab === "appointments"
                      ? "Appointments"
                      : "Notes"}
                  </button>
                )
              )}
            </div>
            <DataTableWithSub
              columns={ticketColumns as unknown}
              data={filteredTickets}
              searchKey="status"
            />
          </div>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={isClientDialogOpen}
        onOpenChange={(open) => {
          setIsClientDialogOpen(open);
          if (!open) setEditingClient(null);
        }}
        onSuccess={fetchClients}
        client={editingClient}
      />
    </>
  );
};

export default Clients;
