"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Calendar, Clock } from "lucide-react";

import { Cinema, Room, GetRoomsParams } from "@/types/cinema";
import {
  getCinemaById,
  getAllRooms,
  archiveRoom,
  restoreRoom,
} from "@/services/cinemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Import room management components
import { RoomDataTable } from "../room-data-table";
import { createColumns } from "./room-columns";
import { RoomDialog } from "../room-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatDate } from "@/lib/utils";

interface CinemaDetailsProps {
  cinemaId: string;
}

export default function CinemaDetails({ cinemaId }: CinemaDetailsProps) {
  const router = useRouter();
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
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
    cinemaId: cinemaId,
  });

  const fetchCinema = async () => {
    try {
      setLoading(true);
      const response = await getCinemaById(cinemaId);
      setCinema(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch cinema details");
      console.error("Error fetching cinema:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (params?: GetRoomsParams) => {
    try {
      setRoomsLoading(true);
      const finalParams = { ...currentParams, ...params, cinemaId: cinemaId };
      setCurrentParams(finalParams);
      const response = await getAllRooms(finalParams);
      setRooms(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error("Failed to fetch rooms");
      console.error("Error fetching rooms:", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchCinema();
    fetchRooms();
  }, [cinemaId]);

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
      vipPrice: vipSeat?.extraPrice?.toString() || "1",
      couplePrice: coupleSeat?.extraPrice?.toString() || "1",
    });

    router.push(`/cinemas/layout-designer?${params.toString()}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Cinema not found</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/cinemas")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Cinema Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Cinema Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm font-semibold">{cinema.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  City
                </label>
                <p className="text-sm">{cinema.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm">{cinema.address}</p>
              </div>
            </div>
            <div className="space-y-4">
              {cinema.longitude && cinema.latitude && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      {cinema.latitude}, {cinema.longitude}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://maps.google.com/?q=${cinema.latitude},${cinema.longitude}`,
                          "_blank"
                        )
                      }
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      View on Map
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">{formatDate(cinema.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <p className="text-sm">{formatDate(cinema.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Rooms Management Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Rooms Management</h2>
          <p className="text-muted-foreground">
            Manage rooms for this cinema location
          </p>
        </div>

        <RoomDataTable
          columns={columns}
          data={rooms}
          onCreateClick={handleCreateClick}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onSearchChange={handleSearchChange}
          loading={roomsLoading}
        />
      </div>

      {/* Dialogs */}
      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editingRoom}
        onSuccess={handleDialogSuccess}
        defaultCinemaId={cinemaId}
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
