"use client";

import { useState } from "react";
import { Room } from "@/types/cinema";
import { RoomDataTable } from "@/app/(main)/rooms/data-table";
import { createColumns } from "@/app/(main)/rooms/columns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetRoomsParams } from "@/types/cinema";
import { useRooms, useArchiveRoom, useRestoreRoom } from "@/hooks/use-rooms";
import { RoomDialog } from "@/app/(main)/rooms/room-dialog";

export function AllRooms() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    room: Room | null;
    action: "archive" | "restore";
  }>({
    open: false,
    room: null,
    action: "archive",
  });
  const [currentParams, setCurrentParams] = useState<GetRoomsParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useRooms(currentParams);
  const archiveMutation = useArchiveRoom();
  const restoreMutation = useRestoreRoom();

  const handleCreateClick = () => {
    setEditingRoomId(null);
    setDialogOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setEditingRoomId(room.id);
    setDialogOpen(true);
  };

  const handleArchiveClick = (room: Room) => {
    setConfirmationDialog({
      open: true,
      room,
      action: "archive",
    });
  };

  const handleRestoreClick = (room: Room) => {
    setConfirmationDialog({
      open: true,
      room,
      action: "restore",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.room) return;

    try {
      if (confirmationDialog.action === "archive") {
        await archiveMutation.mutateAsync(confirmationDialog.room.id);
      } else {
        await restoreMutation.mutateAsync(confirmationDialog.room.id);
      }
      setConfirmationDialog({
        open: false,
        room: null,
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

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
  });

  return (
    <div className="h-full">
      <RoomDataTable
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
        loading={isLoading}
      />

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        roomId={editingRoomId}
        onSuccess={handleDialogSuccess}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "archive"
            ? "Archive Room"
            : "Restore Room"
        }
        description={
          confirmationDialog.action === "archive"
            ? `Are you sure you want to archive "${confirmationDialog.room?.name}"? This will make it unavailable for new showtimes.`
            : `Are you sure you want to restore "${confirmationDialog.room?.name}"? This will make it available for new showtimes again.`
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
