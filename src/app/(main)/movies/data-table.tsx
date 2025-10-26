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
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
} from "lucide-react";

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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSearchChange,
  onFilterChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
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

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-4 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter movies..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              if (pagination && onSearchChange) {
                onSearchChange(value);
              } else {
                table.getColumn("title")?.setFilterValue(value);
              }
            }}
            className="max-w-sm text-xs placeholder:text-[13px] placeholder:font-medium"
          />
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => {
              if (pagination && onFilterChange) {
                onFilterChange("status", value === "all" ? "" : value);
              } else {
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="NOW_SHOWING">Now Showing</SelectItem>
              <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
              <SelectItem value="ENDED">Ended</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("isActive")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) => {
              if (pagination && onFilterChange) {
                onFilterChange("isActive", value === "all" ? "" : value);
              } else {
                table
                  .getColumn("isActive")
                  ?.setFilterValue(value === "all" ? "" : value);
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Movies</SelectItem>
              <SelectItem value="true">Active Only</SelectItem>
              <SelectItem value="false">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="default" size="default">
          <CirclePlus />
          <Link href="/movies/create" className="text-sm font-medium">
            Add Movie
          </Link>
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
          <p className="text-sm font-medium">Rows per page</p>
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
            Page{" "}
            {pagination?.currentPage ||
              table.getState().pagination.pageIndex + 1}{" "}
            of {pagination?.totalPages || table.getPageCount()}
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
              <span className="sr-only">Go to first page</span>
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
              <span className="sr-only">Go to previous page</span>
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
              <span className="sr-only">Go to next page</span>
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
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
