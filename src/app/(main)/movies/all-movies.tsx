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
import { MovieDetailsDialog } from "@/components/movie-details-dialog";

export default function AllMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const fetchMovies = async (params?: GetMoviesParams) => {
    try {
      setLoading(true);
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
    // TODO: Implement edit functionality
    console.log("Edit movie:", movie);
  };

  const handleArchiveClick = async (movie: Movie) => {
    try {
      await archiveMovie(movie.id);
      toast.success("Movie archived successfully!");
      fetchMovies(); // Refresh the list
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
      fetchMovies(); // Refresh the list
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to restore movie";
      toast.error(message);
    }
  };

  const handleViewDetailsClick = (movieId: string) => {
    setSelectedMovieId(movieId);
    setDetailsDialogOpen(true);
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
    onViewDetails: handleViewDetailsClick,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DataTable columns={columns} data={movies} />
      <MovieDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        movieId={selectedMovieId}
      />
    </div>
  );
}
