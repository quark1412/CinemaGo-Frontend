import instance from "@/configs/axiosConfig";

export interface DashboardStatistics {
  totalMovies: number;
  totalCinemas: number;
  totalUsers: number;
  totalBookings: number;
}

export interface RevenueData {
  totalRevenue: number;
  totalRevenueFromFoodDrink: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  foodDrinkRevenue: number;
}

export const getDashboardStatistics =
  async (): Promise<DashboardStatistics> => {
    try {
      const [moviesRes, cinemasRes, usersRes] = await Promise.all([
        instance.get("/v1/movies/dashboard/total-count", {
          requiresAuth: true,
        } as any),
        instance.get("/v1/cinemas/dashboard/total-count", {
          requiresAuth: true,
        } as any),
        instance.get("/v1/users/dashboard/total-count", {
          requiresAuth: true,
        } as any),
      ]);

      let totalBookings = 0;
      try {
        const bookingsRes = await instance.get("/v1/bookings", {
          requiresAuth: true,
          params: { page: 1, limit: 1 },
        } as any);
        totalBookings = bookingsRes.data.pagination?.totalItems || 0;
      } catch (error) {
        console.log("Failed to fetch bookings count:", error);
      }

      return {
        totalMovies: moviesRes.data.data.totalMovies || 0,
        totalCinemas: cinemasRes.data.data.totalCinemas || 0,
        totalUsers: usersRes.data.data.totalUsers || 0,
        totalBookings,
      };
    } catch (error) {
      throw error;
    }
  };

export const getRevenueByPeriod = async (
  startDate: string,
  endDate: string,
  type?: string
): Promise<RevenueData> => {
  try {
    const params: any = { startDate, endDate };
    if (type) {
      params.type = type;
    }
    const response = await instance.get("/v1/bookings/dashboard/revenue", {
      params,
      requiresAuth: true,
    } as any);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export interface CinemaRevenue {
  cinemaId: string;
  cinemaName: string;
  totalRevenue: number;
}

export interface MovieRevenue {
  movieId: string;
  movieName: string;
  totalRevenue: number;
}

export const getRevenueByPeriodAndCinema = async (
  startDate: string,
  endDate: string,
  type?: string
): Promise<CinemaRevenue[]> => {
  try {
    const params: any = { startDate, endDate };
    if (type) {
      params.type = type;
    }
    const response = await instance.get(
      "/v1/bookings/dashboard/revenue/cinema",
      {
        params,
        requiresAuth: true,
      } as any
    );
    const data = response.data.data;
    // Handle both old and new response formats
    if (data?.cinemasRevenue) {
      return data.cinemasRevenue.map((item: any) => ({
        cinemaId: item.cinema?.id || item.cinemaId,
        cinemaName: item.cinema?.name || item.cinemaName,
        totalRevenue: item.totalRevenue || 0,
      }));
    }
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        cinemaId: item.cinema?.id || item.cinemaId,
        cinemaName: item.cinema?.name || item.cinemaName,
        totalRevenue: item.totalRevenue || 0,
      }));
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const getRevenueByPeriodAndMovie = async (
  startDate: string,
  endDate: string,
  type?: string
): Promise<MovieRevenue[]> => {
  try {
    const params: any = { startDate, endDate };
    if (type) {
      params.type = type;
    }
    const response = await instance.get(
      "/v1/bookings/dashboard/revenue/movie",
      {
        params,
        requiresAuth: true,
      } as any
    );
    const data = response.data.data;
    // Handle both old and new response formats
    if (data?.moviesRevenue) {
      return data.moviesRevenue.map((item: any) => ({
        movieId: item.movie?.id || item.movieId,
        movieName: item.movie?.title || item.movieName,
        totalRevenue: item.totalRevenue || 0,
      }));
    }
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        movieId: item.movie?.id || item.movieId,
        movieName: item.movie?.title || item.movieName,
        totalRevenue: item.totalRevenue || 0,
      }));
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const getMonthlyRevenue = async (
  year: number
): Promise<MonthlyRevenue[]> => {
  try {
    const months: MonthlyRevenue[] = [];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthPromises = Array.from({ length: 12 }, async (_, index) => {
      const monthStart = new Date(year, index, 1);
      const monthEnd = new Date(year, index + 1, 0, 23, 59, 59, 999);

      try {
        const revenue = await getRevenueByPeriod(
          monthStart.toISOString(),
          monthEnd.toISOString()
        );

        return {
          month: monthStart.toLocaleDateString("vi-VN", { month: "short" }),
          revenue: revenue.totalRevenue,
          foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        };
      } catch (error) {
        return {
          month: monthStart.toLocaleDateString("vi-VN", { month: "short" }),
          revenue: 0,
          foodDrinkRevenue: 0,
        };
      }
    });

    return Promise.all(monthPromises);
  } catch (error) {
    throw error;
  }
};
