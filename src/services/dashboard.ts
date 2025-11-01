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
        instance.get("/movies/dashboard/total-count", {
          requiresAuth: true,
        } as any),
        instance.get("/cinemas/dashboard/total-count", {
          requiresAuth: true,
        } as any),
        instance.get("/users/dashboard/total-count", {
          requiresAuth: true,
        } as any),
      ]);

      let totalBookings = 0;
      try {
        const bookingsRes = await instance.get("/bookings", {
          requiresAuth: true,
          params: { page: 1, limit: 1 },
        } as any);
        totalBookings = bookingsRes.data.pagination?.totalItems || 0;
      } catch (error) {
        console.error("Failed to fetch bookings count:", error);
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
  endDate: string
): Promise<RevenueData> => {
  try {
    const response = await instance.get("/bookings/dashboard/revenue", {
      params: { startDate, endDate },
      requiresAuth: true,
    } as any);
    return response.data.data;
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
          month: monthStart.toLocaleDateString("en-US", { month: "short" }),
          revenue: revenue.totalRevenue,
          foodDrinkRevenue: revenue.totalRevenueFromFoodDrink,
        };
      } catch (error) {
        return {
          month: monthStart.toLocaleDateString("en-US", { month: "short" }),
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
