import { Genre } from "@/types/genre";

export type MovieStatus = "COMING_SOON" | "NOW_SHOWING" | "ENDED";

export type Movie = {
  id: string;
  title: string;
  description: string;
  duration: number;
  releaseDate: Date;
  rating: number;
  thumbnail: string;
  thumbnailPublicId: string;
  trailerUrl: string;
  trailerPublicId: string;
  genres: Genre[];
  isActive: boolean;
  status?: MovieStatus;
  createdAt: Date;
  updatedAt: Date;
};
