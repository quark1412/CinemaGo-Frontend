"use client";

import { DashboardCard } from "@/components/dashboard-card";
import { RevenueChart } from "@/components/revenue-chart";
import {
  useDashboardStatistics,
  useMonthlyRevenue,
} from "@/hooks/use-dashboard";
import { Film, Theater, Users, ShoppingCart } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export default function Dashboard() {
  const { t } = useI18n();
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
          title={t("dashboard.totalMovies")}
          value={statistics?.totalMovies || 0}
          description={t("dashboard.totalMoviesDesc")}
          icon={Film}
        />
        <DashboardCard
          title={t("dashboard.totalCinemas")}
          value={statistics?.totalCinemas || 0}
          description={t("dashboard.totalCinemasDesc")}
          icon={Theater}
        />
        <DashboardCard
          title={t("dashboard.totalUsers")}
          value={statistics?.totalUsers || 0}
          description={t("dashboard.totalUsersDesc")}
          icon={Users}
        />
        <DashboardCard
          title={t("dashboard.totalBookings")}
          value={statistics?.totalBookings || 0}
          description={t("dashboard.totalBookingsDesc")}
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
