"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useTickets } from "@/hooks/useTickets";
import TicketDetailsDialog from "@/components/dialogs/TicketDetailsDialog";
import { SaleFormDialog } from "@/components/dialogs/SaleFormDialog";
import { AppointmentFormDialog } from "@/components/dialogs/AppointmentFormDialog";
import TicketsLineChart from "@/components/charts/TicketsLineChart";
import {
  FiDownload,
  FiCalendar,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiAlertTriangle,
} from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import { StatusFilter } from "@/components/filters/StatusFilter";
import { DateFilter } from "@/components/filters/DateFilter";
import { Skeleton } from "@/components/ui/skeleton";
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

const Sales = () => {
  type TicketWithRelations = ReturnType<typeof useTickets>["data"][number] & {
    notes?: string;
  };
  const [selectedTicket, setSelectedTicket] =
    React.useState<TicketWithRelations | null>(null);
  const [ticketToDelete, setTicketToDelete] =
    React.useState<TicketWithRelations | null>(null);
  const [ticketToEdit, setTicketToEdit] =
    React.useState<TicketWithRelations | null>(null);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    deleteTicket,
  } = useTickets();

  // State for metrics
  const [metrics, setMetrics] = useState({
    ticketsThisWeek: 0,
    scheduledServices: 0,
    activeClients: 0,
    totalRevenue: 0,
  });

  // Calculate metrics from data
  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        // Fetch all tickets for accurate metrics
        const allTicketsRes = await fetch("/api/tickets?pageSize=10000");
        const allTicketsData = await allTicketsRes.json();
        const allTickets =
          allTicketsData?.data?.data || allTicketsData?.data || [];

        // Calculate tickets this week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);

        const ticketsThisWeek = allTickets.filter((ticket: any) => {
          const ticketDate = new Date(ticket.createdAt);
          return ticketDate >= startOfWeek;
        }).length;

        // Calculate scheduled services (appointments with future startTime)
        const scheduledServices = allTickets.filter((ticket: any) => {
          if (!ticket.startTime) return false;
          const startTime = new Date(ticket.startTime);
          return startTime > now;
        }).length;

        // Calculate active clients (unique clients from all tickets)
        const uniqueClientIds = new Set(
          allTickets.map((ticket: any) => ticket.clientId).filter(Boolean)
        );
        const activeClients = uniqueClientIds.size;

        // Calculate total revenue
        const totalRevenue = allTickets.reduce(
          (sum: number, ticket: any) => sum + (ticket.total || 0),
          0
        );

        setMetrics({
          ticketsThisWeek,
          scheduledServices,
          activeClients,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error calculating metrics:", error);
      }
    };

    calculateMetrics();
  }, [data]); // Recalculate when data changes

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

  // Handlers for edit and delete
  const handleEditTicket = (ticket: TicketWithRelations) => {
    setTicketToEdit(ticket);
    
    // Open appropriate dialog based on ticket type
    if (ticket.startTime) {
      // It's an appointment
      setAppointmentDialogOpen(true);
    } else {
      // It's a sale
      setSaleDialogOpen(true);
    }
  };

  const handleEditDialogClose = () => {
    setSaleDialogOpen(false);
    setAppointmentDialogOpen(false);
    setTicketToEdit(null);
  };

  const handleEditSuccess = () => {
    handleEditDialogClose();
    // Refresh the tickets list
    window.dispatchEvent(new Event("tickets:refresh"));
  };

  const handleDeleteTicket = (ticket: TicketWithRelations) => {
    setTicketToDelete(ticket);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTicket(ticketToDelete.id);
      toast.success(tSales("ticketDeletedSuccess"));
      setTicketToDelete(null);
    } catch (error) {
      toast.error(tSales("ticketDeletedError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const squareCards = [
    {
      title: tSales("ticketsThisWeek") || "Tickets This Week",
      value: metrics.ticketsThisWeek.toString(),
      description: tSales("ticketsThisWeekDesc") || "Created this week",
      icon: <FiShoppingBag className="w-5 h-5" />,
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      title: tSales("scheduledServices") || "Scheduled",
      value: metrics.scheduledServices.toString(),
      description: tSales("scheduledServicesDesc") || "Upcoming appointments",
      icon: <FiCalendar className="w-5 h-5" />,
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: tSales("activeClients") || "Active Clients",
      value: metrics.activeClients.toString(),
      description: tSales("activeClientsDesc") || "Total unique clients",
      icon: <FiUsers className="w-5 h-5" />,
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: tSales("totalRevenue") || "Total Revenue",
      value: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(metrics.totalRevenue),
      description: tSales("totalRevenueDesc") || "All time revenue",
      icon: <FiTrendingUp className="w-5 h-5" />,
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEditTicket,
        onDelete: handleDeleteTicket,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
            <Skeleton className="h-11 w-[160px] rounded-xl" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tSales("title")}
            </h1>
            <p className="text-gray-500 mt-1">{tSales("description")}</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-omnia-blue text-white font-medium hover:bg-omnia-blue/90 transition-all shadow-lg shadow-omnia-blue/25 hover:shadow-xl hover:shadow-omnia-blue/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <FiDownload className="w-5 h-5" />
            {tSales("exportCSV")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {squareCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.lightColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {tSales("salesTrend") || "Sales Trend"}
        </h3>
        <TicketsLineChart className="bg-transparent shadow-none border-none p-0" />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
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
        </div>
      </div>

      <TicketDetailsDialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        ticket={selectedTicket ?? undefined}
      />

      {/* Delete Confirmation Dialog */}
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
              onClick={confirmDelete}
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
          clientId: ticketToEdit.clientId || undefined,
          staffId: ticketToEdit.staffId || undefined,
          status: ticketToEdit.status || undefined,
          notes: ticketToEdit.notes || undefined,
          items: ticketToEdit.items?.map(item => ({
            id: (item as { id?: string }).id,
            productId: item.product?.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          client: ticketToEdit.client ? {
            id: ticketToEdit.client.id,
            name: ticketToEdit.client.name,
            email: ticketToEdit.client.email || "",
            phone: ticketToEdit.client.phone || undefined,
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
          clientId: ticketToEdit.clientId || undefined,
          serviceId: ticketToEdit.items?.[0]?.service?.id,
          notes: ticketToEdit.notes || undefined,
        } : null}
      />
    </div>
  );
};

export default Sales;
