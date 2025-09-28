"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Movie } from "@/types/movie";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import {
  getAllMovies,
  archiveMovie,
  restoreMovie,
  GetMoviesParams,
} from "@/services/movies";
import { MoviesSkeleton } from "@/components/movies-skeleton";

export default function AllMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async (params?: GetMoviesParams) => {
    setLoading(true);
    try {
      const response = await getAllMovies(params);
      setMovies(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch movies");
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleEditClick = (movie: Movie) => {
    console.log("Edit movie:", movie);
  };

  const handleArchiveClick = async (movie: Movie) => {
    try {
      await archiveMovie(movie.id);
      toast.success("Movie archived successfully!");
      fetchMovies();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to archive movie";
      toast.error(message);
    }
  };

  const handleRestoreClick = async (movie: Movie) => {
    try {
      await restoreMovie(movie.id);
      toast.success("Movie restored successfully!");
      fetchMovies();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to restore movie";
      toast.error(message);
    }
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
  });

  if (loading) {
    return <MoviesSkeleton />;
  }

  return (
    <div className="h-full">
      <DataTable columns={columns} data={movies} />
    </div>
  );
}
