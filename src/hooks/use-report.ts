import { useQuery } from "@tanstack/react-query";
import {
  getRevenueByPeriod,
  getRevenueByPeriodAndCinema,
  getRevenueByPeriodAndMovie,
  CinemaRevenue,
  MovieRevenue,
} from "@/services/dashboard";
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

// Fetch revenue by type
async function fetchRevenueByType(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  type: "offline" | "online"
): Promise<
  { time: string; ticketRevenue: number; foodDrinkRevenue: number }[]
> {
  const data: {
    time: string;
    ticketRevenue: number;
    foodDrinkRevenue: number;
  }[] = [];

  if (viewType === "week") {
    const startOfWeek = selectedDate.startOf("week").add(1, "day"); // Monday
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.add(i, "day");
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();

      try {
        const revenue = await getRevenueByPeriod(startDate, endDate, type);
        data.push({
          time: currentDay.format("YYYY-MM-DD"),
          ticketRevenue: revenue.totalRevenue,
          foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        });
      } catch (error) {
        data.push({
          time: currentDay.format("YYYY-MM-DD"),
          ticketRevenue: 0,
          foodDrinkRevenue: 0,
        });
      }
    }
  } else if (viewType === "month") {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = dayjs(`${year}-${month}-${day}`);
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();

      try {
        const revenue = await getRevenueByPeriod(startDate, endDate, type);
        data.push({
          time: currentDay.format("YYYY-MM-DD"),
          ticketRevenue: revenue.totalRevenue,
          foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        });
      } catch (error) {
        data.push({
          time: currentDay.format("YYYY-MM-DD"),
          ticketRevenue: 0,
          foodDrinkRevenue: 0,
        });
      }
    }
  } else if (viewType === "year") {
    const year = selectedDate.year();

    for (let month = 1; month <= 12; month++) {
      const monthStart = dayjs(`${year}-${month}-1`);
      const monthEnd = monthStart.endOf("month");
      const startDate = monthStart.startOf("day").toISOString();
      const endDate = monthEnd.endOf("day").toISOString();

      try {
        const revenue = await getRevenueByPeriod(startDate, endDate, type);
        data.push({
          time: `${year}-${String(month).padStart(2, "0")}`,
          ticketRevenue: revenue.totalRevenue,
          foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        });
      } catch (error) {
        data.push({
          time: `${year}-${String(month).padStart(2, "0")}`,
          ticketRevenue: 0,
          foodDrinkRevenue: 0,
        });
      }
    }
  }

  return data;
}

// Fetch revenue by cinema
async function fetchRevenueByCinema(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  cinemaId?: string
): Promise<{ time: string; revenue: number }[]> {
  const data: { time: string; revenue: number }[] = [];

  if (viewType === "week") {
    const startOfWeek = selectedDate.startOf("week").add(1, "day");
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.add(i, "day");
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();
      const timeKey = currentDay.format("YYYY-MM-DD");

      try {
        const cinemasRevenue = await getRevenueByPeriodAndCinema(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (cinemaId) {
          // Filter by cinema
          const cinema = cinemasRevenue.find((c) => c.cinemaId === cinemaId);
          totalRevenue = cinema?.totalRevenue || 0;
        } else {
          totalRevenue = cinemasRevenue.reduce(
            (sum, cinema) => sum + cinema.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  } else if (viewType === "month") {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = dayjs(`${year}-${month}-${day}`);
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();
      const timeKey = currentDay.format("YYYY-MM-DD");

      try {
        const cinemasRevenue = await getRevenueByPeriodAndCinema(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (cinemaId) {
          // Filter by cinema
          const cinema = cinemasRevenue.find((c) => c.cinemaId === cinemaId);
          totalRevenue = cinema?.totalRevenue || 0;
        } else {
          totalRevenue = cinemasRevenue.reduce(
            (sum, cinema) => sum + cinema.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  } else if (viewType === "year") {
    const year = selectedDate.year();

    for (let month = 1; month <= 12; month++) {
      const monthStart = dayjs(`${year}-${month}-1`);
      const monthEnd = monthStart.endOf("month");
      const startDate = monthStart.startOf("day").toISOString();
      const endDate = monthEnd.endOf("day").toISOString();
      const timeKey = `${year}-${String(month).padStart(2, "0")}`;

      try {
        const cinemasRevenue = await getRevenueByPeriodAndCinema(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (cinemaId) {
          // Filter by cinema
          const cinema = cinemasRevenue.find((c) => c.cinemaId === cinemaId);
          totalRevenue = cinema?.totalRevenue || 0;
        } else {
          totalRevenue = cinemasRevenue.reduce(
            (sum, cinema) => sum + cinema.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  }

  return data;
}

// Fetch revenue by movie
async function fetchRevenueByMovie(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  movieId?: string
): Promise<{ time: string; revenue: number }[]> {
  const data: { time: string; revenue: number }[] = [];

  if (viewType === "week") {
    const startOfWeek = selectedDate.startOf("week").add(1, "day");
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.add(i, "day");
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();
      const timeKey = currentDay.format("YYYY-MM-DD");

      try {
        const moviesRevenue = await getRevenueByPeriodAndMovie(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (movieId) {
          // Filter by movie
          const movie = moviesRevenue.find((m) => m.movieId === movieId);
          totalRevenue = movie?.totalRevenue || 0;
        } else {
          totalRevenue = moviesRevenue.reduce(
            (sum, movie) => sum + movie.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  } else if (viewType === "month") {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = dayjs(`${year}-${month}-${day}`);
      const startDate = currentDay.startOf("day").toISOString();
      const endDate = currentDay.endOf("day").toISOString();
      const timeKey = currentDay.format("YYYY-MM-DD");

      try {
        const moviesRevenue = await getRevenueByPeriodAndMovie(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (movieId) {
          // Filter by movie
          const movie = moviesRevenue.find((m) => m.movieId === movieId);
          totalRevenue = movie?.totalRevenue || 0;
        } else {
          totalRevenue = moviesRevenue.reduce(
            (sum, movie) => sum + movie.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  } else if (viewType === "year") {
    const year = selectedDate.year();

    for (let month = 1; month <= 12; month++) {
      const monthStart = dayjs(`${year}-${month}-1`);
      const monthEnd = monthStart.endOf("month");
      const startDate = monthStart.startOf("day").toISOString();
      const endDate = monthEnd.endOf("day").toISOString();
      const timeKey = `${year}-${String(month).padStart(2, "0")}`;

      try {
        const moviesRevenue = await getRevenueByPeriodAndMovie(
          startDate,
          endDate
        );
        let totalRevenue: number;
        if (movieId) {
          // Filter by movie
          const movie = moviesRevenue.find((m) => m.movieId === movieId);
          totalRevenue = movie?.totalRevenue || 0;
        } else {
          totalRevenue = moviesRevenue.reduce(
            (sum, movie) => sum + movie.totalRevenue,
            0
          );
        }
        data.push({ time: timeKey, revenue: totalRevenue });
      } catch (error) {
        data.push({ time: timeKey, revenue: 0 });
      }
    }
  }

  return data;
}

export function useRevenueByType(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  type: "offline" | "online"
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "revenue-by-type",
      viewType,
      selectedDate.toISOString(),
      type,
    ],
    queryFn: () => fetchRevenueByType(viewType, selectedDate, type),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

export function useRevenueByCinema(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  cinemaId?: string
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "revenue-by-cinema",
      viewType,
      selectedDate.toISOString(),
      cinemaId || "all",
    ],
    queryFn: () => fetchRevenueByCinema(viewType, selectedDate, cinemaId),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

export function useRevenueByMovie(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  movieId?: string
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "revenue-by-movie",
      viewType,
      selectedDate.toISOString(),
      movieId || "all",
    ],
    queryFn: () => fetchRevenueByMovie(viewType, selectedDate, movieId),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

// Fetch available cinemas and movies
async function fetchAvailableCinemas(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
): Promise<CinemaRevenue[]> {
  let startDate: string;
  let endDate: string;

  if (viewType === "week") {
    const startOfWeek = selectedDate.startOf("week").add(1, "day");
    const endOfWeek = startOfWeek.add(6, "days");
    startDate = startOfWeek.startOf("day").toISOString();
    endDate = endOfWeek.endOf("day").toISOString();
  } else if (viewType === "month") {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthStart = dayjs(`${year}-${month}-1`);
    const monthEnd = monthStart.endOf("month");
    startDate = monthStart.startOf("day").toISOString();
    endDate = monthEnd.endOf("day").toISOString();
  } else {
    const year = selectedDate.year();
    const yearStart = dayjs(`${year}-1-1`);
    const yearEnd = yearStart.endOf("year");
    startDate = yearStart.startOf("day").toISOString();
    endDate = yearEnd.endOf("day").toISOString();
  }

  try {
    const cinemasRevenue = await getRevenueByPeriodAndCinema(
      startDate,
      endDate
    );
    return cinemasRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    return [];
  }
}

async function fetchAvailableMovies(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
): Promise<MovieRevenue[]> {
  let startDate: string;
  let endDate: string;

  if (viewType === "week") {
    const startOfWeek = selectedDate.startOf("week").add(1, "day");
    const endOfWeek = startOfWeek.add(6, "days");
    startDate = startOfWeek.startOf("day").toISOString();
    endDate = endOfWeek.endOf("day").toISOString();
  } else if (viewType === "month") {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const monthStart = dayjs(`${year}-${month}-1`);
    const monthEnd = monthStart.endOf("month");
    startDate = monthStart.startOf("day").toISOString();
    endDate = monthEnd.endOf("day").toISOString();
  } else {
    const year = selectedDate.year();
    const yearStart = dayjs(`${year}-1-1`);
    const yearEnd = yearStart.endOf("year");
    startDate = yearStart.startOf("day").toISOString();
    endDate = yearEnd.endOf("day").toISOString();
  }

  try {
    const moviesRevenue = await getRevenueByPeriodAndMovie(startDate, endDate);
    return moviesRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    return [];
  }
}

export function useAvailableCinemas(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "available-cinemas",
      viewType,
      selectedDate.toISOString(),
    ],
    queryFn: () => fetchAvailableCinemas(viewType, selectedDate),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

export function useAvailableMovies(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "available-movies",
      viewType,
      selectedDate.toISOString(),
    ],
    queryFn: () => fetchAvailableMovies(viewType, selectedDate),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}
