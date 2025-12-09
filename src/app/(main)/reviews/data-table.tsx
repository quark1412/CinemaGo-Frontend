"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
  X, // Import icon X
} from "lucide-react";
import { GenresSkeleton } from "@/components/genres-skeleton";
import { useI18n } from "@/contexts/I18nContext";

// Định nghĩa Option cho Movie dropdown
export type Option = {
  label: string;
  value: string;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;

  // --- CÁC HÀM FILTER MỚI ---
  onMovieChange?: (movieId: string) => void;
  onStatusChange?: (status: string) => void;
  onVisibilityChange?: (visibility: string) => void;

  movieOptions?: Option[]; // Danh sách phim để chọn
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,

  // Destructuring các hàm filter mới
  onMovieChange,
  onStatusChange,
  onVisibilityChange,
  movieOptions = [],

  loading = false,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  // Local state để hiển thị giá trị đang chọn trên UI
  const [selectedMovie, setSelectedMovie] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedVisibility, setSelectedVisibility] =
    React.useState<string>("all");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
  });

  // Hàm reset filter
  const handleClearFilters = () => {
    setSelectedMovie("all");
    setSelectedStatus("all");
    setSelectedVisibility("all");
    onMovieChange?.("");
    onStatusChange?.("");
    onVisibilityChange?.("");
  };

  const hasActiveFilters =
    selectedMovie !== "all" ||
    selectedStatus !== "all" ||
    selectedVisibility !== "all";

  if (loading) return <GenresSkeleton />;

  return (
    <div className="flex flex-col">
      <div className="flex items-center py-4 flex-shrink-0 gap-2">
        {/* 1. Filter Movie */}
        <Select
          value={selectedMovie}
          onValueChange={(val) => {
            setSelectedMovie(val);
            onMovieChange?.(val === "all" ? "" : val);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("movies.searchMovies") + "..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("reviews.searchallfilms")}</SelectItem>
            {movieOptions.map((movie) => (
              <SelectItem key={movie.value} value={movie.value}>
                {movie.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 2. Filter Status (Replied/Unreplied) */}
        <Select
          value={selectedStatus}
          onValueChange={(val) => {
            setSelectedStatus(val);
            onStatusChange?.(val === "all" ? "" : val);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("reviews.filterReviews.allStatus")}
            </SelectItem>
            <SelectItem value="Đã trả lời">
              {t("reviews.filterReviews.replied")}
            </SelectItem>
            <SelectItem value="Chưa trả lời">
              {t("reviews.filterReviews.Unreplied")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* 3. Filter Visibility (Visible/Hidden) */}
        <Select
          value={selectedVisibility}
          onValueChange={(val) => {
            setSelectedVisibility(val);
            onVisibilityChange?.(val === "all" ? "" : val);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Hiển thị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("reviews.filterReviews.allVisible")}
            </SelectItem>
            <SelectItem value="visible">
              {t("reviews.filterReviews.active")}
            </SelectItem>
            <SelectItem value="hidden">
              {" "}
              {t("reviews.filterReviews.inactive")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-md border flex-1 min-h-0">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs">
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
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs">
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

      <div className="flex items-center justify-between space-x-6 lg:space-x-8 mt-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t("common.rowsPerPage")}</p>
          <Select
            value={`${
              pagination?.pageSize || table.getState().pagination.pageSize
            }`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              if (pagination && onPaginationChange) {
                onPaginationChange(1, newPageSize);
              } else {
                table.setPageSize(newPageSize);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue
                placeholder={
                  pagination?.pageSize || table.getState().pagination.pageSize
                }
              />
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
            {t("common.page")} {pagination?.currentPage} {t("common.of")}{" "}
            {pagination?.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (pagination && onPaginationChange) {
                  onPaginationChange(1, pagination.pageSize);
                } else {
                  table.setPageIndex(0);
                }
              }}
              disabled={
                pagination
                  ? !pagination.hasPrevPage
                  : !table.getCanPreviousPage()
              }
            >
              <span className="sr-only">{t("common.goToFirstPage")}</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (pagination && onPaginationChange) {
                  onPaginationChange(
                    pagination.currentPage - 1,
                    pagination.pageSize
                  );
                } else {
                  table.previousPage();
                }
              }}
              disabled={
                pagination
                  ? !pagination.hasPrevPage
                  : !table.getCanPreviousPage()
              }
            >
              <span className="sr-only">{t("common.goToPreviousPage")}</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (pagination && onPaginationChange) {
                  onPaginationChange(
                    pagination.currentPage + 1,
                    pagination.pageSize
                  );
                } else {
                  table.nextPage();
                }
              }}
              disabled={
                pagination ? !pagination.hasNextPage : !table.getCanNextPage()
              }
            >
              <span className="sr-only">{t("common.goToNextPage")}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                if (pagination && onPaginationChange) {
                  onPaginationChange(
                    pagination.totalPages,
                    pagination.pageSize
                  );
                } else {
                  table.setPageIndex(table.getPageCount() - 1);
                }
              }}
              disabled={
                pagination ? !pagination.hasNextPage : !table.getCanNextPage()
              }
            >
              <span className="sr-only">{t("common.goToLastPage")}</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
