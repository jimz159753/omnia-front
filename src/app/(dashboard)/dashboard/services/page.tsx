"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, ServiceWithRelations } from "./columns";
import { useServices } from "@/hooks/useServices";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { DeleteConfirmDialog } from "@/components/services/DeleteConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiPlus,
  FiZap,
} from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

const Services = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceWithRelations | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState<ServiceWithRelations | null>(
    null
  );
  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    refetch,
  } = useServices();
  const { t: tServicesTranslation } = useTranslation("services");
  const { t: tCommon } = useTranslation();

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
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
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

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const handleAddNewSuccess = () => {
    refetch();
    setEditingItem(null);
  };

  const handleUpdate = (item: ServiceWithRelations) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: ServiceWithRelations) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    const response = await fetch(`/api/services?id=${deletingItem.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete service");
    }

    refetch();
    setDeletingItem(null);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const columns = getColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    tServices: tServicesTranslation,
    tCommon,
  });

  const squareCards = [
    {
      title: tServicesTranslation("totalServices") || "Total Services",
      value: pagination.total.toString(),
      icon: <FiZap className="w-5 h-5" />,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      title: tServicesTranslation("activeServices") || "Active Services",
      value: data.length.toString(),
      icon: <FiCalendar className="w-5 h-5" />,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: tServicesTranslation("avgDuration") || "Avg Duration",
      value:
        data.length > 0
          ? `${Math.round(
              data.reduce((acc, s) => acc + s.duration, 0) / data.length
            )} min`
          : "0 min",
      icon: <FiClock className="w-5 h-5" />,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: tServicesTranslation("avgPrice") || "Avg Price",
      value:
        data.length > 0
          ? new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(data.reduce((acc, s) => acc + s.price, 0) / data.length)
          : "$0.00",
      icon: <FiDollarSign className="w-5 h-5" />,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tServicesTranslation("title")}
            </h1>
            <p className="text-gray-500 mt-1">
              {tServicesTranslation("description")}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
          >
            <FiPlus className="w-5 h-5" />
            {tServicesTranslation("addService")}
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={
              tServicesTranslation("searchPlaceholder") || tCommon("search")
            }
            searchValue={searchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

      <ServiceFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleAddNewSuccess}
        item={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        item={deletingItem}
      />
    </div>
  );
};

export default Services;
