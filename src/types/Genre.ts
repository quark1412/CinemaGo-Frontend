import { Movie } from "@/types/Movie";

export interface Genre {
  id: String;
  name: String;
  description: String;
  isActive: Boolean;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
}
