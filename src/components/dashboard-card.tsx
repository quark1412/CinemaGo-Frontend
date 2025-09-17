type DashboardCardProps = {
  title: string;
  value: number;
  description: string;
};

export function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-md border">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground font-light text-sm">{title}</p>
        <p className="text-3xl font-extrabold text-primary">{value}</p>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
