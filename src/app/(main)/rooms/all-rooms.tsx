"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Room, GetRoomsParams } from "@/types/cinema";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { RoomDialog } from "./room-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { getAllRooms, archiveRoom, restoreRoom } from "@/services/cinemas";

export default function AllRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    room: Room | null;
    action: "archive" | "restore";
    loading: boolean;
  }>({
    open: false,
    room: null,
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
  const [currentParams, setCurrentParams] = useState<GetRoomsParams>({
    page: 1,
    limit: 10,
  });

  const fetchRooms = async (params?: GetRoomsParams) => {
    try {
      setLoading(true);
      const finalParams = { ...currentParams, ...params };
      setCurrentParams(finalParams);
      const response = await getAllRooms(finalParams);
      setRooms(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error("Failed to fetch rooms");
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateClick = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    setDialogOpen(true);
  };

  const handleDesignLayoutClick = (room: Room) => {
    const vipSeat = room.seats?.find((seat) => seat.seatType === "VIP");
    const coupleSeat = room.seats?.find((seat) => seat.seatType === "COUPLE");

    const params = new URLSearchParams({
      roomId: room.id,
      cinemaId: room.cinemaId,
      roomName: room.name,
      vipPrice: vipSeat?.extraPrice?.toString() || "0",
      couplePrice: coupleSeat?.extraPrice?.toString() || "0",
    });

    router.push(`/rooms/layout-designer?${params.toString()}`);
  };

  const handleArchiveClick = (room: Room) => {
    setConfirmationDialog({
      open: true,
      room,
      action: "archive",
      loading: false,
    });
  };

  const handleRestoreClick = (room: Room) => {
    setConfirmationDialog({
      open: true,
      room,
      action: "restore",
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.room) return;

    setConfirmationDialog((prev) => ({ ...prev, loading: true }));

    try {
      if (confirmationDialog.action === "archive") {
        await archiveRoom(confirmationDialog.room.id);
        toast.success("Room archived successfully!");
      } else {
        await restoreRoom(confirmationDialog.room.id);
        toast.success("Room restored successfully!");
      }
      fetchRooms();
      setConfirmationDialog({
        open: false,
        room: null,
        action: "archive",
        loading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${confirmationDialog.action} room`;
      toast.error(message);
      setConfirmationDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDialogSuccess = () => {
    fetchRooms();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchRooms({ page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    fetchRooms({ page: 1, limit: currentParams.limit, search });
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
    onDesignLayout: handleDesignLayoutClick,
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={rooms}
        onCreateClick={handleCreateClick}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        loading={loading}
      />

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editingRoom}
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
        loading={confirmationDialog.loading}
      />
    </div>
  );
}
