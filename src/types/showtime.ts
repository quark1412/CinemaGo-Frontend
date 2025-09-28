export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  language: string;
  subtitle: boolean;
  format: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  cinemaId: string;
  capacity: number;
  isActive: boolean;
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}
