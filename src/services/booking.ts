import instance from "@/configs/axiosConfig";

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
    const response = await instance.post("/bookings", data, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookedSeats = async (
  showtimeId: string
): Promise<{ data: string[] }> => {
  try {
    const response = await instance.get(
      `/bookings/public/${showtimeId}/booking-seat`,
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
    const response = await instance.post("/rooms/hold-seat", data, {
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
    const response = await instance.post("/rooms/release-seat", data, {
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
    const response = await instance.get(`/rooms/${showtimeId}/hold-seat`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
