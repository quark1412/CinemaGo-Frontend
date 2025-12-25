import { Movie } from "@/types/movie";

export type Genre = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
};
