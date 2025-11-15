import { useEffect, useState } from "react";
import { InventoryWithCategory } from "@/app/(dashboard)/dashboard/inventory/columns";
import { useDebounce } from "./useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const useInventory = () => {
  const [data, setData] = useState<InventoryWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchInventory = async (page: number, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        search,
      });

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when debounced search changes (including initial load)
  useEffect(() => {
    fetchInventory(1, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    fetchInventory(newPage, debouncedSearchQuery);
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const refetch = () => {
    fetchInventory(pagination.page, debouncedSearchQuery);
  };

  return {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    refetch,
  };
};
