"use client";
import { useEffect, useRef, useState } from "react";
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
  X,
} from "lucide-react";

// import { useI18n } from "@/contexts/I18nContext";

type SelectOption = {
  value: string;
  label: string;
  meta: string;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;

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
  onTypeChange?: (type: string) => void;
  onShowtimeChange?: (showtimeId: string) => void;

  showtimeOptions?: SelectOption[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pagination,
  onPaginationChange,
  onSearchChange,
  onTypeChange,
  onShowtimeChange,
  showtimeOptions = [],
}: DataTableProps<TData, TValue>) {
  // const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("all");

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
    manualPagination: true,
    pageCount: pagination?.totalPages,
  });

  const handleClearFilters = () => {
    setSearchValue("");
    setSelectedType("all");

    onSearchChange?.("");
    onTypeChange?.("all");
    onShowtimeChange?.("");
  };

  const hasActiveFilters =
    searchValue || selectedType !== "all" || selectedShowtime !== "all";

  const handlePageChange = (page: number) => {
    onPaginationChange?.(page, pagination?.pageSize || 10);
  };

  const handlePageSizeChange = (pageSize: string) => {
    onPaginationChange?.(1, parseInt(pageSize));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 py-4 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg border mb-4 shadow-sm">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
          <Select
            value={selectedShowtime}
            onValueChange={(value) => {
              setSelectedShowtime(value);
              onShowtimeChange?.(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Tất cả suất chiếu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả suất chiếu</SelectItem>
              {showtimeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    ({opt.meta})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedType}
            onValueChange={(value) => {
              setSelectedType(value);
              onTypeChange?.(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại vé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại vé</SelectItem>
              <SelectItem value="online">Đặt Online</SelectItem>
              <SelectItem value="offline">Tại quầy (Offline)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white flex-1 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-bold text-gray-700"
                      >
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy dữ liệu nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0 bg-white border-t px-4 mt-auto">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground hidden sm:block">
              Số hàng mỗi trang
            </p>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
