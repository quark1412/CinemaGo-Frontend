"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking";
import { generateBookingQRData } from "@/lib/qrCodeHelpers";
import { formatDate, formatPrice } from "@/lib/utils";
import { getShowtimeById } from "@/services/showtimes";
import { getRoomById, getCinemaById } from "@/services/cinemas";
import { getMovieById } from "@/services/movies";
import { getUserById } from "@/services/users";
import { getFoodDrinkById } from "@/services/fooddrinks";

interface SeatData {
  id: string;
  seatNumber: string;
  row: string;
  type: string;
}

interface TicketData {
  movieTitle: string;
  cinemaName: string;
  cinemaAddress: string;
  roomName: string;
  date: string;
  startTime: string;
  seatsData: SeatData[];
  userName: string;
  userEmail: string;
  userPhone: string;
  foodDrinks: Array<{ name: string; quantity: number; price: number }>;
  seatsPrice: number;
  showtimePrice: number;
  roomExtraPrices: {
    VIP?: number;
    COUPLE?: number;
    NORMAL?: number;
  };
}

interface TicketPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

export function TicketPrintDialog({
  open,
  onOpenChange,
  booking,
}: TicketPrintDialogProps) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);

  useEffect(() => {
    const fetchTicketData = async () => {
      setTicketLoading(true);
      try {
        const showtimeResponse = await getShowtimeById(booking.showtimeId);
        const showtimeDetails =
          (showtimeResponse as any)?.data || showtimeResponse;

        if (!showtimeDetails || !showtimeDetails.startTime) {
          console.log("Failed to get showtime details");
          setTicketLoading(false);
          return;
        }

        const [movieDetails, cinemaDetails, roomDetails, userDetails] =
          await Promise.all([
            getMovieById(showtimeDetails.movieId).catch(() => null),
            getCinemaById(showtimeDetails.cinemaId).catch(() => null),
            getRoomById(showtimeDetails.roomId).catch(() => null),
            booking.userId
              ? getUserById(booking.userId).catch(() => null)
              : null,
          ]);

        const foodDrinksDetails = await Promise.all(
          booking.bookingFoodDrinks.map((bfd) =>
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

        const startTimeDate = new Date(showtimeDetails.startTime);
        const formattedStartTime = startTimeDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const seatMap = new Map<string, any>();
        if (roomDetails?.data.seats && Array.isArray(roomDetails.data.seats)) {
          roomDetails.data.seats.forEach((seat: any) => {
            seatMap.set(seat.id, seat);
          });
        }

        const seatsData = booking.bookingSeats
          .map((bookingSeat) => {
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
            return null;
          })
          .filter((s): s is SeatData => s !== null);

        const formattedShowtime = `${formattedStartTime} ${format(
          startTimeDate,
          "dd/MM/yyyy"
        )}`;

        const foodDrinksTotal = foodDrinksDetails.reduce(
          (sum, fd) => sum + fd.price,
          0
        );
        const seatsPrice = booking.totalPrice - foodDrinksTotal;

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
          date: formatDate(new Date(showtimeDetails.startTime)),
          startTime: formattedShowtime,
          seatsData,
          userName: userDetails?.data?.fullname || "",
          userEmail: userDetails?.data?.email || "",
          userPhone: (userDetails?.data as any)?.phone || "",
          foodDrinks: foodDrinksDetails,
          seatsPrice,
          showtimePrice: showtimeDetails.price || 0,
          roomExtraPrices,
        });
      } catch (error) {
        console.log("Error fetching ticket data:", error);
      } finally {
        setTicketLoading(false);
      }
    };

    if (open && booking) {
      fetchTicketData();
    }
  }, [open, booking]);

  const formatSeatNumbers = (seatsData: SeatData[] | undefined) => {
    if (!seatsData || seatsData.length === 0) return "N/A";

    const coupleSeats = seatsData.filter((seat) => seat.type === "COUPLE");
    const regularSeats = seatsData.filter((seat) => seat.type !== "COUPLE");

    const processedSeatNumbers = new Set<string>();
    const seatNumbers: string[] = [];

    coupleSeats.forEach((seat) => {
      if (processedSeatNumbers.has(seat.seatNumber)) return;

      const rowMatch = seat.seatNumber.match(/^([A-Z])(\d+)$/);
      if (!rowMatch) {
        seatNumbers.push(seat.seatNumber);
        processedSeatNumbers.add(seat.seatNumber);
        return;
      }

      const rowLetter = rowMatch[1];
      const seatNum = parseInt(rowMatch[2]);

      const adjacentSeat = coupleSeats.find((s) => {
        if (
          s.seatNumber === seat.seatNumber ||
          processedSeatNumbers.has(s.seatNumber)
        )
          return false;
        const sRowMatch = s.seatNumber.match(/^([A-Z])(\d+)$/);
        if (!sRowMatch) return false;
        return (
          sRowMatch[1] === rowLetter &&
          (parseInt(sRowMatch[2]) === seatNum + 1 ||
            parseInt(sRowMatch[2]) === seatNum - 1)
        );
      });

      if (adjacentSeat) {
        const adjRowMatch = adjacentSeat.seatNumber.match(/^([A-Z])(\d+)$/);
        const adjSeatNum = adjRowMatch ? parseInt(adjRowMatch[2]) : 0;
        const minNum = Math.min(seatNum, adjSeatNum);
        const maxNum = Math.max(seatNum, adjSeatNum);
        seatNumbers.push(`${rowLetter}${minNum}-${maxNum}`);
        processedSeatNumbers.add(seat.seatNumber);
        processedSeatNumbers.add(adjacentSeat.seatNumber);
      } else {
        seatNumbers.push(seat.seatNumber);
        processedSeatNumbers.add(seat.seatNumber);
      }
    });

    regularSeats.forEach((seat) => {
      seatNumbers.push(seat.seatNumber);
    });

    return seatNumbers.join(", ");
  };

  const handlePrintTicket = () => {
    if (!ticketData) return;
    const ticketElement = document.getElementById("ticket-content-print");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>In vé</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {ticketLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div
              id="ticket-content-print"
              className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col mx-auto"
              style={{ width: "400px", margin: "0 auto" }}
            >
              <div className="p-6 space-y-4">
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
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={generateBookingQRData({ id: booking.id })}
                      size={160}
                      level="H"
                      marginSize={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-center">
                    Thông tin vé
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Mã vé</span>
                      <span className="font-medium">{booking.id}</span>
                    </div>
                    {ticketData?.seatsData &&
                      ticketData.seatsData.length > 0 && (
                        <div className="flex justify-between">
                          <span>Ghế</span>
                          <span className="font-medium">
                            {formatSeatNumbers(ticketData?.seatsData)}
                          </span>
                        </div>
                      )}
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

                {/* Order Information Section */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-center">
                    Thông tin đơn hàng
                  </h3>
                  <div className="space-y-1 text-sm">
                    {/* Seats grouped by type */}
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

                      // Group seats by type and detect adjacent couple seats
                      const seatsByType: Record<string, SeatData[]> = {};
                      const processedSeatNumbers = new Set<string>();

                      // First, group couple seats together
                      const coupleSeats = ticketData.seatsData.filter(
                        (seat) => seat.type === "COUPLE"
                      );

                      // Group adjacent couple seats
                      coupleSeats.forEach((seat) => {
                        if (processedSeatNumbers.has(seat.seatNumber)) return;

                        // Find adjacent couple seat in the same row
                        const rowMatch =
                          seat.seatNumber.match(/^([A-Z])(\d+)$/);
                        if (!rowMatch) {
                          if (!seatsByType["COUPLE"]) {
                            seatsByType["COUPLE"] = [];
                          }
                          seatsByType["COUPLE"].push(seat);
                          processedSeatNumbers.add(seat.seatNumber);
                          return;
                        }

                        const rowLetter = rowMatch[1];
                        const seatNum = parseInt(rowMatch[2]);

                        // Look for adjacent couple seat
                        const adjacentSeat = coupleSeats.find((s) => {
                          if (
                            s.seatNumber === seat.seatNumber ||
                            processedSeatNumbers.has(s.seatNumber)
                          )
                            return false;
                          const sRowMatch =
                            s.seatNumber.match(/^([A-Z])(\d+)$/);
                          if (!sRowMatch) return false;
                          return (
                            sRowMatch[1] === rowLetter &&
                            (parseInt(sRowMatch[2]) === seatNum + 1 ||
                              parseInt(sRowMatch[2]) === seatNum - 1)
                          );
                        });

                        if (adjacentSeat) {
                          // Found adjacent couple seat
                          const adjRowMatch =
                            adjacentSeat.seatNumber.match(/^([A-Z])(\d+)$/);
                          const adjSeatNum = adjRowMatch
                            ? parseInt(adjRowMatch[2])
                            : seatNum;
                          const minNum = Math.min(seatNum, adjSeatNum);
                          const maxNum = Math.max(seatNum, adjSeatNum);

                          const couplePair: SeatData = {
                            ...seat,
                            seatNumber: `${rowLetter}${minNum}-${maxNum}`,
                          };

                          if (!seatsByType["COUPLE"]) {
                            seatsByType["COUPLE"] = [];
                          }
                          seatsByType["COUPLE"].push(couplePair);
                          processedSeatNumbers.add(seat.seatNumber);
                          processedSeatNumbers.add(adjacentSeat.seatNumber);
                        } else {
                          if (!seatsByType["COUPLE"]) {
                            seatsByType["COUPLE"] = [];
                          }
                          seatsByType["COUPLE"].push(seat);
                          processedSeatNumbers.add(seat.seatNumber);
                        }
                      });

                      // Add regular seats
                      ticketData.seatsData.forEach((seat) => {
                        if (processedSeatNumbers.has(seat.seatNumber)) return;

                        const type = seat.type || "NORMAL";
                        if (!seatsByType[type]) {
                          seatsByType[type] = [];
                        }
                        seatsByType[type].push(seat);
                      });

                      const basePrice = ticketData?.showtimePrice || 0;
                      const roomExtraPrices = ticketData?.roomExtraPrices || {};

                      return Object.entries(seatsByType).map(
                        ([type, seats]) => {
                          const extraPrice =
                            roomExtraPrices[
                              type as keyof typeof roomExtraPrices
                            ] || 0;

                          const seatCount = seats.length;

                          // Calculate total price
                          const totalPrice = seats.reduce((sum, seat) => {
                            if (
                              type === "COUPLE" &&
                              seat.seatNumber.includes("-")
                            ) {
                              const match =
                                seat.seatNumber.match(/^([A-Z])(\d+)-(\d+)$/);
                              if (match) {
                                const rowLetter = match[1];
                                const startNum = parseInt(match[2]);
                                const endNum = parseInt(match[3]);

                                const pairSeats = ticketData.seatsData.filter(
                                  (s) => {
                                    const sMatch =
                                      s.seatNumber.match(/^([A-Z])(\d+)$/);
                                    if (!sMatch) return false;
                                    return (
                                      sMatch[1] === rowLetter &&
                                      parseInt(sMatch[2]) >= startNum &&
                                      parseInt(sMatch[2]) <= endNum
                                    );
                                  }
                                );

                                // Sum price for both seats in the pair
                                return (
                                  sum +
                                  pairSeats.reduce((pairSum) => {
                                    return pairSum + (basePrice + extraPrice);
                                  }, 0)
                                );
                              }
                            }

                            // Regular seat or individual couple seat
                            return sum + (basePrice + extraPrice);
                          }, 0);

                          return (
                            <div key={type} className="flex justify-between">
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

                    {/* Food/Drinks */}
                    {ticketData?.foodDrinks &&
                      ticketData.foodDrinks.length > 0 &&
                      ticketData.foodDrinks.map((fd, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {fd.quantity} {fd.name}
                          </span>
                          <span className="font-medium">
                            {formatPrice(fd.price)}
                          </span>
                        </div>
                      ))}

                    {/* Total */}
                    <div className="border-t border-gray-300 pt-1 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Tổng</span>
                        <span>{formatPrice(booking.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handlePrintTicket} disabled={ticketLoading}>
            <Printer className="h-4 w-4 mr-2" />
            In vé
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
