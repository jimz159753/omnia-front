"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useTickets } from "@/hooks/useTickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketDetailsDialog from "@/components/dialogs/TicketDetailsDialog";
import TicketsLineChart from "@/components/charts/TicketsLineChart";
import { FiDownload, FiPackage, FiShoppingBag, FiUser } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { DateFilter } from "@/components/filters/DateFilter";
import { Skeleton } from "@/components/ui/skeleton";

const Sales = () => {
  type TicketWithRelations = ReturnType<typeof useTickets>["data"][number] & {
    notes?: string;
  };
  const [selectedTicket, setSelectedTicket] =
    React.useState<TicketWithRelations | null>(null);
  const { t: tSales } = useTranslation("sales");
  const { t: tCommon } = useTranslation();

  const {
    data,
    loading,
    pagination,
    searchQuery,
    statusFilter,
    dateFilter,
    selectedDate,
    handlePageChange,
    handleSearch,
    handleStatusChange,
    handleDateFilterChange,
    handleDateSelect,
  } = useTickets();

  const exportToCSV = () => {
    try {
      if (data.length === 0) {
        alert(tSales("noDataExport"));
        return;
      }

      const headers = [
        tCommon("date"),
        tCommon("client"),
        tSales("itemsLabel"),
        tCommon("quantity"),
        tCommon("total"),
        tCommon("status"),
      ];

      const rows = data.map((ticket) => {
        const dateStr = new Date(ticket.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        const items = ticket.items || [];
        const itemNames = items
          .map((i) => i.product?.name || i.service?.name || "Item")
          .join("; ");
        const qty =
          typeof ticket.quantity === "number"
            ? ticket.quantity
            : items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        const total =
          typeof ticket.total === "number"
            ? ticket.total
            : items.reduce((sum, i) => sum + (i.total || 0), 0);

        return [
          dateStr,
          ticket.client?.name ?? "",
          itemNames,
          String(qty),
          total.toFixed(2),
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
      alert(tSales("csvError"));
    }
  };

  const squareCards = [
    {
      title: tSales("ticketsThisWeek"),
      value: "28",
      description: "+12% from last week",
      icon: <FiShoppingBag className="w-4 h-4" />,
    },
    {
      title: tSales("scheduledServices"),
      value: "14",
      description: "+3 pending this week",
      icon: <FiPackage className="w-4 h-4" />,
    },
    {
      title: tSales("activeClients"),
      value: "42",
      description: "+8 new this month",
      icon: <FiUser className="w-4 h-4" />,
    },
  ];

  const columns = getColumns();

  if (loading && data.length === 0) {
    return (
      <>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
          {[...Array(4)].map((_, i) => (
            <Card className="bg-brand-500/10 shadow-none" key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-3 w-[140px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-[320px]" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-normal">{tSales("title")}</p>
          <p className="font-normal">{tSales("description")}</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={loading || data.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-brand-500 hover:bg-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          {tSales("exportCSV")}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
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
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
        <TicketsLineChart className="bg-brand-500/10 shadow-none" />
      </div>

      <DataTable
        reverseFilters={true}
        columns={columns}
        data={data}
        searchKey="client"
        searchPlaceholder={tSales("searchByClient")}
        searchValue={searchQuery}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        loading={loading}
        onRowClick={(row) => setSelectedTicket(row as TicketWithRelations)}
        extraFilters={
          <div className="flex gap-2">
            <StatusFilter value={statusFilter} onChange={handleStatusChange} />
            <DateFilter
              value={dateFilter}
              selectedDate={selectedDate}
              onChange={handleDateFilterChange}
              onDateSelect={handleDateSelect}
            />
          </div>
        }
      />
      <TicketDetailsDialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        ticket={selectedTicket ?? undefined}
      />
    </>
  );
};

export default Sales;
