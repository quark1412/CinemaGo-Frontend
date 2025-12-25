"use client";

import { useState } from "react";

import { Genre } from "@/types/genre";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { GenreDialog } from "./genre-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetGenresParams } from "@/services/genres";
import {
  useGenres,
  useArchiveGenre,
  useRestoreGenre,
} from "@/hooks/use-genres";
import { useI18n } from "@/contexts/I18nContext";

export default function AllGenres() {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    genre: Genre | null;
    action: "archive" | "restore";
  }>({
    open: false,
    genre: null,
    action: "archive",
  });
  const [currentParams, setCurrentParams] = useState<GetGenresParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useGenres(currentParams);
  const archiveMutation = useArchiveGenre();
  const restoreMutation = useRestoreGenre();

  const handleCreateClick = () => {
    setEditingGenre(null);
    setDialogOpen(true);
  };

  const handleEditClick = (genre: Genre) => {
    setEditingGenre(genre);
    setDialogOpen(true);
  };

  const handleArchiveClick = (genre: Genre) => {
    setConfirmationDialog({
      open: true,
      genre,
      action: "archive",
    });
  };

  const handleRestoreClick = (genre: Genre) => {
    setConfirmationDialog({
      open: true,
      genre,
      action: "restore",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.genre) return;

    try {
      if (confirmationDialog.action === "archive") {
        await archiveMutation.mutateAsync(confirmationDialog.genre.id);
      } else {
        await restoreMutation.mutateAsync(confirmationDialog.genre.id);
      }
      setConfirmationDialog({
        open: false,
        genre: null,
        action: "archive",
      });
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleDialogSuccess = () => {
    // Cache will be automatically invalidated by mutation hooks
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, search });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "isActive") {
      setCurrentParams({
        ...currentParams,
        page: 1,
        isActive: value === "" ? undefined : value === "true",
      });
    }
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
        onCreateClick={handleCreateClick}
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
      />

      <GenreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        genre={editingGenre}
        onSuccess={handleDialogSuccess}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? t("genres.archiveGenre.title")
            : t("genres.restoreGenre.title")
        }
        description={
          confirmationDialog.action === "archive"
            ? t("genres.archiveGenre.confirmText")
            : t("genres.restoreGenre.confirmText")
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
    </div>
  );
}
