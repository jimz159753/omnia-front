"use client";

import React, { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiTrendingUp } from "react-icons/fi";

interface TicketsLineChartProps {
  className?: string;
}

interface DayData {
  date: string;
  fullDate: string;
  tickets: number;
}

const chartConfig = {
  tickets: {
    label: "Tickets",
    color: "#418268",
  },
};

export function TicketsLineChart({ className }: TicketsLineChartProps) {
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const fetchTicketsData = async () => {
    try {
      setLoading(true);

      // Get all tickets (we'll filter by date on the client side for now)
      const response = await fetch("/api/tickets?pageSize=1000");
      const data = await response.json();
      const tickets = data.data || [];

      // Get last 5 days
      const today = new Date();
      const last5Days: DayData[] = [];

      for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const ticketsOnDay = tickets.filter((ticket: any) => {
          const ticketDate = new Date(ticket.createdAt);
          return ticketDate >= date && ticketDate < nextDay;
        }).length;

        // Format day number for x-axis (e.g., "12", "13")
        const dayNumber = date.getDate();

        // Format full date as "Dec 08, 2025" for tooltip
        const fullDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        last5Days.push({
          date: `${dayNumber}`,
          fullDate: fullDate,
          tickets: ticketsOnDay,
        });
      }

      setChartData(last5Days);
    } catch (error) {
      console.error("Failed to fetch tickets data:", error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = chartData.reduce((sum, day) => sum + day.tickets, 0);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Tickets (Last 5 Days)
        </CardTitle>
        <FiTrendingUp className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[70px]">
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[70px]">
            <p className="text-xs text-gray-400">No data available</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[70px] w-full">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={false}
                  width={0}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullDate;
                        }
                        return value;
                      }}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="var(--color-tickets)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-tickets)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TicketsLineChart;
