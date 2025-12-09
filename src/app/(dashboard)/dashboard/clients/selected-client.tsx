"use client";

import type { Client } from "@/hooks/useClientsPage";
import { FiEdit2 } from "react-icons/fi";

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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{client.name}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FiEdit2 className="w-4 h-4" />
          <p className="font-semibold">Edit Client</p>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Email:</span> {client.email}
        </p>
        <p>
          <span className="font-semibold">Mobile:</span> {client.phone}
        </p>
        <p>
          <span className="font-semibold">Instagram:</span>{" "}
          {client.instagram || "-"}
        </p>
        <p>
          <span className="font-semibold">Address:</span>{" "}
          {client.address || "-"}
        </p>
        <p>
          <span className="font-semibold">Tickets:</span>{" "}
          {client.tickets?.length ?? 0}
        </p>
      </div>
    </div>
  );
};

export default SelectedClient;
