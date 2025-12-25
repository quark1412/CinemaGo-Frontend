import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GenresSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
        {/* Search */}
        <Skeleton className="h-10 max-w-sm w-80" />
        {/* Add Genre Button */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {/* Name */}
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                {/* Description */}
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                {/* Status */}
                <TableHead>
                  <Skeleton className="h-4 w-14" />
                </TableHead>
                {/* Created */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Updated */}
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {/* Actions */}
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {/* Name */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>

                  {/* Updated */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-6 lg:space-x-8 mt-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
