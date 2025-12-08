"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useTickets } from "@/hooks/useTickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FiDownload,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";

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
    try {
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      const headers = [
        "Date",
        "Client",
        "Product",
        "Service",
        "Amount",
        "Status",
      ];

      const rows = data.map((ticket) => {
        const dateStr = new Date(ticket.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        return [
          dateStr,
          ticket.client?.name ?? "",
          ticket.product?.name ?? "",
          ticket.service?.name ?? "",
          ticket.amount?.toFixed(2) ?? "0.00",
          ticket.status ?? "",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV", err);
      alert("Failed to export CSV");
    }
  };

  const squareCards = [
    {
      title: "Tickets this week",
      value: "28",
      icon: <FiShoppingBag className="w-4 h-4" />,
    },
    {
      title: "Scheduled services",
      value: "14",
      icon: <FiPackage className="w-4 h-4" />,
    },
    {
      title: "Active clients",
      value: "42",
      icon: <FiUser className="w-4 h-4" />,
    },
    {
      title: "Resolved tickets",
      value: "18",
      icon: <FiDollarSign className="w-4 h-4" />,
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
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-normal">Sales</p>
          <p className="font-normal">Track and review your support tickets</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export to CSV
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {squareCards.map((card) => (
          <Card className="bg-brand-500/10 shadow-none" key={card.title}>
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
    </>
  );
};

export default Sales;
