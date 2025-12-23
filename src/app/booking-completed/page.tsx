"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Printer, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { paymentService } from "@/services/payment";
import { formatDate, formatPrice } from "@/lib/utils";
import { generateBookingQRData } from "@/lib/qrCodeHelpers";
import {
  getBookingById,
  type Booking as BookingType,
} from "@/services/booking";
import { getShowtimeById } from "@/services/showtimes";
import { getRoomById, getCinemaById } from "@/services/cinemas";
import { getMovieById } from "@/services/movies";
import { getUserById } from "@/services/users";
import { getFoodDrinkById } from "@/services/fooddrinks";

type Status = "pending" | "success" | "failed";

export default function BookingCompletedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  type BookingWithStatus = BookingType & { status?: string };

  const [status, setStatus] = useState<Status>("pending");
  const [message, setMessage] = useState<string>(
    "Đang kiểm tra trạng thái thanh toán..."
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [booking, setBooking] = useState<BookingWithStatus | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketData, setTicketData] = useState<{
    movieTitle: string;
    cinemaName: string;
    cinemaAddress: string;
    roomName: string;
    date: string;
    startTime: string;
    seatsData: Array<{
      id: string;
      seatNumber: string;
      row: string;
      type: string;
    }>;
    userName: string;
    userEmail: string;
    userPhone: string;
    foodDrinks: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    seatsPrice: number;
    showtimePrice: number;
    roomExtraPrices: {
      VIP?: number;
      COUPLE?: number;
      NORMAL?: number;
    };
  } | null>(null);

  const fetchTicketData = async (bookingData: BookingWithStatus) => {
    setTicketLoading(true);
    try {
      const showtimeDetails = await getShowtimeById(
        bookingData.showtimeId
      ).catch(() => null);
      const showtimeInfo = (showtimeDetails as any)?.data ?? showtimeDetails;

      const [roomDetails, cinemaDetails, movieDetails, userDetails] =
        await Promise.all([
          showtimeInfo?.roomId
            ? getRoomById(showtimeInfo.roomId).catch(() => null)
            : null,
          showtimeInfo?.cinemaId
            ? getCinemaById(showtimeInfo.cinemaId).catch(() => null)
            : null,
          showtimeInfo?.movieId
            ? getMovieById(showtimeInfo.movieId).catch(() => null)
            : null,
          bookingData.userId
            ? getUserById(bookingData.userId).catch(() => null)
            : null,
        ]);

      const foodDrinksDetails = await Promise.all(
        bookingData.bookingFoodDrinks.map((bfd) =>
          getFoodDrinkById(bfd.foodDrinkId)
            .then((res) => ({
              name: res.data?.name || "N/A",
              quantity: bfd.quantity,
              price: bfd.totalPrice,
            }))
            .catch(() => ({
              name: "N/A",
              quantity: bfd.quantity,
              price: bfd.totalPrice,
            }))
        )
      );

      const startTimeDate = showtimeInfo?.startTime
        ? new Date(showtimeInfo.startTime)
        : new Date();
      const formattedStartTime = startTimeDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const seatMap = new Map<string, any>();
      if (roomDetails?.data?.seats && Array.isArray(roomDetails.data.seats)) {
        roomDetails.data.seats.forEach((seat: any) => {
          seatMap.set(seat.id, seat);
        });
      }

      const seatsData =
        bookingData.bookingSeats?.map((bookingSeat) => {
          const seatData = seatMap.get(bookingSeat.seatId);
          if (seatData) {
            const rowMatch = seatData.seatNumber?.match(/^([A-Z])/i);
            const row = rowMatch ? rowMatch[1].toUpperCase() : "A";
            return {
              id: bookingSeat.seatId,
              seatNumber: seatData.seatNumber || bookingSeat.seatId,
              row,
              type: seatData.seatType || "NORMAL",
            };
          }
          return undefined;
        }) || [];

      const formattedShowtime = `${formattedStartTime} ${format(
        startTimeDate,
        "dd/MM/yyyy"
      )}`;

      const foodDrinksTotal = foodDrinksDetails.reduce(
        (sum, fd) => sum + fd.price,
        0
      );
      const seatsPrice = bookingData.totalPrice - foodDrinksTotal;

      const roomExtraPrices = {
        VIP: (roomDetails?.data as any)?.VIP || 0,
        COUPLE: (roomDetails?.data as any)?.COUPLE || 0,
        NORMAL: (roomDetails?.data as any)?.NORMAL || 0,
      };

      setTicketData({
        movieTitle: movieDetails?.data?.title || "",
        cinemaName: cinemaDetails?.data?.name || "",
        cinemaAddress: cinemaDetails?.data?.address || "",
        roomName: roomDetails?.data?.name || "",
        date: formatDate(startTimeDate),
        startTime: formattedShowtime,
        seatsData: seatsData.filter(Boolean) as any,
        userName: userDetails?.data?.fullname || "",
        userEmail: userDetails?.data?.email || "",
        userPhone: (userDetails?.data as any)?.phone || "",
        foodDrinks: foodDrinksDetails,
        seatsPrice,
        showtimePrice: showtimeInfo?.price || 0,
        roomExtraPrices,
      });
    } catch (error) {
      console.error("Error fetching ticket data:", error);
    } finally {
      setTicketLoading(false);
    }
  };

  const handlePrintTicket = () => {
    if (!ticketData) return;
    const ticketElement = document.getElementById("ticket-content");
    if (!ticketElement) return;

    const printContent = ticketElement.innerHTML;
    const originalContent = document.body.innerHTML;

    const printStyles = `
      <style>
        @media print {
          @page { margin: 10mm; }
          body { margin: 0; padding: 0; }
          .ticket-wrapper {
            width: 400px !important;
            max-width: 400px !important;
            margin: 0 auto !important;
            padding: 10px !important;
            font-size: 12px !important;
            border: 2px solid #000000 !important;
            border-radius: 8px !important;
          }
          .ticket-wrapper * { font-size: inherit !important; }
          .ticket-wrapper h2 { font-size: 16px !important; }
          .ticket-wrapper .text-base { font-size: 13px !important; }
          .ticket-wrapper .text-sm { font-size: 11px !important; }
          .ticket-wrapper .text-xs { font-size: 10px !important; }
        }
      </style>
    `;

    document.body.innerHTML = `
      ${printStyles}
      <div class="ticket-wrapper" style="font-family: Arial, sans-serif; width: 400px; margin: 0 auto; padding: 10px;">
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    const storedBookingId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("bookingId")
        : null;

    const queryBookingId =
      searchParams.get("bookingId") || searchParams.get("orderId");
    const usedBookingId = queryBookingId || storedBookingId;

    if (!usedBookingId) {
      setStatus("failed");
      setMessage("Không tìm thấy thông tin đặt vé.");
      return;
    }

    setBookingId(usedBookingId);

    const checkStatus = async () => {
      let fetchedBooking: BookingWithStatus | null = null;

      try {
        fetchedBooking = (await getBookingById(
          usedBookingId
        )) as BookingWithStatus;
        setBooking(fetchedBooking);
        setAmount(fetchedBooking.totalPrice ?? null);
      } catch (error: any) {
        setStatus("failed");
        setMessage("Không tìm thấy thông tin đặt vé.");
      }

      if (fetchedBooking?.status === "Đã thanh toán") {
        setStatus("success");
        setMessage("Thanh toán và đặt vé thành công!");
        await fetchTicketData(fetchedBooking);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("paymentId");
          window.localStorage.removeItem("bookingId");
        }
        return;
      }

      try {
        await paymentService.checkMoMoStatus(usedBookingId);
        const bookingResponse = (await getBookingById(
          usedBookingId
        )) as BookingWithStatus;
        setBooking(bookingResponse);
        setAmount(bookingResponse.totalPrice ?? null);
        setStatus("success");
        setMessage(
          "Thanh toán MoMo thành công. Đặt vé của bạn đã được xác nhận."
        );
        await fetchTicketData(bookingResponse);

        if (typeof window !== "undefined") {
          window.localStorage.removeItem("bookingId");
        }
      } catch (error: any) {
        setStatus("failed");
        setMessage("Thanh toán không thành công hoặc đã bị hủy.");
      }
    };

    checkStatus();
  }, [searchParams]);

  const handleBackToPOS = () => {
    router.push("/pos");
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border bg-background p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === "pending" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <h1 className="text-2xl font-bold">
                Đang xử lý thanh toán MoMo...
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h1 className="text-2xl font-bold">
                Thanh toán và đặt vé thành công!
              </h1>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <h1 className="text-2xl font-bold">
                Thanh toán không thành công
              </h1>
            </>
          )}

          <p className="text-muted-foreground">{message}</p>

          {status === "success" && (
            <div className="w-full space-y-4">
              <div className="flex justify-center">
                <Button onClick={handlePrintTicket}>
                  <Printer className="mr-2 h-4 w-4" />
                  In vé
                </Button>
              </div>

              <div
                id="ticket-content"
                className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col mx-auto"
                style={{ width: "400px", margin: "0 auto" }}
              >
                <div className="p-6 space-y-4">
                  {ticketLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">
                          {ticketData?.movieTitle || "Đang tải..."}
                        </h2>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-base font-black">
                          {ticketData?.cinemaName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticketData?.cinemaAddress || "N/A"}
                        </p>
                      </div>

                      <div className="flex justify-center py-2">
                        {booking && (
                          <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG
                              value={generateBookingQRData({
                                id: booking.id,
                                userId: booking.userId,
                                showtimeId: booking.showtimeId,
                                totalPrice: booking.totalPrice,
                                bookingSeats: booking.bookingSeats.map(
                                  (seat) => ({ seatId: seat.seatId })
                                ),
                                createdAt:
                                  booking.createdAt instanceof Date
                                    ? booking.createdAt
                                    : new Date(booking.createdAt),
                              })}
                              size={160}
                              level="H"
                              marginSize={1}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base font-black text-center">
                          Thông tin vé
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Mã vé</span>
                            <span className="font-medium">{booking?.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ghế</span>
                            <span className="font-medium">
                              {ticketData?.seatsData
                                ?.map((s) => s.seatNumber)
                                .join(", ") || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Suất chiếu</span>
                            <span className="font-medium">
                              {ticketData?.startTime || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phòng chiếu</span>
                            <span className="font-medium">
                              {ticketData?.roomName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base font-black text-center">
                          Thông tin đơn hàng
                        </h3>
                        <div className="space-y-1 text-sm">
                          {(() => {
                            if (
                              !ticketData?.seatsData ||
                              ticketData.seatsData.length === 0
                            ) {
                              return null;
                            }

                            const getSeatTypeName = (type: string) => {
                              const typeMap: Record<string, string> = {
                                NORMAL: "Thường",
                                VIP: "VIP",
                                COUPLE: "Đôi",
                              };
                              return typeMap[type] || type;
                            };

                            const seatsByType: Record<string, any[]> = {};
                            const coupleSeatNumbers = new Set<string>();

                            ticketData.seatsData.forEach((seat) => {
                              if (seat.type === "COUPLE") {
                                const coupleKey = seat.seatNumber;
                                if (!coupleSeatNumbers.has(coupleKey)) {
                                  coupleSeatNumbers.add(coupleKey);
                                  if (!seatsByType["COUPLE"]) {
                                    seatsByType["COUPLE"] = [];
                                  }
                                  seatsByType["COUPLE"].push(seat);
                                }
                              } else {
                                const type = seat.type || "NORMAL";
                                if (!seatsByType[type]) {
                                  seatsByType[type] = [];
                                }
                                seatsByType[type].push(seat);
                              }
                            });

                            return Object.entries(seatsByType).map(
                              ([type, seats]) => {
                                const basePrice =
                                  ticketData?.showtimePrice || 0;
                                const roomExtraPrices =
                                  ticketData?.roomExtraPrices || {};
                                const extraPrice =
                                  roomExtraPrices[
                                    type as keyof typeof roomExtraPrices
                                  ] || 0;

                                const seatCount = seats.length;

                                const totalPrice =
                                  seatCount * (basePrice + extraPrice);

                                return (
                                  <div
                                    key={type}
                                    className="flex justify-between"
                                  >
                                    <span>
                                      {seatCount} Ghế ({getSeatTypeName(type)})
                                    </span>
                                    <span className="font-medium">
                                      {formatPrice(totalPrice)}
                                    </span>
                                  </div>
                                );
                              }
                            );
                          })()}

                          {ticketData?.foodDrinks &&
                            ticketData.foodDrinks.length > 0 &&
                            ticketData.foodDrinks.map((fd, index) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  {fd.quantity} x {fd.name}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(fd.price)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-300 pt-1 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Tổng</span>
                          <span>{formatPrice(amount ?? 0)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={handleBackToPOS}>
              Quay lại POS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
