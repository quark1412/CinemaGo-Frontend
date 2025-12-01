"use client";

import { useState } from "react";

import { Movie } from "@/types/movie";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetMoviesParams } from "@/services/movies";
import {
  useMovies,
  useArchiveMovie,
  useRestoreMovie,
} from "@/hooks/use-movies";
import CreateMovie from "./create-movie";
import { EditMovieDialog } from "./edit-movie-dialog";
import { MovieDetailsDialog } from "./movie-details-dialog";
import { useI18n } from "@/contexts/I18nContext";

export default function AllMovies() {
  const { t } = useI18n();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    movie: Movie | null;
    action: "archive" | "restore";
  }>({
    open: false,
    movie: null,
    action: "archive",
  });
  const [currentParams, setCurrentParams] = useState<GetMoviesParams>({
    page: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState<{
    status?: string;
    isActive?: string;
  }>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [viewingMovieId, setViewingMovieId] = useState<string | null>(null);

  const { data, isLoading } = useMovies(currentParams);
  const archiveMutation = useArchiveMovie();
  const restoreMutation = useRestoreMovie();

  const handleEditClick = (movie: Movie) => {
    setEditingMovieId(movie.id);
  };

  const handleArchiveClick = (movie: Movie) => {
    setConfirmationDialog({
      open: true,
      movie,
      action: "archive",
    });
  };

  const handleRestoreClick = (movie: Movie) => {
    setConfirmationDialog({
      open: true,
      movie,
      action: "restore",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.movie) return;

    try {
      if (confirmationDialog.action === "archive") {
        await archiveMutation.mutateAsync(confirmationDialog.movie.id);
      } else {
        await restoreMutation.mutateAsync(confirmationDialog.movie.id);
      }
      setConfirmationDialog({
        open: false,
        movie: null,
        action: "archive",
      });
    } catch (error) {}
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, search });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    const apiParams: GetMoviesParams = {
      ...currentParams,
      page: 1,
    };

    if (filterType === "status") {
      apiParams.status = value && value !== "all" ? value : undefined;
    } else if (filterType === "isActive") {
      apiParams.isActive =
        value === "true" ? true : value === "false" ? false : undefined;
    }

    setCurrentParams(apiParams);
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
    onView: (movie) => setViewingMovieId(movie.id),
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={
          data?.pagination || {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        }
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        loading={isLoading}
        onCreateClick={() => setCreateDialogOpen(true)}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? t("movies.archiveMovie.title")
            : t("movies.restoreMovie.title")
        }
        description={
          confirmationDialog.action === "archive"
            ? t("movies.archiveMovie.confirmText")
            : t("movies.restoreMovie.confirmText")
        }
        confirmText={
          confirmationDialog.action === "archive"
            ? t("common.actions.archive")
            : t("common.actions.restore")
        }
        variant={confirmationDialog.action}
        onConfirm={handleConfirmAction}
        loading={archiveMutation.isPending || restoreMutation.isPending}
      />

      <CreateMovie
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {editingMovieId && (
        <EditMovieDialog
          movieId={editingMovieId}
          open={!!editingMovieId}
          onClose={() => setEditingMovieId(null)}
        />
      )}

      <MovieDetailsDialog
        open={!!viewingMovieId}
        movieId={viewingMovieId}
        onOpenChange={(open) => {
          if (!open) {
            setViewingMovieId(null);
          }
        }}
      />
    </div>
  );
}
