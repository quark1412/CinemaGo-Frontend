"use client";

import { DashboardCard } from "@/components/dashboard-card";
import { RevenueChart } from "@/components/revenue-chart";
import {
  useDashboardStatistics,
  useMonthlyRevenue,
} from "@/hooks/use-dashboard";
import { Film, Theater, Users, ShoppingCart } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const { data: statistics, isLoading: statsLoading } =
    useDashboardStatistics();
  const { data: monthlyRevenue, isLoading: revenueLoading } =
    useMonthlyRevenue(currentYear);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-4">
        <DashboardCard
          title="Total Movies"
          value={statistics?.totalMovies || 0}
          description="Total movies in the database"
          icon={Film}
        />
        <DashboardCard
          title="Total Cinemas"
          value={statistics?.totalCinemas || 0}
          description="Total cinemas available"
          icon={Theater}
        />
        <DashboardCard
          title="Total Users"
          value={statistics?.totalUsers || 0}
          description="Total registered users"
          icon={Users}
        />
        <DashboardCard
          title="Total Bookings"
          value={statistics?.totalBookings || 0}
          description="Total bookings made"
          icon={ShoppingCart}
        />
      </div>

      {revenueLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        monthlyRevenue && (
          <RevenueChart data={monthlyRevenue} year={currentYear} />
        )
      )}
    </div>
  );
}
