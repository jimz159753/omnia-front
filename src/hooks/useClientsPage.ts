"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Client,
  type TicketRow,
  type ColumnDef,
  type ActiveTab,
  type ClientFilter,
} from "@/types/clients";
export type {
  Client,
  TicketRow,
  ColumnDef,
  ActiveTab,
  ClientFilter,
} from "@/types/clients";
import { getTicketColumns } from "@/app/(dashboard)/dashboard/clients/ticketColumns";

export interface ClientsPageState {
  clients: Client[];
  filteredClients: Client[];
  selectedClientId: string | null;
  selectedClient: Client | null;
  filteredTickets: TicketRow[];
  loading: boolean;
  searchTerm: string;
  filter: ClientFilter;
  isClientDialogOpen: boolean;
  editingClient: Client | null;
  activeTab: ActiveTab;
  ticketColumns: ColumnDef<TicketRow>[];
}

export interface ClientsPageActions {
  setSearchTerm: (value: string) => void;
  setSelectedClientId: (id: string) => void;
  fetchClients: () => Promise<void>;
  openAddClient: () => void;
  openEditClient: () => void;
  handleDialogChange: (open: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setFilter: (filter: ClientFilter) => void;
}

export type UseClientsPageReturn = {
  state: ClientsPageState;
  actions: ClientsPageActions;
};

export function useClientsPage(): UseClientsPageReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ClientFilter>("all");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();
    const filtered = clients
      .filter((client) => {
        const createdAt = new Date(client.createdAt);
        const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (filter === "recent") return diffDays <= 30;
        if (filter === "inactive") return diffDays > 30;
        return true;
      })
      .filter((client) => {
        if (!term) return true;
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
  }, [clients, searchTerm, selectedClientId, filter]);

  const selectedClient = useMemo(
    () => filteredClients.find((c) => c.id === selectedClientId) || null,
    [filteredClients, selectedClientId]
  );

  const ticketColumns: ColumnDef<TicketRow>[] = useMemo(
    () => getTicketColumns(),
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
      setLoading(true);
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

  const openAddClient = () => {
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  const openEditClient = () => {
    if (!selectedClient) return;
    setEditingClient(selectedClient);
    setIsClientDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsClientDialogOpen(open);
    if (!open) setEditingClient(null);
  };

  return {
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
  };
}
