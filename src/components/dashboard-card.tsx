import { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: number;
  description: string;
  icon?: LucideIcon;
};

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-md border">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground font-light text-sm">{title}</p>
          <p className="text-3xl font-extrabold text-primary">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
