"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  allCities?: string[];
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
  onCityChange?: (city: string) => void;
  onStatusChange?: (status: string) => void;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  allCities = [],
  onCreateClick,
  pagination,
  onPaginationChange,
  onSearchChange,
  onCityChange,
  onStatusChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cities = useMemo(() => {
    if (allCities.length > 0) {
      return allCities;
    }
    const citySet = new Set<string>();
    (data as any[]).forEach((item) => {
      if (item?.city) {
        citySet.add(item.city as string);
      }
    });
    return Array.from(citySet).sort();
  }, [allCities, data]);

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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 py-4 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <Input
            placeholder={t("cinemas.searchCinemas") + "..."}
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);

              table.getColumn("name")?.setFilterValue(value);

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

          {/* City filter */}
          <Select
            value={selectedCity || "all"}
            onValueChange={(value) => {
              const cityValue = value === "all" ? "" : value;
              setSelectedCity(cityValue);
              onCityChange?.(cityValue);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("cinemas.filterCinemas.allCities")}
              </SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) => {
              const statusValue = value === "all" ? "" : value;
              setSelectedStatus(statusValue);
              onStatusChange?.(statusValue);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("cinemas.filterCinemas.allStatus")}
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

        {/* Add Cinema */}
        <Button
          onClick={onCreateClick}
          className="gap-2 self-start sm:self-auto"
        >
          <CirclePlus className="h-4 w-4" />
          {t("cinemas.createCinema.title")}
        </Button>
      </div>

      {/* Table */}
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
