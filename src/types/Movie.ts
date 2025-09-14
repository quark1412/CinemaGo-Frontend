import { Genre } from "@/types/Genre";

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
  createdAt: Date;
  updatedAt: Date;
};
