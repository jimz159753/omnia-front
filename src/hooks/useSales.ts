import { useEffect, useState } from "react";
import { Sale } from "@/generated/prisma";
import { useDebounce } from "./useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const useSales = () => {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchSales = async (page: number, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        search,
      });

      const response = await fetch(`/api/sales?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when debounced search changes (including initial load)
  useEffect(() => {
    fetchSales(1, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchSales(newPage, debouncedSearchQuery);
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const refetch = () => {
    fetchSales(pagination.page, debouncedSearchQuery);
  };

  const handleCreate = async (
    saleData: Omit<Sale, "id" | "createdAt" | "updatedAt">
  ): Promise<{ success: boolean; data?: Sale; error?: string }> => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to create sale",
        };
      }

      const result = await response.json();
      refetch();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error creating sale:", error);
      return {
        success: false,
        error: "An error occurred while creating the sale",
      };
    }
  };

  const handleUpdate = async (
    saleData: Partial<Sale> & { id: string }
  ): Promise<{ success: boolean; data?: Sale; error?: string }> => {
    try {
      const response = await fetch("/api/sales", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to update sale",
        };
      }

      const result = await response.json();
      refetch();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error updating sale:", error);
      return {
        success: false,
        error: "An error occurred while updating the sale",
      };
    }
  };

  const handleDelete = async (item: Sale): Promise<boolean> => {
    if (
      !confirm(`Are you sure you want to delete this sale for ${item.client}?`)
    ) {
      return false;
    }

    try {
      const response = await fetch(`/api/sales?id=${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete sale");
        return false;
      }

      refetch();
      return true;
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("An error occurred while deleting the sale");
      return false;
    }
  };

  return {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch,
  };
};
