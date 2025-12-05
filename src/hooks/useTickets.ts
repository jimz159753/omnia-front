import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket } from "@/generated/prisma";
import { useDebounce } from "./useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const useTickets = () => {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchTickets = async (currentPage: number, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        search,
      });

      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("No pudimos cargar los tickets.");
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTickets(1, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTickets(newPage, debouncedSearchQuery);
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const refetch = () => {
    fetchTickets(page, debouncedSearchQuery);
  };

  // Load dropdown options once
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [prodRes, servRes] = await Promise.all([
          fetch("/api/products?page=1&pageSize=100"),
          fetch("/api/services?page=1&pageSize=100"),
        ]);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.data || []);
        }
        if (servRes.ok) {
          const servData = await servRes.json();
          setServices(servData.data || []);
        }
      } catch (error) {
        console.error("Error loading options:", error);
        toast.error("No pudimos cargar productos/servicios.");
      }
    };
    loadOptions();
  }, []);

  return {
    data,
    loading,
    pagination,
    searchQuery,
    products,
    services,
    handlePageChange,
    handleSearch,
    refetch,
  };
};

