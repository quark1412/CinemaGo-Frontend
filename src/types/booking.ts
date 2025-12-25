export interface BookingSeat {
  id: string;
  seatId: string;
  showtimeId: string;
}

export interface BookingFoodDrink {
  id: string;
  foodDrinkId: string;
  quantity: number;
  totalPrice: number;
}

export interface Booking {
  id: string;
  userId: string | null;
  showtimeId: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  status: string;
  paymentMethod?: string;

  bookingSeats: BookingSeat[];
  bookingFoodDrinks: BookingFoodDrink[];
}

export interface MyBookingParams {
  page?: number;
  limit?: number;
  showtimeId?: string;
  type?: string;
  status?: string;


}

export interface BookingResponse {
  data: Booking[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type UserMap = Record<string, { fullname: string; email: string }>;
export type MovieMap = Record<string, { title: string }>;
export type RoomMap = Record<string, { name: string; cinemaId?: string }>;
export type CinemaMap = Record<string, { name: string }>;
export type ShowtimeMap = Record<
  string,
  {
    startTime: string;
    movieId: string;
    roomId: string;
    cinemaId?: string;
  }
>;
