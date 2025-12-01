"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Cinema } from "@/types/cinema";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { CinemaDialog } from "./cinema-dialog";
import { CreateCinemaDialog } from "./create-cinema-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetCinemasParams } from "@/types/cinema";
import {
  useCinemas,
  useArchiveCinema,
  useRestoreCinema,
} from "@/hooks/use-cinemas";

export default function AllCinemas() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    cinema: Cinema | null;
    action: "archive" | "restore";
  }>({
    open: false,
    cinema: null,
    action: "archive",
  });
  const [currentParams, setCurrentParams] = useState<GetCinemasParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useCinemas(currentParams);
  const { data: allCinemasData } = useCinemas({ limit: undefined });

  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    if (allCinemasData?.data) {
      allCinemasData.data.forEach((cinema) => {
        if (cinema.city) {
          citySet.add(cinema.city);
        }
      });
    }
    return Array.from(citySet).sort();
  }, [allCinemasData]);
  const archiveMutation = useArchiveCinema();
  const restoreMutation = useRestoreCinema();

  const handleCreateClick = () => {
    setEditingCinema(null);
    setDialogOpen(true);
  };

  const handleEditClick = (cinema: Cinema) => {
    setEditingCinema(cinema);
    setDialogOpen(true);
  };

  const handleArchiveClick = (cinema: Cinema) => {
    setConfirmationDialog({
      open: true,
      cinema,
      action: "archive",
    });
  };

  const handleRestoreClick = (cinema: Cinema) => {
    setConfirmationDialog({
      open: true,
      cinema,
      action: "restore",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.cinema) return;

    try {
      if (confirmationDialog.action === "archive") {
        await archiveMutation.mutateAsync(confirmationDialog.cinema.id);
      } else {
        await restoreMutation.mutateAsync(confirmationDialog.cinema.id);
      }
      setConfirmationDialog({
        open: false,
        cinema: null,
        action: "archive",
      });
    } catch (error) {}
  };

  const handleDialogSuccess = () => {};

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, search });
  };

  const handleCityChange = (city: string) => {
    setCurrentParams({ ...currentParams, page: 1, city: city || undefined });
  };

  const handleStatusChange = (status: string) => {
    setCurrentParams({
      ...currentParams,
      page: 1,
      isActive:
        status === "active" ? true : status === "inactive" ? false : undefined,
    });
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
        allCities={allCities}
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
        onCityChange={handleCityChange}
        onStatusChange={handleStatusChange}
        loading={isLoading}
      />

      {editingCinema ? (
        <CinemaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          cinema={editingCinema}
          onSuccess={handleDialogSuccess}
        />
      ) : (
        <CreateCinemaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleDialogSuccess}
        />
      )}

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? "Archive Cinema"
            : "Restore Cinema"
        }
        description={
          confirmationDialog.action === "archive"
            ? `Are you sure you want to archive "${confirmationDialog.cinema?.name}"? This will make it unavailable for new showtimes.`
            : `Are you sure you want to restore "${confirmationDialog.cinema?.name}"? This will make it available for new showtimes again.`
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
