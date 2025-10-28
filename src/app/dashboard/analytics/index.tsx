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

const chartData = [
  { month: "January", earnings: 186, expenses: 80 },
  { month: "February", earnings: 305, expenses: 200 },
  { month: "March", earnings: 237, expenses: 120 },
  { month: "April", earnings: 73, expenses: 190 },
  { month: "May", earnings: 209, expenses: 130 },
  { month: "June", earnings: 214, expenses: 140 },
  { month: "July", earnings: 350, expenses: 140 },
  { month: "August", earnings: 300, expenses: 140 },
  { month: "September", earnings: 214, expenses: 140 },
  { month: "October", earnings: 350, expenses: 200 },
  { month: "November", earnings: 350, expenses: 150 },
  { month: "December", earnings: 300, expenses: 100 },
];

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "oklch(60.9% 0.126 221.723)",
  },
  expenses: {
    label: "Expenses",
    color: "oklch(45% 0.085 224.283)",
  },
} satisfies ChartConfig;

const Analytics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings and Expenses</CardTitle>
        <CardDescription>
          Showing total earnings and expenses for the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
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
            <div className="flex items-center gap-2 leading-none font-medium">
              Current month earnings: $1,200
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Current month expenses: $800
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Analytics;
