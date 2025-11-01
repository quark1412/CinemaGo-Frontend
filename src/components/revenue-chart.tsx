"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { MonthlyRevenue } from "@/services/dashboard";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  year: number;
}

export function RevenueChart({ data, year }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    "Ticket Revenue": item.revenue,
    "Food & Drink Revenue": item.foodDrinkRevenue,
    "Total Revenue": item.revenue + item.foodDrinkRevenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview - {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <Tooltip
              formatter={(value: number) => formatPrice(value)}
              labelStyle={{ color: "inherit" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Ticket Revenue"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Food & Drink Revenue"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Total Revenue"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
