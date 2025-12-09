import instance from "@/configs/axiosConfig";
import { BookingResponse, MyBookingParams } from "@/types/booking";

export interface CreateBookingRequest {
  type: string;
  showtimeId: string;
  seatIds: string[];
  foodDrinks?: Array<{ foodDrinkId: string; quantity: number }>;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  totalPrice: number;
  type: string;
  bookingSeats: Array<{
    id: string;
    seatId: string;
    showtimeId: string;
  }>;
  bookingFoodDrinks: Array<{
    id: string;
    foodDrinkId: string;
    quantity: number;
    totalPrice: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const createBooking = async (
  data: CreateBookingRequest
): Promise<{ data: Booking }> => {
  try {
    const response = await instance.post("/v1/bookings", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export interface BookedSeat {
  id: string;
  bookingId: string;
  seatId: string;
  showtimeId: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllBookings = async (
  params?: MyBookingParams
): Promise<BookingResponse> => {
  try {
    const response = await instance.get<BookingResponse>(
      "/v1/bookings/dashboard/get-all",
      {
        params,
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. Sửa lại getMyBookings
export const getMyBookings = async (
  params?: MyBookingParams
): Promise<BookingResponse> => {
  try {
    const response = await instance.get<BookingResponse>("/v1/bookings", {
      params,
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. Sửa lại getBookingById
export const getBookingById = async (id: string): Promise<Booking> => {
  try {
    // Lưu ý: Giả định API trả về { data: Booking } giống logic cũ bạn viết
    const response = await instance.get<{ data: Booking }>(
      `/v1/bookings/${id}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getBookedSeats = async (
  showtimeId: string
): Promise<{ data: BookedSeat[] }> => {
  try {
    const response = await instance.get(
      `/v1/bookings/public/${showtimeId}/booking-seat`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const holdSeat = async (data: {
  showtimeId: string;
  seatId: string;
}): Promise<{ message: string }> => {
  try {
    const response = await instance.post("/v1/rooms/hold-seat", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const releaseSeat = async (data: {
  showtimeId: string;
  seatId: string;
}): Promise<{ message: string }> => {
  try {
    const response = await instance.post("/v1/rooms/release-seat", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export interface HeldSeat {
  userId: string;
  showtimeId: string;
  seatId: string;
  extraPrice: number;
}

export const getHeldSeats = async (
  showtimeId: string
): Promise<{ data: HeldSeat[] }> => {
  try {
    const response = await instance.get(`/v1/rooms/${showtimeId}/hold-seat`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
