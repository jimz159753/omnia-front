"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { useClientsPage, type TicketRow } from "@/hooks/useClientsPage";
import SelectedClient from "./selected-client";
import { GenericTabs } from "@/components/ui/genericTabs";
import ClientSidebar from "./controllers";
import TicketDetailsDialog from "@/components/dialogs/TicketDetailsDialog";

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
      filter,
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
      setFilter,
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

  const [selectedTicket, setSelectedTicket] = React.useState<TicketRow | null>(
    null
  );

  type DataTableWithSubComponent = React.ComponentType<{
    columns: unknown;
    data: unknown[];
    searchKey?: string;
    onRowClick?: (row: unknown) => void;
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
        <ClientSidebar
          clients={clients}
          filteredClients={filteredClients}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          onAddClient={openAddClient}
        />
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
            onRowClick={(row) => setSelectedTicket(row as TicketRow)}
          />
        </div>
      </div>
      <TicketDetailsDialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        ticket={
          selectedTicket
            ? {
                ...selectedTicket,
                client: selectedClient
                  ? {
                      name: selectedClient.name,
                      email: selectedClient.email,
                      phone: selectedClient.phone,
                    }
                  : undefined,
              }
            : undefined
        }
      />
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
