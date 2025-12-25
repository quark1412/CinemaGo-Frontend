"use client";

import {
  LineChart as RechartsLineChart,
  Line,
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
import { useI18n } from "@/contexts/I18nContext";

interface ChartDataPoint {
  time: string;
  revenue: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  onPointClick?: (label: string) => void;
}

export function LineChart({ data, onPointClick }: LineChartProps) {
  const { t } = useI18n();

  const chartConfig: ChartConfig = {
    revenue: {
      label: `: ${t("report.charts.revenue")}`,
      color: "hsl(221.2 83.2% 53.3%)",
    },
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[400px] w-full [&_.recharts-tooltip-cursor]:!stroke-[var(--primary)]/50"
    >
      <ResponsiveContainer width="100%" height="100%" aspect={16 / 9}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 20,
            right: 10,
          }}
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
            tickFormatter={(value) =>
              value.split("-")[2]
                ? value.split("-")[2] + "/" + value.split("-")[1]
                : value.split("-")[1]
            }
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
            vertical={true}
            horizontal={true}
          />

          <ChartTooltip
            cursor={{ stroke: "red", strokeWidth: 1, strokeDasharray: "3 3" }}
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

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(221.2 83.2% 53.3%)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="revenue"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
