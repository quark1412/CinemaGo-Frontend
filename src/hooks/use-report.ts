import { useQuery } from "@tanstack/react-query";
import {
  getRevenueByPeriod,
  getRevenueByPeriodAndCinema,
  getRevenueByPeriodAndMovie,
  CinemaRevenue,
  MovieRevenue,
} from "@/services/dashboard";
import { getAllCinemas } from "@/services/cinemas";
import { getAllMovies } from "@/services/movies";
import dayjs, { Dayjs } from "dayjs";

function getMondayOfWeek(date: Dayjs): Dayjs {
  const dayOfWeek = date.day();
  let daysToSubtract: number;
  if (dayOfWeek === 0) {
    daysToSubtract = 6;
  } else {
    daysToSubtract = dayOfWeek - 1;
  }
  return date.subtract(daysToSubtract, "day").startOf("day");
}

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
  const startOfWeek = getMondayOfWeek(date);
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
    const startOfWeek = getMondayOfWeek(selectedDate);
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

async function fetchAllCinemaRevenueData(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
): Promise<Map<string, CinemaRevenue[]>> {
  const revenueMap = new Map<string, CinemaRevenue[]>();

  if (viewType === "week") {
    const startOfWeek = getMondayOfWeek(selectedDate);
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
        revenueMap.set(timeKey, cinemasRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
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
        revenueMap.set(timeKey, cinemasRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
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
        revenueMap.set(timeKey, cinemasRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
      }
    }
  }

  return revenueMap;
}

// Fetch revenue by cinema
function filterCinemaRevenueData(
  revenueMap: Map<string, CinemaRevenue[]>,
  cinemaId?: string
): { time: string; revenue: number }[] {
  const data: { time: string; revenue: number }[] = [];

  revenueMap.forEach((cinemasRevenue, timeKey) => {
    let totalRevenue: number;
    if (cinemaId) {
      const cinema = cinemasRevenue.find((c) => c.cinemaId === cinemaId);
      totalRevenue = cinema?.totalRevenue || 0;
    } else {
      totalRevenue = cinemasRevenue.reduce(
        (sum, cinema) => sum + cinema.totalRevenue,
        0
      );
    }
    data.push({ time: timeKey, revenue: totalRevenue });
  });

  return data.sort((a, b) => a.time.localeCompare(b.time));
}

// Fetch all movie revenue data for the entire date range and store in map
async function fetchAllMovieRevenueData(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
): Promise<Map<string, MovieRevenue[]>> {
  const revenueMap = new Map<string, MovieRevenue[]>();

  if (viewType === "week") {
    const startOfWeek = getMondayOfWeek(selectedDate);
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
        revenueMap.set(timeKey, moviesRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
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
        revenueMap.set(timeKey, moviesRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
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
        revenueMap.set(timeKey, moviesRevenue);
      } catch (error) {
        revenueMap.set(timeKey, []);
      }
    }
  }

  return revenueMap;
}

// Fetch revenue by movie
function filterMovieRevenueData(
  revenueMap: Map<string, MovieRevenue[]>,
  movieId?: string
): { time: string; revenue: number }[] {
  const data: { time: string; revenue: number }[] = [];

  revenueMap.forEach((moviesRevenue, timeKey) => {
    let totalRevenue: number;
    if (movieId) {
      const movie = moviesRevenue.find((m) => m.movieId === movieId);
      totalRevenue = movie?.totalRevenue || 0;
    } else {
      totalRevenue = moviesRevenue.reduce(
        (sum, movie) => sum + movie.totalRevenue,
        0
      );
    }
    data.push({ time: timeKey, revenue: totalRevenue });
  });

  return data.sort((a, b) => a.time.localeCompare(b.time));
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

// Fetch all cinema revenue data
export function useAllCinemaRevenueData(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "all-cinema-revenue",
      viewType,
      selectedDate.toISOString(),
    ],
    queryFn: () => fetchAllCinemaRevenueData(viewType, selectedDate),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

// Fetch all movie revenue data
export function useAllMovieRevenueData(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs
) {
  return useQuery({
    queryKey: [
      ...reportKeys.all,
      "all-movie-revenue",
      viewType,
      selectedDate.toISOString(),
    ],
    queryFn: () => fetchAllMovieRevenueData(viewType, selectedDate),
    enabled: !!selectedDate,
    staleTime: 60 * 1000,
  });
}

// Get filtered cinema revenue
export function useRevenueByCinema(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  cinemaId?: string
) {
  const { data: revenueMap } = useAllCinemaRevenueData(viewType, selectedDate);

  return {
    data: revenueMap
      ? filterCinemaRevenueData(revenueMap, cinemaId)
      : undefined,
    isLoading: !revenueMap,
  };
}

// Get filtered movie revenue
export function useRevenueByMovie(
  viewType: "week" | "month" | "year",
  selectedDate: dayjs.Dayjs,
  movieId?: string
) {
  const { data: revenueMap } = useAllMovieRevenueData(viewType, selectedDate);

  return {
    data: revenueMap ? filterMovieRevenueData(revenueMap, movieId) : undefined,
    isLoading: !revenueMap,
  };
}

async function fetchAvailableCinemas(): Promise<
  { cinemaId: string; cinemaName: string }[]
> {
  try {
    const response = await getAllCinemas({
      limit: undefined,
      isActive: true,
    });
    return (
      response.data?.map((cinema) => ({
        cinemaId: cinema.id,
        cinemaName: cinema.name,
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch cinemas:", error);
    return [];
  }
}

async function fetchAvailableMovies(): Promise<
  { movieId: string; movieName: string }[]
> {
  try {
    const response = await getAllMovies({
      limit: undefined,
      isActive: true,
    });
    return (
      response.data?.map((movie) => ({
        movieId: movie.id,
        movieName: movie.title,
      })) || []
    );
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
}

export function useAvailableCinemas() {
  return useQuery({
    queryKey: [...reportKeys.all, "available-cinemas"],
    queryFn: fetchAvailableCinemas,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailableMovies() {
  return useQuery({
    queryKey: [...reportKeys.all, "available-movies"],
    queryFn: fetchAvailableMovies,
    staleTime: 5 * 60 * 1000,
  });
}
