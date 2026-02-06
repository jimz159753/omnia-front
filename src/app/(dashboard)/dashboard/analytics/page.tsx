"use client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminGuard } from "@/components/guards/AdminGuard";

const AnalyticsContent = () => {
  const { t } = useTranslation("analytics");
  const { metrics, loading, error } = useAnalytics();

  // Chart configuration with brand colors
  const chartConfig = {
    earnings: {
      label: t("earnings"),
      color: "#5faf87", // brand-400
    },
    expenses: {
      label: t("expenses"),
      color: "#326752", // brand-600
    },
  } satisfies ChartConfig;

  // Translate month names
  const translatedMonthlyData = metrics.monthlyData.map((data) => ({
    ...data,
    month: t(data.month.toLowerCase()),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[140px] mb-2" />
                <Skeleton className="h-3 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card className="border-l-4 border-l-brand-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalRevenue")}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-brand-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-700">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p
              className={`text-xs ${
                metrics.revenueChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentage(metrics.revenueChange)} {t("totalRevenueDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Sales Card */}
        <Card className="border-l-4 border-l-brand-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-brand-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-700">
              +{metrics.totalSales}
            </div>
            <p
              className={`text-xs ${
                metrics.salesChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatPercentage(metrics.salesChange)} {t("salesDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Active Orders Card */}
        <Card className="border-l-4 border-l-brand-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("activeOrders")}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-brand-500"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-700">
              {metrics.activeOrders}
            </div>
            <p
              className={`text-xs ${
                metrics.activeOrdersChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(metrics.activeOrdersChange)}{" "}
              {t("activeOrdersDesc")}
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card className="border-l-4 border-l-brand-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("averageOrderValue")}
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-brand-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-700">
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <p
              className={`text-xs ${
                metrics.averageOrderValueChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatPercentage(metrics.averageOrderValueChange)}{" "}
              {t("averageOrderValueDesc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800">
            {t("earningsAndExpenses")}
          </CardTitle>
          <CardDescription>{t("earningsAndExpensesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              accessibilityLayer
              data={translatedMonthlyData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="earnings"
                type="natural"
                fill={chartConfig.earnings.color}
                fillOpacity={0.4}
                stroke={chartConfig.earnings.color}
                stackId="a"
              />
              <Area
                dataKey="expenses"
                type="natural"
                fill={chartConfig.expenses.color}
                fillOpacity={0.4}
                stroke={chartConfig.expenses.color}
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium text-brand-700">
                {t("currentMonthEarnings")}:{" "}
                {formatCurrency(metrics.currentMonthEarnings)}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                {t("currentMonthExpenses")}:{" "}
                {formatCurrency(metrics.currentMonthExpenses)}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const Analytics = () => {
  return (
    <AdminGuard>
      <AnalyticsContent />
    </AdminGuard>
  );
};

export default Analytics;
