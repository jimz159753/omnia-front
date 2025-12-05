"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useTickets } from "@/hooks/useTickets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DownloadIcon,
  HandCoinsIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";

import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";

const Sales = () => {
  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
  } = useTickets();

  const exportToCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Date",
      "Client",
      "Product",
      "Service",
      "Amount",
      "Status",
    ];

    // Convert data to CSV rows
    const rows = data.map((ticket) => [
      new Date(ticket.createdAt).toLocaleDateString("es-MX"),
      ticket.client.name,
      ticket.product.name,
      ticket.service.name,
      ticket.amount.toFixed(2),
      ticket.status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tickets_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const squareCards = [
    {
      title: "Tickets this week",
      value: "28",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },
    {
      title: "Scheduled services",
      value: "14",
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      title: "Active clients",
      value: "42",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      title: "Resolved tickets",
      value: "18",
      icon: <HandCoinsIcon className="w-4 h-4" />,
    },
  ];

  const columns = getColumns();

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <CustomLoadingSpinner size={48} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-4xl font-normal">Sales</CardTitle>
              <CardDescription className="font-normal">
                Track and review your support tickets
              </CardDescription>
            </div>
            <button
              onClick={exportToCSV}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Export to CSV
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {squareCards.map((card) => (
              <Card className="bg-brand-500/10" key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DataTable
            columns={columns}
            data={data}
            searchKey="client"
            searchPlaceholder="Search by client..."
            searchValue={searchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default Sales;
