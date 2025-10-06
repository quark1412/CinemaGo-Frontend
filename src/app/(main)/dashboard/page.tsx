import { DashboardCard } from "@/components/dashboard-card";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-4">
      <DashboardCard
        title="Total Movies"
        value={100}
        description="Total movies in the database"
      />
      <DashboardCard
        title="Total Movies"
        value={100}
        description="Total movies in the database"
      />
      <DashboardCard
        title="Total Movies"
        value={100}
        description="Total movies in the database"
      />
      <DashboardCard
        title="Total Movies"
        value={100}
        description="Total movies in the database"
      />
    </div>
  );
}
