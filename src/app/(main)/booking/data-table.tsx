"use client";
import { useState } from "react";
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
} from "lucide-react";

import { useI18n } from "@/contexts/I18nContext";

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

  movieOptions?: { value: string; label: string }[];
  showtimeOptions?: { value: string; label: string; meta?: string }[];

  selectedMovieId?: string;
  onMovieChange?: (movieId: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  pagination,
  onPaginationChange,

  onTypeChange,
  movieOptions = [],
  showtimeOptions = [],
  selectedMovieId = "all",
  onMovieChange,
  onShowtimeChange,
  onPaymentStatusChange,
  onBulkUpdate,
}: DataTableProps<TData, TValue> & {

  onPaymentStatusChange?: (val: string) => void;
  onBulkUpdate?: (ids: string[], status: string, paymentMethod?: string) => void;
}) {
  const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("all");
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [targetPaymentMethod, setTargetPaymentMethod] = useState<string>("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    manualPagination: true,
    pageCount: pagination?.totalPages,
  });

  const handlePageChange = (page: number) => {
    onPaginationChange?.(page, pagination?.pageSize || 10);
  };

  const handlePageSizeChange = (pageSize: string) => {
    onPaginationChange?.(1, parseInt(pageSize));
  };

  const hasSelection = Object.keys(rowSelection).length > 0;

  const handleBulkSubmit = () => {
    if (!targetStatus) return;
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => (row.original as any).id);
    onBulkUpdate?.(selectedIds, targetStatus, targetPaymentMethod);
    setRowSelection({});
    setTargetStatus("");
    setTargetPaymentMethod("");
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 py-4 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
          <Select
            value={selectedMovieId}
            onValueChange={(val) => {
              onMovieChange?.(val);
              setSelectedShowtime("all");
            }}
            disabled={hasSelection}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Chọn Phim trước" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("bookings.filterBooking.allfilm")}
              </SelectItem>
              {movieOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedShowtime}
            onValueChange={(value) => {
              setSelectedShowtime(value);
              onShowtimeChange?.(value === "all" ? "" : value);
            }}
            disabled={hasSelection || selectedMovieId === "all"}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Chọn Suất chiếu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {selectedMovieId === "all"
                  ? t("bookings.filterBooking.allshowtime")
                  : t("bookings.filterBooking.allshowtimeofmovie")}
              </SelectItem>

              {showtimeOptions.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  {t("bookings.filterBooking.noshowtime")}
                </div>
              ) : (
                showtimeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="font-medium">{opt.label}</span>
                    {opt.meta && (
                      <span className="text-gray-400 ml-2 text-xs">
                        ({opt.meta})
                      </span>
                    )}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={selectedType}
            onValueChange={(value) => {
              setSelectedType(value);
              onTypeChange?.(value);
            }}
            disabled={hasSelection}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại vé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("bookings.filterBooking.allType")}
              </SelectItem>
              <SelectItem value="online"> {t("bookings.online")}</SelectItem>
              <SelectItem value="offline"> {t("bookings.offline")}</SelectItem>
            </SelectContent>
          </Select>


          {hasSelection ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5">
              <Select
                value={targetStatus}
                onValueChange={setTargetStatus}
              >
                <SelectTrigger className="w-[180px] border-blue-500 ring-2 ring-blue-100">
                  <SelectValue placeholder={t("bookings.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đã thanh toán">{t("bookings.filterBooking.paid")}</SelectItem>
                  <SelectItem value="Thanh toán thất bại">{t("bookings.filterBooking.failed")}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkSubmit} disabled={!targetStatus}>
                {t("common.update")} ({Object.keys(rowSelection).length})
              </Button>
            </div>
          ) : (
            <Select
              value={selectedPaymentStatus}
              onValueChange={(value) => {
                setSelectedPaymentStatus(value);
                onPaymentStatusChange?.(value);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Trạng thái TT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("bookings.filterBooking.allStatus")}</SelectItem>
                <SelectItem value="Chưa thanh toán">{t("bookings.filterBooking.unpaid")}</SelectItem>
                <SelectItem value="Đã thanh toán">{t("bookings.filterBooking.paid")}</SelectItem>
                <SelectItem value="Thanh toán thất bại">{t("bookings.filterBooking.failed")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border flex-1 min-h-0">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader className="sticky top-0  bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-bold ">
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
                      {t("common.loading")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
