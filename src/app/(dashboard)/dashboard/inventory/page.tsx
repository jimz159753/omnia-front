"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useInventory } from "@/hooks/useInventory";

const Inventory = () => {
  const { data, loading, pagination, handlePageChange, handleSearch } =
    useInventory();

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your inventory and stock levels
        </p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search by name..."
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        loading={loading}
      />
    </div>
  );
};

export default Inventory;
