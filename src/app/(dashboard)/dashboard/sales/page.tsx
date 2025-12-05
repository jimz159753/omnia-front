"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useSales } from "@/hooks/useSales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sale } from "@/generated/prisma";
import { SaleFormModal } from "@/components/sales/SaleFormModal";
import { DeleteConfirmDialog } from "@/components/sales/DeleteConfirmDialog";
import {
  DollarSignIcon,
  HandCoinsIcon,
  PackageIcon,
  PlusIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";

const Sales = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sale | null>(null);
  const [deletingItem, setDeletingItem] = useState<Sale | null>(null);

  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    refetch,
  } = useSales();

  const squareCards = [
    {
      title: "Total of products",
      value: "100",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },

    {
      title: "Total of orders",
      value: "100",
      icon: <PackageIcon className="w-4 h-4" />,
    },

    {
      title: "Total of clients",
      value: "100",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      title: "Total of sales",
      value: "100",
      icon: <HandCoinsIcon className="w-4 h-4" />,
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading sales...</p>
        </div>
      </div>
    );
  }

  const handleAddNewSuccess = () => {
    refetch();
    setEditingItem(null);
  };

  const onUpdateSale = (item: Sale) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const onDeleteSale = (item: Sale) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    const response = await fetch(`/api/sales?id=${deletingItem.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete sale");
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
    onUpdate: onUpdateSale,
    onDelete: onDeleteSale,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-6xl font-normal">Sales</CardTitle>
              <CardDescription className="text-xl font-normal">
                Track and manage your sales transactions
              </CardDescription>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-1 text-md rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Sale
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

      <SaleFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleAddNewSuccess}
        item={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        clientName={deletingItem?.client || ""}
        description={deletingItem?.description || ""}
      />
    </>
  );
};

export default Sales;
