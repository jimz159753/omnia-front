"use client";

import React, { useState, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientsPage, type TicketRow } from "@/hooks/useClientsPage";
import SelectedClient from "./selected-client";
import { GenericTabs } from "@/components/ui/genericTabs";
import ClientSidebar from "./controllers";
import TicketDetailsDialog from "@/components/dialogs/TicketDetailsDialog";
import { SaleFormDialog } from "@/components/dialogs/SaleFormDialog";
import { AppointmentFormDialog } from "@/components/dialogs/AppointmentFormDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { FiUser, FiShoppingBag, FiCalendar, FiFileText, FiAlertTriangle } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Clients = () => {
  const { t } = useTranslation("clients");
  const { t: tSales } = useTranslation("sales");
  const { t: tCommon } = useTranslation("common");

  // State for ticket edit/delete
  const [ticketToEdit, setTicketToEdit] = useState<TicketRow | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<TicketRow | null>(null);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Callbacks for ticket actions
  const handleEditTicket = useCallback((ticket: TicketRow) => {
    setTicketToEdit(ticket);
    // Check if it's an appointment (has startTime)
    if (ticket.startTime) {
      setAppointmentDialogOpen(true);
    } else {
      setSaleDialogOpen(true);
    }
  }, []);

  const handleDeleteTicket = useCallback((ticket: TicketRow) => {
    setTicketToDelete(ticket);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientsHook = useClientsPage({
    onEditTicket: handleEditTicket,
    onDeleteTicket: handleDeleteTicket,
  }) as any;

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
      ticketPagination,
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
      handleTicketPageChange,
    },
  } = clientsHook;

  // Close edit dialogs
  const handleEditDialogClose = () => {
    setSaleDialogOpen(false);
    setAppointmentDialogOpen(false);
    setTicketToEdit(null);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    handleEditDialogClose();
    fetchClients();
  };

  // Confirm delete ticket
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tickets?id=${ticketToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ticket");
      toast.success(tSales("ticketDeletedSuccess"));
      setTicketToDelete(null);
      fetchClients();
    } catch (error) {
      toast.error(tSales("ticketDeletedError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { label: t("all") || "All", value: "all", icon: <FiShoppingBag className="w-4 h-4" /> },
    { label: t("products") || "Products", value: "products", icon: <FiShoppingBag className="w-4 h-4" /> },
    { label: t("appointments") || "Appointments", value: "appointments", icon: <FiCalendar className="w-4 h-4" /> },
    { label: t("notes") || "Notes", value: "notes", icon: <FiFileText className="w-4 h-4" /> },
  ];

  const tabCounts = React.useMemo(() => {
    const tickets = selectedClient?.tickets ?? [];
    return {
      all: tickets.length,
      products: tickets.filter((t: TicketRow) =>
        (t.items || []).some((i) => i.product?.name)
      ).length,
      appointments: tickets.filter((t: TicketRow) =>
        (t.items || []).some((i) => i.service?.name)
      ).length,
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
    pagination?: unknown;
    onPageChange?: (page: number) => void;
  }>;
  const DataTableWithSub = DataTable as unknown as DataTableWithSubComponent;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r bg-gray-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-2 pt-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="flex flex-col flex-1 p-6 space-y-6 bg-gray-50/30">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
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
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
            {/* Selected Client Card */}
            <SelectedClient client={selectedClient} onEdit={openEditClient} />
            
            {/* Tabs & Table */}
            {selectedClient && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Tabs Header */}
                  <div className="px-4 pt-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      {tabs.map((tab) => {
                        const count = tabCounts[tab.value as keyof typeof tabCounts] ?? 0;
                        const isActive = activeTab === tab.value;
                        return (
                          <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                              isActive
                                ? "text-omnia-blue border-omnia-blue"
                                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {tab.label}
                            {count > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isActive
                                  ? "bg-omnia-blue/10 text-omnia-blue"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Table */}
                  <div className="p-4">
                    {filteredTickets.length > 0 ? (
                      <DataTableWithSub
                        columns={ticketColumns as unknown}
                        data={filteredTickets}
                        searchKey="status"
                        onRowClick={(row) => setSelectedTicket(row as TicketRow)}
                        pagination={ticketPagination}
                        onPageChange={handleTicketPageChange}
                      />
                    ) : (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <FiShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">{t("noTickets") || "No tickets found"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
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

      {/* Delete Ticket Confirmation Dialog */}
      <Dialog open={!!ticketToDelete} onOpenChange={(open) => !open && setTicketToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle>{tSales("confirmDelete")}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {tSales("confirmDeleteMessage")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setTicketToDelete(null)}
              disabled={isDeleting}
            >
              {tSales("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTicket}
              disabled={isDeleting}
            >
              {isDeleting ? tSales("deleting") : tSales("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Edit Dialog */}
      <SaleFormDialog
        open={saleDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleEditDialogClose();
        }}
        onSuccess={handleEditSuccess}
        editTicket={ticketToEdit ? {
          id: ticketToEdit.id,
          clientId: selectedClient?.id,
          staffId: ticketToEdit.staffId || undefined,
          status: ticketToEdit.status || undefined,
          notes: ticketToEdit.notes || undefined,
          items: ticketToEdit.items?.map(item => ({
            id: item.id,
            productId: item.product?.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          client: selectedClient ? {
            id: selectedClient.id,
            name: selectedClient.name,
            email: selectedClient.email || "",
            phone: selectedClient.phone || undefined,
          } : undefined,
        } : null}
      />

      {/* Appointment Edit Dialog */}
      <AppointmentFormDialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleEditDialogClose();
        }}
        onSuccess={handleEditSuccess}
        initialSlot={ticketToEdit?.startTime ? {
          start: new Date(ticketToEdit.startTime),
          end: ticketToEdit.endTime ? new Date(ticketToEdit.endTime) : new Date(new Date(ticketToEdit.startTime).getTime() + 60 * 60000),
          resourceId: ticketToEdit.staffId || undefined,
        } : null}
        initialData={ticketToEdit ? {
          ticketId: ticketToEdit.id,
          clientId: selectedClient?.id,
          serviceId: ticketToEdit.items?.[0]?.service?.id,
          notes: ticketToEdit.notes || undefined,
        } : null}
      />
    </>
  );
};

export default Clients;
