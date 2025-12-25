"use client";

import React, { useEffect, useRef, useState } from "react";

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
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

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
  onSearchChange?: (search: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  loading?: boolean;
  onCreateClick?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSearchChange,
  onFilterChange,
  loading = false,
  onCreateClick,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: pagination ? undefined : getFilteredRowModel(),
    manualPagination: !!pagination,
    manualFiltering: !!pagination,
    pageCount: pagination?.totalPages ?? -1,
    state: {
      sorting,
      columnFilters,
      pagination: pagination
        ? {
            pageIndex: (pagination.currentPage || 1) - 1,
            pageSize: pagination.pageSize || 10,
          }
        : undefined,
    },
  });

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
        <div className="flex items-center gap-6">
          <Input
            placeholder={t("movies.searchMovies") + "..."}
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);

              table.getColumn("title")?.setFilterValue(value);

              if (pagination && onSearchChange) {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }

                searchTimeoutRef.current = setTimeout(() => {
                  onSearchChange(value);
                }, 500);
              }
            }}
            className="max-w-sm text-xs placeholder:text-[13px] placeholder:font-medium"
          />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) => {
                const normalizedValue =
                  value === t("movies.filterMovies.all") ? "" : value;

                table.getColumn("status")?.setFilterValue(normalizedValue);

                if (pagination && onFilterChange) {
                  onFilterChange("status", normalizedValue);
                }
              }}
            >
              <SelectTrigger className="w-fit text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all" className="text-xs">
                  {t("movies.filterMovies.allMovieStatus")}
                </SelectItem>
                <SelectItem value="NOW_SHOWING" className="text-xs">
                  {t("movies.filterMovies.NOW_SHOWING")}
                </SelectItem>
                <SelectItem value="COMING_SOON" className="text-xs">
                  {t("movies.filterMovies.COMING_SOON")}
                </SelectItem>
                <SelectItem value="ENDED" className="text-xs">
                  {t("movies.filterMovies.ENDED")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Select
              value={
                (table.getColumn("isActive")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) => {
                const normalizedValue = value === "all" ? "" : value;

                table.getColumn("isActive")?.setFilterValue(normalizedValue);

                if (pagination && onFilterChange) {
                  onFilterChange("isActive", normalizedValue);
                }
              }}
            >
              <SelectTrigger className="w-fit text-xs">
                <SelectValue placeholder="Filter by active" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all" className="text-xs">
                  {t("movies.filterMovies.allActiveStatus")}
                </SelectItem>
                <SelectItem value="true" className="text-xs">
                  {t("movies.filterMovies.active")}
                </SelectItem>
                <SelectItem value="false" className="text-xs">
                  {t("movies.filterMovies.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {onCreateClick ? (
          <Button
            variant="default"
            size="default"
            type="button"
            onClick={onCreateClick}
            className="gap-2 cursor-pointer"
          >
            <CirclePlus />
            <span className="text-sm font-medium">
              {t("movies.createMovie.title")}
            </span>
          </Button>
        ) : (
          <Button
            variant="default"
            size="default"
            asChild
            className="gap-2 cursor-pointer"
          >
            <Link href="/movies/create">
              <CirclePlus />
              <span className="text-sm font-medium">
                {t("movies.createMovie.title")}
              </span>
            </Link>
          </Button>
        )}
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
              <SelectValue placeholder="10" />
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
            {t("common.page")}{" "}
            {pagination?.currentPage ||
              table.getState().pagination.pageIndex + 1}{" "}
            {t("common.of")} {pagination?.totalPages || table.getPageCount()}
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
