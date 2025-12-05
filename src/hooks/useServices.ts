import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { useDebounce } from "./useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const useServices = () => {
  const [data, setData] = useState<ServiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchServices = async (currentPage: number, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        search,
      });

      const response = await fetch(`/api/services?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("No pudimos cargar los servicios.");
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchServices(1, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchServices(newPage, debouncedSearchQuery);
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const refetch = () => {
    fetchServices(page, debouncedSearchQuery);
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

