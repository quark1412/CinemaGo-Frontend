import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MoviesSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
        {/* Search */}
        <Skeleton className="h-10 max-w-sm w-80" />
        {/* Add Movie */}
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-14" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {/* Title */}
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </TableCell>

                  {/* Genres */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-60">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>

                  {/* Release Date */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4 flex-shrink-0">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
