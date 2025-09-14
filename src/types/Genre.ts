import { Movie } from "@/types/Movie";

export type Genre = {
  id: String;
  name: String;
  description: String;
  isActive: Boolean;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
};
