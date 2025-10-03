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

export default function AllMovies() {
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

  const { data, isLoading } = useMovies(currentParams);
  const archiveMutation = useArchiveMovie();
  const restoreMutation = useRestoreMovie();

  const handleEditClick = (movie: Movie) => {
    console.log("Edit movie:", movie);
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
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, search });
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
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
        loading={isLoading}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? "Archive Movie"
            : "Restore Movie"
        }
        description={
          confirmationDialog.action === "archive"
            ? `Are you sure you want to archive "${confirmationDialog.movie?.title}"? This will make it unavailable for new showtimes.`
            : `Are you sure you want to restore "${confirmationDialog.movie?.title}"? This will make it available for new showtimes again.`
        }
        confirmText={
          confirmationDialog.action === "archive" ? "Archive" : "Restore"
        }
        variant={confirmationDialog.action}
        onConfirm={handleConfirmAction}
        loading={archiveMutation.isPending || restoreMutation.isPending}
      />
    </div>
  );
}
