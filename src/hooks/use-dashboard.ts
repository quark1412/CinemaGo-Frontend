import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStatistics,
  getRevenueByPeriod,
  getMonthlyRevenue,
} from "@/services/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  statistics: () => [...dashboardKeys.all, "statistics"] as const,
  revenue: (startDate: string, endDate: string) =>
    [...dashboardKeys.all, "revenue", startDate, endDate] as const,
  monthlyRevenue: (year: number) =>
    [...dashboardKeys.all, "monthlyRevenue", year] as const,
};

export function useDashboardStatistics() {
  return useQuery({
    queryKey: dashboardKeys.statistics(),
    queryFn: getDashboardStatistics,
    staleTime: 60 * 1000,
  });
}

export function useRevenueByPeriod(startDate: string, endDate: string) {
  return useQuery({
    queryKey: dashboardKeys.revenue(startDate, endDate),
    queryFn: () => getRevenueByPeriod(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60 * 1000,
  });
}

export function useMonthlyRevenue(year: number) {
  return useQuery({
    queryKey: dashboardKeys.monthlyRevenue(year),
    queryFn: () => getMonthlyRevenue(year),
    staleTime: 60 * 1000,
  });
}
