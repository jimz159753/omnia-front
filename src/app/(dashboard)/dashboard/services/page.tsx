"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, ServiceWithRelations } from "./columns";
import { useServices } from "@/hooks/useServices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </>
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
      title: "Total Services",
      value: pagination.total.toString(),
      icon: <FiZap className="w-4 h-4" />,
    },
    {
      title: "Active Services",
      value: data.length.toString(),
      icon: <FiCalendar className="w-4 h-4 text-brand-500" />,
    },
    {
      title: "Avg Duration",
      value:
        data.length > 0
          ? `${Math.round(
              data.reduce((acc, s) => acc + s.duration, 0) / data.length
            )} min`
          : "0 min",
      icon: <FiClock className="w-4 h-4" />,
    },
    {
      title: "Avg Price",
      value:
        data.length > 0
          ? new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(data.reduce((acc, s) => acc + s.price, 0) / data.length)
          : "$0.00",
      icon: <FiDollarSign className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-4xl font-normal">
            {tServicesTranslation("title")}
          </CardTitle>
          <CardDescription className="font-normal">
            {tServicesTranslation("description") || tCommon("description")}
          </CardDescription>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-1 text-md rounded-md border border-brand-500 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Service
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
            </CardContent>
          </Card>
        ))}
      </div>
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
    </>
  );
};

export default Services;
