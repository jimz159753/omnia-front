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
          <CardTitle>Sales</CardTitle>
          <CardDescription>
            Track and manage your sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            onAddNew={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            addButtonLabel="Add Sale"
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
