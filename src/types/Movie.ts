import { Genre } from "@/types/Genre";

export interface Movie {
  id: String;
  title: String;
  description: String;
  duration: Number;
  releaseDate: Date;
  rating: Number;
  thumbnail: String;
  thumbnailPublicId: String;
  trailerUrl: String;
  trailerPublicId: String;
  genres: Genre[];
  isActive: Boolean;
  createdAt: Date;
  updatedAt: Date;
}
