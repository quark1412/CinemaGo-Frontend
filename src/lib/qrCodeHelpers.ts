export interface BookingQRData {
  bookingId: string;
  userId?: string;
  showtimeId: string;
  totalPrice: number;
  seats: string[];
  createdAt: string;
}

// Generate QR code data string
export const generateBookingQRData = (booking: {
  id: string;
  userId?: string;
  showtimeId: string;
  totalPrice: number;
  bookingSeats: Array<{ seatId: string }>;
  createdAt: Date | string;
}): string => {
  const createdAtDate =
    booking.createdAt instanceof Date
      ? booking.createdAt
      : new Date(booking.createdAt);

  const qrData: BookingQRData = {
    bookingId: booking.id,
    userId: booking.userId,
    showtimeId: booking.showtimeId,
    totalPrice: booking.totalPrice,
    seats: booking.bookingSeats.map((seat) => seat.seatId),
    createdAt: createdAtDate.toISOString(),
  };

  return JSON.stringify(qrData);
};

// Parse QR code data string back to booking information
export const parseBookingQRData = (
  qrDataString: string
): BookingQRData | null => {
  try {
    const parsed = JSON.parse(qrDataString);

    // Validate required fields
    if (
      !parsed.bookingId ||
      !parsed.showtimeId ||
      !parsed.totalPrice ||
      !Array.isArray(parsed.seats)
    ) {
      console.error("Invalid QR data structure");
      return null;
    }

    return {
      bookingId: parsed.bookingId,
      userId: parsed.userId,
      showtimeId: parsed.showtimeId,
      totalPrice: parsed.totalPrice,
      seats: parsed.seats,
      createdAt: parsed.createdAt,
    };
  } catch (error) {
    console.error("Failed to parse QR code data:", error);
    return null;
  }
};

// Format booking QR data for display
export const formatBookingForDisplay = (qrData: BookingQRData) => {
  return {
    bookingId: qrData.bookingId.toUpperCase(),
    shortBookingId: qrData.bookingId.slice(-8).toUpperCase(),
    formattedPrice: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(qrData.totalPrice),
    seatCount: qrData.seats.length,
    seatList: qrData.seats.join(", "),
    bookingDate: new Date(qrData.createdAt).toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
