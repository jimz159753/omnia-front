import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket, Client, Product, Service } from "@/generated/prisma";
import { useDebounce } from "./useDebounce";

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type TicketWithRelations = Ticket & {
  client: Client;
  items: Array<{
    quantity: number;
    unitPrice: number;
    total: number;
    product: Product | null;
    service: Service | null;
  }>;
  seller?: { id: string; email: string };
  quantity?: number;
  total?: number;
};

export const useTickets = () => {
  const [data, setData] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchTickets = async (
    currentPage: number,
    search: string = "",
    status: string = "all",
    dateFilterType: string = "all",
    specificDate?: Date
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: "5", // Always request 5 items per page
        search,
      });

      if (status && status !== "all") {
        params.append("status", status);
      }

      if (dateFilterType && dateFilterType !== "all") {
        params.append("dateFilter", dateFilterType);
      }

      if (specificDate) {
        params.append("specificDate", specificDate.toISOString());
      }

      const response = await fetch(`/api/tickets?${params}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          result?.error || result?.message || "Failed to fetch tickets";
        toast.error(message);
        setData([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }
      setData(Array.isArray(result.data) ? result.data : []);
      const totalCount = result.pagination?.total ?? result.data?.length ?? 0;
      const totalPages =
        result.pagination?.totalPages ??
        (totalCount ? Math.ceil(totalCount / 5) : 0);
      setPagination({
          page: currentPage,
        pageSize: 5, // Always use 5 items per page
          total: totalCount,
          totalPages,
      });
    } catch (error) {
      toast.error("No pudimos cargar los tickets.");
      console.error("Error fetching tickets:", error);
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch tickets when search, status, or date filter changes
  useEffect(() => {
    setPage(1);
    fetchTickets(
      1,
      debouncedSearchQuery,
      statusFilter,
      dateFilter,
      selectedDate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, statusFilter, dateFilter, selectedDate]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTickets(
      newPage,
      debouncedSearchQuery,
      statusFilter,
      dateFilter,
      selectedDate
    );
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    if (filter !== "calendar") {
      setSelectedDate(undefined); // Clear selected date when not using calendar
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setDateFilter("calendar");
    }
  };

  const refetch = () => {
    fetchTickets(
      page,
      debouncedSearchQuery,
      statusFilter,
      dateFilter,
      selectedDate
    );
  };

  useEffect(() => {
    const handler = () =>
      fetchTickets(
        page,
        debouncedSearchQuery,
        statusFilter,
        dateFilter,
        selectedDate
      );
    window.addEventListener("tickets:refresh", handler);
    return () => window.removeEventListener("tickets:refresh", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchQuery, statusFilter, dateFilter, selectedDate]);

  const createTicket = async (payload: {
    clientId: string;
    productId: string;
    serviceId: string;
    amount: number;
    status: string;
  }) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ticket");
      }

      toast.success("Ticket created successfully");
      await fetchTickets(
        page,
        debouncedSearchQuery,
        statusFilter,
        dateFilter,
        selectedDate
      );
      return true;
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create ticket"
      );
      return false;
    }
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
    statusFilter,
    dateFilter,
    selectedDate,
    products,
    services,
    handlePageChange,
    handleSearch,
    handleStatusChange,
    handleDateFilterChange,
    handleDateSelect,
    refetch,
    createTicket,
  };
};
