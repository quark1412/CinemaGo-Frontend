"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Booking } from "@/types/booking";
import { updatePaymentStatus } from "@/services/booking";
import { toast } from "sonner";

import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { BookingDialog } from "./booking-dialog";

import { useBookingTable } from "@/app/(main)/booking/use-booking-table";

export default function AllBookings() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const {
    bookings,
    pagination,
    isLoading,
    refresh,
    maps,

    setType,
    setShowtime,
    setPaymentMethod,
    setPaymentStatus,
    onPaginationChange,
  } = useBookingTable({
    page: 1,
    limit: 10,
    type: undefined,
    showtimeId: undefined,
  });

  const [filterMovieId, setFilterMovieId] = useState<string>("all");

  const movieOptions = useMemo(() => {
    return Object.values(maps.movieMap).map((movie) => ({
      value: movie.id,
      label: movie.title,
    }));
  }, [maps.movieMap]);

  const showtimeOptions = useMemo(() => {
    const allShowtimes = Object.values(maps.showTimeMap);

    const filtered =
      filterMovieId === "all"
        ? allShowtimes
        : allShowtimes.filter((st) => st.movieId === filterMovieId);

    return filtered.map((st) => {
      const movieTitle = maps.movieMap[st.movieId]?.title || "Unknown";

      const timeLabel = new Date(st.startTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });

      return {
        value: st.id,
        label:
          filterMovieId !== "all" ? timeLabel : `${movieTitle} - ${timeLabel}`,
        meta: filterMovieId !== "all" ? "" : movieTitle,
      };
    });
  }, [maps.showTimeMap, maps.movieMap, filterMovieId]);

  const handleMovieFilterChange = (movieId: string) => {
    setFilterMovieId(movieId);
    setShowtime("");
  };

  const handleViewDetail = (booking: Booking) => {
    setViewBooking(booking);
    setDialogOpen(true);
  };

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      await updatePaymentStatus(id, { paymentStatus: status });
      toast.success("Cập nhật trạng thái thành công");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại");
    }
  };

  const columns = createColumns({
    onView: handleViewDetail,
    onUpdatePaymentStatus: handleUpdatePaymentStatus,
    userMap: maps.userMap,
    movieMap: maps.movieMap,
    roomMap: maps.roomMap,
    cinemaMap: maps.cinemaMap,
    showtimeMap: maps.showTimeMap,
  });

  const handleBulkUpdate = async (ids: string[], status: string) => {
    try {
      if (ids.length === 0) return;
      // Loop update since no bulk API yet
      await Promise.all(
        ids.map((id) => updatePaymentStatus(id, { paymentStatus: status }))
      );
      toast.success(`Đã cập nhật ${ids.length} đơn hàng thành ${status}`);
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật hàng loạt thất bại!");
    }
  };

  return (
    <div className="h-full space-y-4">
      <DataTable
        columns={columns}
        data={bookings}
        loading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onTypeChange={setType}
        onPaymentMethodChange={setPaymentMethod}
        onPaymentStatusChange={setPaymentStatus}
        onBulkUpdate={handleBulkUpdate}
        //
        movieOptions={movieOptions}
        showtimeOptions={showtimeOptions}
        selectedMovieId={filterMovieId}
        onMovieChange={handleMovieFilterChange}
        onShowtimeChange={setShowtime}
      />

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={viewBooking}
        maps={{
          userMap: maps.userMap,
          movieMap: maps.movieMap,
          roomMap: maps.roomMap,
          cinemaMap: maps.cinemaMap,

          showtimeMap: maps.showTimeMap || {},
        }}
      />
    </div>
  );
}
