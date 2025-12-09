import React from "react";
import type { ClientFilter, Client } from "@/hooks/useClientsPage";

type Props = {
  clients: Client[];
  filteredClients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: ClientFilter;
  onFilterChange: (value: ClientFilter) => void;
  onAddClient: () => void;
};

const ClientSidebar: React.FC<Props> = ({
  clients,
  filteredClients,
  selectedClientId,
  onSelectClient,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  onAddClient,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-screen border-r border-gray-200">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onAddClient}
            className="w-full px-4 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            Add Client
          </button>
        </div>
        <div className="space-y-2">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, instagram, address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value as ClientFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Clients</option>
            <option value="recent">Recent (last 30 days)</option>
            <option value="inactive">Inactives (30+ days)</option>
          </select>
          <p className="text-sm text-gray-500">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {filteredClients.map((client: Client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
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
  );
};

export default ClientSidebar;
