"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Cinema } from "@/types/cinema";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { CinemaDialog } from "./cinema-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  getAllCinemas,
  archiveCinema,
  restoreCinema,
} from "@/services/cinemas";
import { GetCinemasParams } from "@/types/cinema";

export default function AllCinemas() {
  const router = useRouter();
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    cinema: Cinema | null;
    action: "archive" | "restore";
    loading: boolean;
  }>({
    open: false,
    cinema: null,
    action: "archive",
    loading: false,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentParams, setCurrentParams] = useState<GetCinemasParams>({
    page: 1,
    limit: 10,
  });

  const fetchCinemas = async (params?: GetCinemasParams) => {
    try {
      setLoading(true);
      const finalParams = { ...currentParams, ...params };
      setCurrentParams(finalParams);
      const response = await getAllCinemas(finalParams);
      setCinemas(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error("Failed to fetch cinemas");
      console.error("Error fetching cinemas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

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
      loading: false,
    });
  };

  const handleRestoreClick = (cinema: Cinema) => {
    setConfirmationDialog({
      open: true,
      cinema,
      action: "restore",
      loading: false,
    });
  };

  const handleViewDetailsClick = (cinema: Cinema) => {
    router.push(`/cinemas/${cinema.id}`);
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.cinema) return;

    setConfirmationDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (confirmationDialog.action === "archive") {
        await archiveCinema(confirmationDialog.cinema.id);
        toast.success("Cinema archived successfully!");
      } else {
        await restoreCinema(confirmationDialog.cinema.id);
        toast.success("Cinema restored successfully!");
      }
      fetchCinemas();
      setConfirmationDialog({
        open: false,
        cinema: null,
        action: "archive",
        loading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${confirmationDialog.action} cinema`;
      toast.error(message);
      setConfirmationDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDialogSuccess = () => {
    fetchCinemas();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchCinemas({ page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    fetchCinemas({ page: 1, limit: currentParams.limit, search });
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
    onViewDetails: handleViewDetailsClick,
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={cinemas}
        onCreateClick={handleCreateClick}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        loading={loading}
      />

      <CinemaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cinema={editingCinema}
        onSuccess={handleDialogSuccess}
      />

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
        loading={confirmationDialog.loading}
      />
    </div>
  );
}
