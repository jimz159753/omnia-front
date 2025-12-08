"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import {
  useClientsPage,
  type Client,
  type TicketRow,
} from "@/hooks/useClientsPage";
import SelectedClient from "./selected-client";
import { GenericTabs } from "@/components/ui/GenericTabs";

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

  const tabs = [
    { label: "All", value: "all" },
    { label: "Products", value: "products" },
    { label: "Appointments", value: "appointments" },
    { label: "Notes", value: "notes" },
  ];

  const tabCounts = React.useMemo(() => {
    const tickets = selectedClient?.tickets ?? [];
    return {
      all: tickets.length,
      products: tickets.filter((t: TicketRow) => !!t.product?.name).length,
      appointments: tickets.filter((t: TicketRow) => !!t.service?.name).length,
      notes: tickets.filter((t: TicketRow) => (t.notes || "").trim().length > 0)
        .length,
    };
  }, [selectedClient]);

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
      <div className="flex">
        <div className="flex flex-col gap-4 p-4 h-screen border-r border-gray-200">
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
        <div className="flex flex-col gap-4 flex-1 p-4">
          <SelectedClient client={selectedClient} onEdit={openEditClient} />
          <GenericTabs
            tabs={tabs.map((tab) => ({
              ...tab,
              value: tab.value as typeof activeTab,
              count: tabCounts[tab.value as keyof typeof tabCounts] ?? 0,
            }))}
            activeTab={activeTab}
            onChange={(value) => setActiveTab(value as typeof activeTab)}
          />
          <DataTableWithSub
            columns={ticketColumns as unknown}
            data={filteredTickets}
            searchKey="status"
          />
        </div>
      </div>
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
