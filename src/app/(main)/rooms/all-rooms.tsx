"use client";

import { useState, useMemo } from "react";
import { Room } from "@/types/cinema";
import { RoomDataTable } from "@/app/(main)/rooms/data-table";
import { createColumns } from "@/app/(main)/rooms/columns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetRoomsParams } from "@/types/cinema";
import { useRooms, useArchiveRoom, useRestoreRoom } from "@/hooks/use-rooms";
import { RoomDialog } from "@/app/(main)/rooms/room-dialog";
import { useCinemas } from "@/hooks/use-cinemas";
import { useI18n } from "@/contexts/I18nContext";

export function AllRooms() {
  const { t } = useI18n();
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
  const { data: cinemaData } = useCinemas({
    page: 1,
    limit: 100,
    isActive: true,
  });
  const archiveMutation = useArchiveRoom();
  const restoreMutation = useRestoreRoom();

  const cinemaMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cinemaData?.data) {
      cinemaData.data.forEach((cinema) => {
        map.set(cinema.id, cinema.name);
      });
    }
    return map;
  }, [cinemaData]);

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

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setCurrentParams((prev) => {
      const next: GetRoomsParams = { ...prev, page: 1 };
      if (status === "all") {
        delete next.isActive;
      } else {
        next.isActive = status === "active";
      }
      return next;
    });
  };

  const handleCinemaChange = (cinemaId: string | "all") => {
    setCurrentParams((prev) => {
      const next: GetRoomsParams = { ...prev, page: 1 };
      if (cinemaId === "all") {
        delete next.cinemaId;
      } else {
        next.cinemaId = cinemaId;
      }
      return next;
    });
  };

  // Group and sort rooms by cinema
  const groupedData = useMemo(() => {
    const rooms = data?.data || [];
    if (rooms.length === 0) return [];

    // Sort by cinemaId
    const sorted = [...rooms].sort((a, b) => {
      const cinemaA = a.cinemaId || "";
      const cinemaB = b.cinemaId || "";
      return cinemaA.localeCompare(cinemaB);
    });

    // Calculate rowSpan for cinema column
    const result = sorted.map((room, index) => {
      // Calculate cinema rowSpan
      let cinemaRowSpan = 0; // 0: don't show, > 0: show with rowSpan
      const isFirstCinemaRow =
        index === 0 || sorted[index - 1].cinemaId !== room.cinemaId;

      if (isFirstCinemaRow) {
        // Count how many rows have the same cinemaId
        let count = 1;
        for (let i = index + 1; i < sorted.length; i++) {
          if (sorted[i].cinemaId === room.cinemaId) {
            count++;
          } else {
            break;
          }
        }
        cinemaRowSpan = count;
      }

      // Create a group identifier
      const groupId = room.cinemaId || "";

      return {
        ...room,
        _cinemaRowSpan: cinemaRowSpan,
        _groupId: groupId,
      };
    });

    return result;
  }, [data?.data]);

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
    cinemaMap,
  });

  return (
    <div className="h-full">
      <RoomDataTable
        columns={columns}
        data={groupedData}
        cinemas={cinemaData?.data?.map((cinema) => ({
          id: cinema.id,
          name: cinema.name,
        }))}
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
        onStatusChange={handleStatusChange}
        onCinemaChange={handleCinemaChange}
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
            ? t("rooms.archiveRoom.title")
            : t("rooms.restoreRoom.title")
        }
        description={
          confirmationDialog.action === "archive"
            ? t("rooms.archiveRoom.confirmText")
            : t("rooms.restoreRoom.confirmText")
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
