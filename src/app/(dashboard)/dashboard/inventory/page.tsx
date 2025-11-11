"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useInventory } from "@/hooks/useInventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Inventory = () => {
  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
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

  return (
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
        />
      </CardContent>
    </Card>
  );
};

export default Inventory;
