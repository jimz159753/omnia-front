"use client";

import type { Client } from "@/hooks/useClientsPage";

type Props = {
  client?: Client | null;
  onEdit?: () => void;
};

const SelectedClient: React.FC<Props> = ({ client, onEdit }) => {
  if (!client) {
    return <p className="text-sm text-gray-500">No client selected.</p>;
  }

  return (
    <div className="bg-white space-y-2">
      <h3 className="text-xl font-semibold">{client.name}</h3>
      <div className="flex justify-end">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Edit Client
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
        <p>
          <strong>Email:</strong> {client.email}
        </p>
        <p>
          <strong>Phone:</strong> {client.phone}
        </p>
        <p>
          <strong>Instagram:</strong> {client.instagram || "-"}
        </p>
        <p>
          <strong>Address:</strong> {client.address || "-"}
        </p>
        <p>
          <strong>Tickets:</strong> {client.tickets?.length ?? 0}
        </p>
      </div>
    </div>
  );
};

export default SelectedClient;
