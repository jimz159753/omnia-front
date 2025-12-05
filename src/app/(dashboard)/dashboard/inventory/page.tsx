"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, InventoryWithCategory } from "./columns";
import { useInventory } from "@/hooks/useInventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InventoryFormModal } from "@/components/inventory/InventoryFormModal";
import { DeleteConfirmDialog } from "@/components/inventory/DeleteConfirmDialog";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import {
  BoxIcon,
  PackageIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
} from "lucide-react";

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryWithCategory | null>(
    null
  );
  const [deletingItem, setDeletingItem] =
    useState<InventoryWithCategory | null>(null);
  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    refetch,
  } = useInventory();

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <CustomLoadingSpinner size={48} />
        </div>
      </div>
    );
  }

  const handleAddNewSuccess = () => {
    refetch();
    setEditingItem(null);
  };

  const handleUpdate = (item: InventoryWithCategory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: InventoryWithCategory) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    const response = await fetch(`/api/inventory?id=${deletingItem.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete inventory item");
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
  });

  const squareCards = [
    {
      title: "Total Products",
      value: "100",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },

    {
      title: "Low Stock Items",
      value: "10",
      icon: <BoxIcon className="w-4 h-4" />,
    },

    {
      title: "Categories",
      value: "15",
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      title: "Total Value",
      value: "$25,000",
      icon: <TrendingUpIcon className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-6xl font-normal">Inventory</CardTitle>
              <CardDescription className="text-xl font-normal">
                Manage your inventory and stock levels
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
              Add Inventory
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
            searchKey="name"
            searchPlaceholder="Search by name..."
            searchValue={searchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </CardContent>
      </Card>

      <InventoryFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleAddNewSuccess}
        item={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name || ""}
      />
    </>
  );
};

export default Inventory;
