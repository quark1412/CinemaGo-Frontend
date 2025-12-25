"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Booking } from "@/types/booking";
import { updatePaymentStatus, getBookingById } from "@/services/booking";
import { parseBookingQRData } from "@/lib/qrCodeHelpers";
import { toast } from "sonner";

import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { BookingDialog } from "./booking-dialog";
import { QRScanner } from "@/components/qr-scanner";
import { TicketPrintDialog } from "./ticket-print-dialog";

import { useBookingTable } from "@/app/(main)/booking/use-booking-table";
import { Button } from "@/components/ui/button";
import { ScanQrCode } from "lucide-react";

export default function AllBookings() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [ticketPrintOpen, setTicketPrintOpen] = useState(false);
  const [bookingForTicket, setBookingForTicket] = useState<Booking | null>(
    null
  );

  const {
    bookings,
    pagination,
    isLoading,
    refresh,
    maps,
    fetchBookingRelatedData,
    setType,
    setShowtime,
    setPaymentStatus,
    onPaginationChange,
  } = useBookingTable({
    page: 1,
    limit: 10000,
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
      const booking = bookings.find((b) => b.id === id);
      await updatePaymentStatus(id, {
        status,
        paymentMethod: booking?.paymentMethod,
      });
      toast.success("Cập nhật trạng thái thành công");
      refresh();
    } catch (error) {
      console.log(error);
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

  const handleBulkUpdate = async (
    ids: string[],
    status: string,
    paymentMethod?: string
  ) => {
    try {
      if (ids.length === 0) return;
      // Loop update since no bulk API yet
      await Promise.all(
        ids.map((id) => {
          const booking = bookings.find((b) => b.id === id);
          return updatePaymentStatus(id, {
            status,
            paymentMethod: booking?.paymentMethod || paymentMethod,
          });
        })
      );
      toast.success(`Đã cập nhật ${ids.length} đơn hàng thành ${status}`);
      refresh();
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật hàng loạt thất bại!");
    }
  };

  const handleQRScan = async (decodedText: string) => {
    try {
      const qrData = parseBookingQRData(decodedText);
      if (!qrData || !qrData.bookingId) {
        toast.error("Mã QR không hợp lệ");
        return;
      }

      const bookingResponse = await getBookingById(qrData.bookingId);

      const booking: Booking = {
        ...bookingResponse,
        status: (bookingResponse as any).status || "Chưa thanh toán",
        paymentMethod: (bookingResponse as any).paymentMethod,
        createdAt:
          typeof bookingResponse.createdAt === "string"
            ? bookingResponse.createdAt
            : (bookingResponse.createdAt as Date).toISOString(),
        updatedAt:
          typeof bookingResponse.updatedAt === "string"
            ? bookingResponse.updatedAt
            : (bookingResponse.updatedAt as Date).toISOString(),
        userId: bookingResponse.userId || null,
      };

      await fetchBookingRelatedData({
        userId: booking.userId,
        showtimeId: booking.showtimeId,
      });

      setViewBooking(booking);
      setDialogOpen(true);

      toast.success("Đã tìm thấy đặt vé từ mã QR");
    } catch (error: any) {
      console.log("Error fetching booking:", error);
      toast.error(
        error.response?.data?.message || "Không tìm thấy đặt vé với mã QR này"
      );
    }
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setQrScannerOpen(true)}
            variant="default"
            className="gap-2"
          >
            <ScanQrCode className="h-4 w-4" />
            <span>Quét mã QR</span>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onTypeChange={setType}
        onPaymentStatusChange={setPaymentStatus}
        onBulkUpdate={handleBulkUpdate}
        //
        movieOptions={movieOptions}
        showtimeOptions={showtimeOptions}
        selectedMovieId={filterMovieId}
        onMovieChange={handleMovieFilterChange}
        onShowtimeChange={setShowtime}
      />

      <QRScanner
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleQRScan}
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
        onPrintTicket={
          viewBooking
            ? () => {
                setBookingForTicket(viewBooking);
                setTicketPrintOpen(true);
              }
            : undefined
        }
        onUpdateStatus={
          viewBooking?.paymentMethod === "COD"
            ? async (status: string) => {
                if (!viewBooking) return;
                await handleUpdatePaymentStatus(viewBooking.id, status);
                try {
                  const updatedBooking = await getBookingById(viewBooking.id);
                  const booking: Booking = {
                    ...updatedBooking,
                    status: (updatedBooking as any).status || "Chưa thanh toán",
                    paymentMethod: (updatedBooking as any).paymentMethod,
                    createdAt:
                      typeof updatedBooking.createdAt === "string"
                        ? updatedBooking.createdAt
                        : (updatedBooking.createdAt as Date).toISOString(),
                    updatedAt:
                      typeof updatedBooking.updatedAt === "string"
                        ? updatedBooking.updatedAt
                        : (updatedBooking.updatedAt as Date).toISOString(),
                    userId: updatedBooking.userId || null,
                  };
                  setViewBooking(booking);
                } catch (error) {
                  console.log("Error refreshing booking:", error);
                }
              }
            : undefined
        }
      />

      {bookingForTicket && (
        <TicketPrintDialog
          open={ticketPrintOpen}
          onOpenChange={setTicketPrintOpen}
          booking={bookingForTicket}
        />
      )}
    </div>
  );
}
