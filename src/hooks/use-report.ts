import { useQuery } from "@tanstack/react-query";
import { getRevenueByPeriod } from "@/services/dashboard";
import dayjs from "dayjs";

export interface DailyReport {
  day: number;
  month: number;
  year: number;
  ticketRevenue: number;
  foodDrinkRevenue: number;
  totalRevenue: number;
}

export interface WeeklyReport extends DailyReport {}

export interface MonthlyReport {
  day: number;
  month: number;
  year: number;
  ticketRevenue: number;
  foodDrinkRevenue: number;
  totalRevenue: number;
}

export interface YearlyReport {
  month: number;
  year: number;
  ticketRevenue: number;
  foodDrinkRevenue: number;
  totalRevenue: number;
}

export const reportKeys = {
  all: ["report"] as const,
  weekly: (date: string) => [...reportKeys.all, "weekly", date] as const,
  monthly: (date: string) => [...reportKeys.all, "monthly", date] as const,
  yearly: (year: number) => [...reportKeys.all, "yearly", year] as const,
};

async function fetchWeeklyReport(date: dayjs.Dayjs): Promise<WeeklyReport[]> {
  const startOfWeek = date.startOf("week").add(1, "day"); // Monday
  const reports: WeeklyReport[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = startOfWeek.add(i, "day");
    const startDate = currentDay.startOf("day").toISOString();
    const endDate = currentDay.endOf("day").toISOString();

    try {
      const revenue = await getRevenueByPeriod(startDate, endDate);
      reports.push({
        day: currentDay.date(),
        month: currentDay.month() + 1,
        year: currentDay.year(),
        ticketRevenue: revenue.totalRevenue,
        foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        totalRevenue: revenue.totalRevenue + revenue.totalRevenueFromFoodDrink,
      });
    } catch (error) {
      reports.push({
        day: currentDay.date(),
        month: currentDay.month() + 1,
        year: currentDay.year(),
        ticketRevenue: 0,
        foodDrinkRevenue: 0,
        totalRevenue: 0,
      });
    }
  }

  return reports;
}

async function fetchMonthlyReport(
  month: number,
  year: number
): Promise<MonthlyReport[]> {
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
  const reports: MonthlyReport[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = dayjs(`${year}-${month}-${day}`);
    const startDate = currentDay.startOf("day").toISOString();
    const endDate = currentDay.endOf("day").toISOString();

    try {
      const revenue = await getRevenueByPeriod(startDate, endDate);
      reports.push({
        day,
        month,
        year,
        ticketRevenue: revenue.totalRevenue,
        foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        totalRevenue: revenue.totalRevenue + revenue.totalRevenueFromFoodDrink,
      });
    } catch (error) {
      reports.push({
        day,
        month,
        year,
        ticketRevenue: 0,
        foodDrinkRevenue: 0,
        totalRevenue: 0,
      });
    }
  }

  return reports;
}

async function fetchYearlyReport(year: number): Promise<YearlyReport[]> {
  const reports: YearlyReport[] = [];

  for (let month = 1; month <= 12; month++) {
    const monthStart = dayjs(`${year}-${month}-1`);
    const monthEnd = monthStart.endOf("month");
    const startDate = monthStart.startOf("day").toISOString();
    const endDate = monthEnd.endOf("day").toISOString();

    try {
      const revenue = await getRevenueByPeriod(startDate, endDate);
      reports.push({
        month,
        year,
        ticketRevenue: revenue.totalRevenue,
        foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        totalRevenue: revenue.totalRevenue + revenue.totalRevenueFromFoodDrink,
      });
    } catch (error) {
      reports.push({
        month,
        year,
        ticketRevenue: 0,
        foodDrinkRevenue: 0,
        totalRevenue: 0,
      });
    }
  }

  return reports;
}

export function useWeeklyReport(date: dayjs.Dayjs) {
  return useQuery({
    queryKey: reportKeys.weekly(date.toISOString()),
    queryFn: () => fetchWeeklyReport(date),
    enabled: !!date,
    staleTime: 60 * 1000,
  });
}

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: reportKeys.monthly(`${year}-${month}`),
    queryFn: () => fetchMonthlyReport(month, year),
    enabled: !!month && !!year,
    staleTime: 60 * 1000,
  });
}

export function useYearlyReport(year: number) {
  return useQuery({
    queryKey: reportKeys.yearly(year),
    queryFn: () => fetchYearlyReport(year),
    enabled: !!year,
    staleTime: 60 * 1000,
  });
}
