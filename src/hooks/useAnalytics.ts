import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  subMonths,
  format,
  parseISO,
  isWithinInterval,
} from "date-fns";

interface MonthlyData {
  month: string;
  earnings: number;
  expenses: number;
}

interface AnalyticsMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalSales: number;
  salesChange: number;
  activeOrders: number;
  activeOrdersChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
  currentMonthEarnings: number;
  currentMonthExpenses: number;
  monthlyData: MonthlyData[];
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 0,
    revenueChange: 0,
    totalSales: 0,
    salesChange: 0,
    activeOrders: 0,
    activeOrdersChange: 0,
    averageOrderValue: 0,
    averageOrderValueChange: 0,
    currentMonthEarnings: 0,
    currentMonthExpenses: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all tickets
      const ticketsRes = await fetch("/api/tickets?pageSize=10000");
      const ticketsData = await ticketsRes.json();
      const allTickets = ticketsData?.data?.data || ticketsData?.data || [];

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Calculate current month revenue
      const currentMonthTickets = allTickets.filter((ticket: any) =>
        isWithinInterval(parseISO(ticket.createdAt), {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      );

      const totalRevenue = currentMonthTickets.reduce(
        (sum: number, ticket: any) => {
          const ticketTotal = ticket.items?.reduce(
            (itemSum: number, item: any) => itemSum + (item.total || 0),
            0
          );
          return sum + (ticketTotal || 0);
        },
        0
      );

      // Calculate last month revenue
      const lastMonthTickets = allTickets.filter((ticket: any) =>
        isWithinInterval(parseISO(ticket.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        })
      );

      const lastMonthRevenue = lastMonthTickets.reduce(
        (sum: number, ticket: any) => {
          const ticketTotal = ticket.items?.reduce(
            (itemSum: number, item: any) => itemSum + (item.total || 0),
            0
          );
          return sum + (ticketTotal || 0);
        },
        0
      );

      const revenueChange =
        lastMonthRevenue > 0
          ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Calculate sales (total tickets)
      const totalSales = currentMonthTickets.length;
      const lastMonthSales = lastMonthTickets.length;
      const salesChange =
        lastMonthSales > 0
          ? ((totalSales - lastMonthSales) / lastMonthSales) * 100
          : 0;

      // Calculate active orders (tickets that are not Completed or Cancelled)
      const activeOrders = allTickets.filter(
        (ticket: any) =>
          ticket.status !== "Completed" && ticket.status !== "Cancelled"
      ).length;

      const lastMonthActiveOrders = lastMonthTickets.filter(
        (ticket: any) =>
          ticket.status !== "Completed" && ticket.status !== "Cancelled"
      ).length;

      const activeOrdersChange =
        lastMonthActiveOrders > 0
          ? ((activeOrders - lastMonthActiveOrders) / lastMonthActiveOrders) *
            100
          : 0;

      // Calculate average order value
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const lastMonthAverageOrderValue =
        lastMonthSales > 0 ? lastMonthRevenue / lastMonthSales : 0;
      const averageOrderValueChange =
        lastMonthAverageOrderValue > 0
          ? ((averageOrderValue - lastMonthAverageOrderValue) /
              lastMonthAverageOrderValue) *
            100
          : 0;

      // Calculate monthly data for the chart (last 12 months)
      const monthlyData: MonthlyData[] = [];
      const yearStart = startOfYear(now);

      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(now, 11 - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthTickets = allTickets.filter((ticket: any) =>
          isWithinInterval(parseISO(ticket.createdAt), {
            start: monthStart,
            end: monthEnd,
          })
        );

        const earnings = monthTickets.reduce((sum: number, ticket: any) => {
          const ticketTotal = ticket.items?.reduce(
            (itemSum: number, item: any) => itemSum + (item.total || 0),
            0
          );
          return sum + (ticketTotal || 0);
        }, 0);

        // For expenses, we'll use a simple estimate: 60% of earnings
        // In a real app, you'd fetch actual expense data
        const expenses = earnings * 0.6;

        monthlyData.push({
          month: format(monthDate, "MMMM"),
          earnings,
          expenses,
        });
      }

      // Current month earnings and expenses
      const currentMonthEarnings = totalRevenue;
      const currentMonthExpenses = currentMonthEarnings * 0.6;

      setMetrics({
        totalRevenue,
        revenueChange,
        totalSales,
        salesChange,
        activeOrders,
        activeOrdersChange,
        averageOrderValue,
        averageOrderValueChange,
        currentMonthEarnings,
        currentMonthExpenses,
        monthlyData,
      });
    } catch (err) {
      console.error("Error calculating analytics metrics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: calculateMetrics,
  };
};
