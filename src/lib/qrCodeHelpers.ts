export interface BookingQRData {
  bookingId: string;
  userId?: string;
  showtimeId: string;
  totalPrice: number;
  seats: string[];
  createdAt: string;
}

export const generateBookingQRData = (booking: { id: string }): string => {
  const bookingId = booking.id;

  return JSON.stringify({
    bookingId: bookingId,
  });
};

export const parseBookingQRData = (
  qrDataString: string
): { bookingId: string } | null => {
  try {
    const parsed = JSON.parse(qrDataString);

    if (parsed.bookingId && typeof parsed.bookingId === "string") {
      return {
        bookingId: parsed.bookingId,
      };
    }

    console.log("Invalid QR data structure - missing bookingId");
    return null;
  } catch (error) {
    console.log("Failed to parse QR code data:", error);
    return null;
  }
};

export const formatBookingForDisplay = (booking: {
  id: string;
  totalPrice: number;
  bookingSeats: Array<{ seatId: string }>;
  createdAt: Date | string;
}) => {
  return {
    bookingId: booking.id.toUpperCase(),
    shortBookingId: booking.id.slice(-8).toUpperCase(),
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(booking.totalPrice),
    seatCount: booking.bookingSeats?.length || 0,
    seatList: booking.bookingSeats?.map((s) => s.seatId).join(", ") || "",
    bookingDate: new Date(booking.createdAt).toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
