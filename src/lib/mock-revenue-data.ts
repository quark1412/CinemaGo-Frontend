export interface MockRevenueDataPoint {
  time: string;
  offlineTicket: number;
  offlineFoodDrink: number;
  onlineTicket: number;
  onlineFoodDrink: number;
}

export const mockWeeklyRevenueData: MockRevenueDataPoint[] = [
  {
    time: "2025-11-17",
    offlineTicket: 1500000,
    offlineFoodDrink: 300000,
    onlineTicket: 1200000,
    onlineFoodDrink: 250000,
  },
  {
    time: "2025-11-18",
    offlineTicket: 1800000,
    offlineFoodDrink: 350000,
    onlineTicket: 1500000,
    onlineFoodDrink: 300000,
  },
  {
    time: "2025-11-19",
    offlineTicket: 1600000,
    offlineFoodDrink: 320000,
    onlineTicket: 1400000,
    onlineFoodDrink: 280000,
  },
  {
    time: "2025-11-20",
    offlineTicket: 2000000,
    offlineFoodDrink: 400000,
    onlineTicket: 1800000,
    onlineFoodDrink: 350000,
  },
  {
    time: "2025-11-21",
    offlineTicket: 2200000,
    offlineFoodDrink: 450000,
    onlineTicket: 2000000,
    onlineFoodDrink: 400000,
  },
  {
    time: "2025-11-22",
    offlineTicket: 2500000,
    offlineFoodDrink: 500000,
    onlineTicket: 2200000,
    onlineFoodDrink: 450000,
  },
  {
    time: "2025-11-23",
    offlineTicket: 2400000,
    offlineFoodDrink: 480000,
    onlineTicket: 2100000,
    onlineFoodDrink: 420000,
  },
];

export const mockMonthlyRevenueData: MockRevenueDataPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const day = i + 1;
    const baseTicket = 1500000 + Math.random() * 1000000;
    const baseFoodDrink = baseTicket * 0.2;
    return {
      time: `2024-01-${String(day).padStart(2, "0")}`,
      offlineTicket: Math.floor(baseTicket * (0.5 + Math.random() * 0.3)),
      offlineFoodDrink: Math.floor(baseFoodDrink * (0.5 + Math.random() * 0.3)),
      onlineTicket: Math.floor(baseTicket * (0.4 + Math.random() * 0.3)),
      onlineFoodDrink: Math.floor(baseFoodDrink * (0.4 + Math.random() * 0.3)),
    };
  }
);

export const mockYearlyRevenueData: MockRevenueDataPoint[] = [
  {
    time: "2024-01",
    offlineTicket: 45000000,
    offlineFoodDrink: 9000000,
    onlineTicket: 38000000,
    onlineFoodDrink: 7500000,
  },
  {
    time: "2024-02",
    offlineTicket: 42000000,
    offlineFoodDrink: 8400000,
    onlineTicket: 36000000,
    onlineFoodDrink: 7200000,
  },
  {
    time: "2024-03",
    offlineTicket: 48000000,
    offlineFoodDrink: 9600000,
    onlineTicket: 40000000,
    onlineFoodDrink: 8000000,
  },
  {
    time: "2024-04",
    offlineTicket: 46000000,
    offlineFoodDrink: 9200000,
    onlineTicket: 39000000,
    onlineFoodDrink: 7800000,
  },
  {
    time: "2024-05",
    offlineTicket: 50000000,
    offlineFoodDrink: 10000000,
    onlineTicket: 42000000,
    onlineFoodDrink: 8400000,
  },
  {
    time: "2024-06",
    offlineTicket: 52000000,
    offlineFoodDrink: 10400000,
    onlineTicket: 44000000,
    onlineFoodDrink: 8800000,
  },
  {
    time: "2024-07",
    offlineTicket: 55000000,
    offlineFoodDrink: 11000000,
    onlineTicket: 46000000,
    onlineFoodDrink: 9200000,
  },
  {
    time: "2024-08",
    offlineTicket: 54000000,
    offlineFoodDrink: 10800000,
    onlineTicket: 45000000,
    onlineFoodDrink: 9000000,
  },
  {
    time: "2024-09",
    offlineTicket: 48000000,
    offlineFoodDrink: 9600000,
    onlineTicket: 40000000,
    onlineFoodDrink: 8000000,
  },
  {
    time: "2024-10",
    offlineTicket: 50000000,
    offlineFoodDrink: 10000000,
    onlineTicket: 42000000,
    onlineFoodDrink: 8400000,
  },
  {
    time: "2024-11",
    offlineTicket: 46000000,
    offlineFoodDrink: 9200000,
    onlineTicket: 39000000,
    onlineFoodDrink: 7800000,
  },
  {
    time: "2024-12",
    offlineTicket: 52000000,
    offlineFoodDrink: 10400000,
    onlineTicket: 44000000,
    onlineFoodDrink: 8800000,
  },
];

export function getMockRevenueData(
  viewType: "week" | "month" | "year"
): MockRevenueDataPoint[] {
  switch (viewType) {
    case "week":
      return mockWeeklyRevenueData;
    case "month":
      return mockMonthlyRevenueData;
    case "year":
      return mockYearlyRevenueData;
    default:
      return mockWeeklyRevenueData;
  }
}
