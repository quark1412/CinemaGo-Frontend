import { Movie } from "@/types/Movie";

export type Genre = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  movies: Movie[];
  createdAt: Date;
  updatedAt: Date;
};
