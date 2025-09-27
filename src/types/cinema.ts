export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
  longitude?: number;
  latitude?: number;
  createdAt: string;
  updatedAt: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  name: string;
  cinemaId: string;
  cinema?: Cinema;
  totalSeats: number;
  seatLayout: any; // JSON data for seat layout
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seats?: Seat[];
}

export interface Seat {
  id: string;
  roomId: string;
  room?: Room;
  seatNumber: string;
  seatType: string;
  extraPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCinemaData {
  name: string;
  address: string;
  city: string;
  longitude?: number;
  latitude?: number;
}

export interface UpdateCinemaData extends Partial<CreateCinemaData> {}

export interface CreateRoomData {
  name: string;
  cinemaId: string;
  seatLayout: any;
  vipPrice: number;
  couplePrice: number;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {}

export interface GetCinemasParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetRoomsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  cinemaId?: string;
  startTime?: string;
  endTime?: string;
}

export interface CinemaResponse {
  data: Cinema[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface RoomResponse {
  data: Room[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
