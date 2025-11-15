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
          <p className="text-muted-foreground">Loading inventory...</p>
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Manage your inventory and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            onAddNew={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            addButtonLabel="Add Inventory"
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
