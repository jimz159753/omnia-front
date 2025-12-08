"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface Ticket {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: { name: string };
  service: { name: string };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  address: string;
  createdAt: string;
  tickets: Ticket[];
}

const ExpandableRow = ({ tickets }: { tickets: Ticket[] }) => {
  if (tickets.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No tickets found for this client
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50">
      <h4 className="text-sm font-semibold mb-3">Ticket History</h4>
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString("es-MX")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Product</p>
                <p className="text-sm font-medium">{ticket.product.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="text-sm font-medium">{ticket.service.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(ticket.amount)}
                </p>
              </div>
            </div>
            <div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  ticket.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : ticket.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getColumns = (): ColumnDef<Client>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const client = row.original;

      return (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
          >
            {isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="fixed left-0 right-0 z-50 mt-2">
              <div className="max-w-6xl mx-auto">
                <ExpandableRow tickets={client.tickets} />
              </div>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="text-left font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left">Email</div>,
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-left">{email}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-left">Phone</div>,
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return <div className="text-left">{phone}</div>;
    },
  },
  {
    accessorKey: "instagram",
    header: () => <div className="text-left">Instagram</div>,
    cell: ({ row }) => {
      const instagram = row.getValue("instagram") as string;
      return <div className="text-left">{instagram}</div>;
    },
  },
  {
    accessorKey: "address",
    header: () => <div className="text-left">Address</div>,
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return <div className="text-left">{address || "N/A"}</div>;
    },
  },
  {
    accessorKey: "tickets",
    header: () => <div className="text-center">Tickets</div>,
    cell: ({ row }) => {
      const tickets = row.getValue("tickets") as Ticket[];
      return (
        <div className="text-center">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-800">
            {tickets.length}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">Joined</div>,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-center">
          {new Date(date).toLocaleDateString("es-MX")}
        </div>
      );
    },
  },
];

