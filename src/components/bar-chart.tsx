"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ChartDataPoint {
  time: string;
  offlineTicket: number;
  offlineFoodDrink: number;
  onlineTicket: number;
  onlineFoodDrink: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  onPointClick?: (label: string) => void;
}

export function BarChart({ data, onPointClick }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartConfig: ChartConfig = {
    offlineTicket: {
      label: ": Offline Ticket",
      color: "hsl(221.2 83.2% 53.3%)", // Dark blue
    },
    offlineFoodDrink: {
      label: ": Offline Food & Drink",
      color: "hsl(221.2 83.2% 70%)", // Lighter blue
    },
    onlineTicket: {
      label: ": Online Ticket",
      color: "hsl(199.1 89.1% 48.2%)", // Light blue
    },
    onlineFoodDrink: {
      label: ": Online Food & Drink",
      color: "hsl(199.1 89.1% 65%)", // Lighter blue
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[600px] w-full">
      <ResponsiveContainer width="100%" height="100%" aspect={16 / 9}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: 0,
            bottom: 5,
          }}
          barCategoryGap="20%"
          onClick={(state: any) => {
            const label = state?.activeLabel as string | undefined;
            if (label && onPointClick) {
              onPointClick(label);
            }
          }}
        >
          <XAxis
            dataKey="time"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickMargin={10}
            minTickGap={0}
            tickFormatter={(value) => {
              // Format based on the time format
              if (value.includes("-")) {
                const parts = value.split("-");
                if (parts.length === 3) {
                  return parts[2];
                } else if (parts.length === 2) {
                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  const monthIndex = parseInt(parts[1]) - 1;
                  return monthNames[monthIndex] || parts[1];
                }
              }
              return value;
            }}
          />

          <YAxis
            tickFormatter={(value) => value.toLocaleString()}
            tickMargin={4}
            tickCount={8}
          />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#aaa"
            strokeWidth={1}
            vertical={false}
            horizontal={true}
          />

          <ChartTooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  return [
                    typeof value === "number" ? value.toLocaleString() : value,
                    chartConfig[name as keyof typeof chartConfig]?.label ||
                      name,
                  ];
                }}
              />
            }
          />

          <ChartLegend
            content={<ChartLegendContent />}
            wrapperStyle={{ bottom: 0, left: 0, gap: 50, padding: 10 }}
          />

          {/* Offline stacked bars */}
          <Bar
            dataKey="offlineTicket"
            stackId="offline"
            fill="hsl(221.2 83.2% 53.3%)"
            radius={[0, 0, 0, 0]}
            name="offlineTicket"
          />
          <Bar
            dataKey="offlineFoodDrink"
            stackId="offline"
            fill="hsl(221.2 83.2% 70%)"
            radius={[4, 4, 0, 0]}
            name="offlineFoodDrink"
          />

          {/* Online stacked bars */}
          <Bar
            dataKey="onlineTicket"
            stackId="online"
            fill="hsl(199.1 89.1% 48.2%)"
            radius={[0, 0, 0, 0]}
            name="onlineTicket"
          />
          <Bar
            dataKey="onlineFoodDrink"
            stackId="online"
            fill="hsl(199.1 89.1% 65%)"
            radius={[4, 4, 0, 0]}
            name="onlineFoodDrink"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
