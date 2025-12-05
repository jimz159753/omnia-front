"use client";

import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { useTickets } from "@/hooks/useTickets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HandCoinsIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";

import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";

const Sales = () => {
  const { data, loading, pagination, searchQuery, handlePageChange, handleSearch } =
    useTickets();

  const squareCards = [
    {
      title: "Tickets this week",
      value: "28",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },
    {
      title: "Scheduled services",
      value: "14",
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      title: "Active clients",
      value: "42",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      title: "Resolved tickets",
      value: "18",
      icon: <HandCoinsIcon className="w-4 h-4" />,
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <CustomLoadingSpinner size={48} />
        </div>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-6xl font-normal">Sales</CardTitle>
            <CardDescription className="text-xl font-normal">
              Track and review your support tickets
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {squareCards.map((card) => (
            <Card className="bg-brand-500/10" key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
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
  );
};

export default Sales;
