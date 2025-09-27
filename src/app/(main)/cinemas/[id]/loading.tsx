import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Cinema Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table */}
        <div className="border rounded-md">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
