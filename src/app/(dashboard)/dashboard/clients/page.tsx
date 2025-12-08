"use client";

import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { useClientsPage, type Client } from "@/hooks/useClientsPage";

const Clients = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientsHook = useClientsPage() as any;

  const {
    state: {
      clients,
      filteredClients,
      selectedClientId,
      selectedClient,
      filteredTickets,
      loading,
      searchTerm,
      isClientDialogOpen,
      editingClient,
      activeTab,
      ticketColumns,
    },
    actions: {
      setSearchTerm,
      setSelectedClientId,
      fetchClients,
      openAddClient,
      openEditClient,
      handleDialogChange,
      setActiveTab,
    },
  } = clientsHook;

  type DataTableWithSubComponent = React.ComponentType<{
    columns: unknown;
    data: unknown[];
    searchKey?: string;
  }>;
  const DataTableWithSub = DataTable as unknown as DataTableWithSubComponent;

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
                  onClick={openAddClient}
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
                {filteredClients.map((client: Client) => (
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
                    onClick={openEditClient}
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
        onOpenChange={handleDialogChange}
        onSuccess={fetchClients}
        client={editingClient}
      />
    </>
  );
};

export default Clients;
