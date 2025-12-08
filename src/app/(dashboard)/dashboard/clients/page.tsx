"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiUsers, FiShoppingBag } from "react-icons/fi";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, clients]);

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

  const filterClients = () => {
    let filtered = [...clients];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) =>
        client.tickets.some((ticket) => ticket.status === statusFilter)
      );
    }

    setFilteredClients(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CustomLoadingSpinner />
      </div>
    );
  }

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.tickets.length > 0).length;
  const totalTickets = clients.reduce((acc, c) => acc + c.tickets.length, 0);
  const averageTicketsPerClient =
    totalClients > 0 ? (totalTickets / totalClients).toFixed(1) : "0";

  const squareCards = [
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: <FiUsers className="w-4 h-4" />,
    },
    {
      title: "Active Clients",
      value: activeClients.toString(),
      icon: <FiShoppingBag className="w-4 h-4" />,
    },
    {
      title: "Total Tickets",
      value: totalTickets.toString(),
      icon: <FiShoppingBag className="w-4 h-4" />,
    },
    {
      title: "Avg. Tickets/Client",
      value: averageTicketsPerClient,
      icon: <FiShoppingBag className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-4xl font-normal">Clients</CardTitle>
              <CardDescription className="font-normal">
                View clients and their ticket history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {squareCards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10">
                    {card.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {card.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={getColumns()}
            data={filteredClients}
            searchKey="name"
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Clients;
