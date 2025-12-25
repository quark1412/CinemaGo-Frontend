"use client";

import * as React from "react";

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
  UserPlus,
} from "lucide-react";
import { GenresSkeleton } from "@/components/genres-skeleton";
import { useI18n } from "@/contexts/I18nContext";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreateClick,
  pagination,
  onPaginationChange,
  onSearchChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

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

  if (loading) {
    return <GenresSkeleton />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
        <Input
          placeholder={t("users.search")}
          value={
            (table.getColumn("fullname")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) => {
            const value = event.target.value;
            if (pagination && onSearchChange) {
              onSearchChange(value);
            } else {
              table.getColumn("fullname")?.setFilterValue(value);
            }
          }}
          className="max-w-sm text-xs placeholder:text-[13px] placeholder:font-medium"
        />
        <Button variant="default" size="default" onClick={onCreateClick}>
          <UserPlus />
          <span className="text-sm font-medium">
            {" "}
            {t("users.createUser.title")}
          </span>
        </Button>
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
                    No results.
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
