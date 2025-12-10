"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Booking } from "@/types/booking";

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
    maps,

    setType,
    setShowtime,
    onPaginationChange,
  } = useBookingTable({
    page: 1,
    limit: 10,
    type: undefined,
    showtimeId: undefined,
  });

  const handleViewDetail = (booking: Booking) => {
    setViewBooking(booking);
    setDialogOpen(true);
  };

  const columns = createColumns({
    onView: handleViewDetail,
    userMap: maps.userMap,
    movieMap: maps.movieMap,
    roomMap: maps.roomMap,
    cinemaMap: maps.cinemaMap,
    showtimeMap: maps.showTimeMap,
  });

  const showtimeOptions = useMemo(() => {
    const ids = Array.from(new Set(bookings.map((b) => b.showtimeId)));

    return ids
      .map((id) => maps.showTimeMap[id])
      .filter(Boolean)
      .map((st) => {
        const movie = maps.movieMap[st.movieId];
        const timeLabel = new Date(st.startTime).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          value: st.id,
          label: movie ? movie.title : "Phim ?",
          meta: timeLabel,
        };
      });
  }, [bookings, maps.showTimeMap, maps.movieMap]);

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Đặt vé</h2>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onTypeChange={setType}
        onShowtimeChange={setShowtime}
        showtimeOptions={showtimeOptions}
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
