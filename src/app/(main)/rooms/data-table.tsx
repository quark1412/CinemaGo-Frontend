"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface CinemaOption {
  id: string;
  name: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  cinemas?: CinemaOption[];
  onCreateClick: () => void;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: "all" | "active" | "inactive") => void;
  onCinemaChange?: (cinemaId: string | "all") => void;
  loading?: boolean;
}

export function RoomDataTable<TData, TValue>({
  columns,
  data,
  cinemas = [],
  onCreateClick,
  pagination,
  onPaginationChange,
  onSearchChange,
  onStatusChange,
  onCinemaChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [cinemaFilter, setCinemaFilter] = React.useState<string | "all">("all");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = (page: number) => {
    onPaginationChange?.(page, pagination?.pageSize || 10);
  };

  const handlePageSizeChange = (pageSize: string) => {
    onPaginationChange?.(1, parseInt(pageSize));
  };

  // if (loading) {
  //   return (
  //     <div className="flex flex-col h-full">
  //       <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
  //         <div className="h-10 max-w-sm w-80 bg-gray-200 animate-pulse rounded"></div>
  //         <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
  //       </div>

  //       <div className="overflow-hidden rounded-md border flex-1 min-h-0">
  //         <div className="h-full overflow-auto">
  //           <Table>
  //             <TableHeader className="sticky top-0 bg-background z-10">
  //               <TableRow>
  //                 {Array.from({ length: 6 }).map((_, index) => (
  //                   <TableHead key={index}>
  //                     <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
  //                   </TableHead>
  //                 ))}
  //               </TableRow>
  //             </TableHeader>
  //             <TableBody>
  //               {Array.from({ length: 10 }).map((_, index) => (
  //                 <TableRow key={index}>
  //                   {Array.from({ length: 6 }).map((_, cellIndex) => (
  //                     <TableCell key={cellIndex}>
  //                       <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
  //                     </TableCell>
  //                   ))}
  //                 </TableRow>
  //               ))}
  //             </TableBody>
  //           </Table>
  //         </div>
  //       </div>

  //       {/* Pagination */}
  //       <div className="flex items-center justify-end space-x-2 py-4 flex-shrink-0">
  //         <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
  //         <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 py-4 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={t("rooms.searchRooms") + "..."}
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);

              if (pagination && onSearchChange) {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }

                searchTimeoutRef.current = setTimeout(() => {
                  onSearchChange(value);
                }, 500);
              }
            }}
            className="max-w-sm"
          />

          {/* Cinema filter */}
          <Select
            value={cinemaFilter}
            onValueChange={(value) => {
              const typedValue = value as string | "all";
              setCinemaFilter(typedValue);
              onCinemaChange?.(typedValue);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("rooms.filterRooms.cinema")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("rooms.filterRooms.allCinemas")}
              </SelectItem>
              {cinemas.map((cinema) => (
                <SelectItem key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              const typedValue = value as "all" | "active" | "inactive";
              setStatusFilter(typedValue);
              onStatusChange?.(typedValue);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("rooms.filterRooms.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("rooms.filterRooms.allStatus")}
              </SelectItem>
              <SelectItem value="active">
                {t("common.status.active")}
              </SelectItem>
              <SelectItem value="inactive">
                {t("common.status.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onCreateClick}
          className="gap-2 self-start sm:self-auto"
        >
          <CirclePlus className="h-4 w-4" />
          {t("rooms.createRoom.title")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{t("common.rowsPerPage")}</p>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {t("common.page")} {pagination.currentPage} {t("common.of")}{" "}
              {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrevPage}
              >
                <span className="sr-only">{t("common.goToFirstPage")}</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <span className="sr-only">{t("common.goToPreviousPage")}</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                <span className="sr-only">{t("common.goToNextPage")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
              >
                <span className="sr-only">{t("common.goToLastPage")}</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
