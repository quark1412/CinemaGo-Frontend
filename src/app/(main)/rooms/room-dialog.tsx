"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Room, CreateRoomData, UpdateRoomData } from "@/types/cinema";
import { createRoom, getRoomById, updateRoom } from "@/services/cinemas";
import { CinemaSelector } from "@/components/cinema-selector";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SeatLayout, SeatType, SeatPosition } from "@/types/seat";
import { RoomLayoutModal } from "./room-layout-modal";
import { MAX_COLS, MAX_ROWS } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  cinemaId: z.string().min(1, "Cinema is required"),
  vipPrice: z.number().min(1, "VIP price must be greater than 0"),
  couplePrice: z.number().min(1, "Couple price must be greater than 0"),
});

type FormData = z.infer<typeof formSchema>;

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId?: string | null;
  onSuccess?: () => void;
  defaultCinemaId?: string;
}

export function RoomDialog({
  open,
  onOpenChange,
  roomId,
  onSuccess,
  defaultCinemaId,
}: RoomDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!roomId;
  const [room, setRoom] = useState<Room | null>(null);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cinemaId: defaultCinemaId || "",
      vipPrice: 1,
      couplePrice: 1,
    },
  });

  const fetchRoom = async (roomId: string) => {
    try {
      setLoading(true);
      const roomResponse = await getRoomById(roomId);
      const roomData = roomResponse.data;
      setRoom(roomData);

      if (roomData.seatLayout && Array.isArray(roomData.seatLayout)) {
        let maxRow = 0;
        let maxCol = 0;

        roomData.seatLayout.forEach((seat: any) => {
          const rowIndex = seat.row.charCodeAt(0) - 65;
          const colIndex = seat.col - 1;

          if (rowIndex > maxRow) maxRow = rowIndex;
          if (colIndex > maxCol) maxCol = colIndex;
        });

        const rows = Math.max(maxRow + 1, MAX_ROWS);
        const cols = Math.max(maxCol + 1, MAX_COLS);
        const seats: SeatPosition[][] = Array.from(
          { length: rows },
          (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => ({
              row: rowIndex,
              col: colIndex,
              type: SeatType.EMPTY,
            }))
        );

        roomData.seatLayout.forEach((seat: any) => {
          const rowIndex = seat.row.charCodeAt(0) - 65;
          const colIndex = seat.col - 1;

          if (rowIndex < rows && colIndex < cols) {
            const seatNumber = `${seat.row}${seat.col}`;
            seats[rowIndex][colIndex] = {
              row: rowIndex,
              col: colIndex,
              type: seat.type as SeatType,
              seatNumber,
            };
          }
        });

        // Couple seat pairing
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          for (let colIndex = 0; colIndex < cols - 1; colIndex++) {
            const currentSeat = seats[rowIndex][colIndex];
            const nextSeat = seats[rowIndex][colIndex + 1];

            if (
              currentSeat.type === SeatType.COUPLE &&
              nextSeat.type === SeatType.COUPLE &&
              !currentSeat.isCoupleSeat &&
              !nextSeat.isCoupleSeat
            ) {
              const rowLetter = String.fromCharCode(65 + rowIndex);
              const coupleSeatNumber = `${rowLetter}${colIndex + 1}-${
                colIndex + 2
              }`;

              seats[rowIndex][colIndex] = {
                ...currentSeat,
                seatNumber: coupleSeatNumber,
                isCoupleSeat: true,
                coupleWith: colIndex + 1,
              };

              seats[rowIndex][colIndex + 1] = {
                ...nextSeat,
                seatNumber: coupleSeatNumber,
                isCoupleSeat: true,
                coupleWith: colIndex,
              };
            }
          }
        }

        setSeatLayout({ rows, cols, seats });
      }

      form.reset({
        name: roomData.name,
        cinemaId: roomData.cinemaId,
        vipPrice: roomData.VIP || 0,
        couplePrice: roomData.COUPLE || 0,
      });
    } catch (error: any) {
      console.error("Error fetching room:", error);
      toast.error(error.response?.data?.message || "Failed to load room data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && roomId) {
      fetchRoom(roomId);
    } else if (open && !roomId) {
      form.reset({
        name: "",
        cinemaId: defaultCinemaId || "",
        vipPrice: 1,
        couplePrice: 1,
      });
      setRoom(null);
      setSeatLayout(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, open, defaultCinemaId]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const convertLayoutToBackendFormat = (layout: SeatLayout | null) => {
        if (!layout) return undefined;
        return layout.seats
          .map((row, rowIndex) =>
            row.map((seat, colIndex) => ({
              row: String.fromCharCode(65 + rowIndex),
              col: colIndex + 1,
              type: seat.type,
            }))
          )
          .flat()
          .filter((seat) => seat.type !== SeatType.EMPTY);
      };

      if (isEditing && roomId) {
        const updateData: UpdateRoomData = {
          name: data.name,
          cinemaId: data.cinemaId,
          seatLayout:
            convertLayoutToBackendFormat(seatLayout) ?? room?.seatLayout,
          vipPrice: data.vipPrice,
          couplePrice: data.couplePrice,
        };
        await updateRoom(roomId, updateData);
        toast.success("Room updated successfully!");
      } else {
        const layoutToUse =
          convertLayoutToBackendFormat(seatLayout) ??
          Array(5)
            .fill(null)
            .map((_, row) =>
              Array(10)
                .fill(null)
                .map((_, col) => ({
                  row: String.fromCharCode(65 + row),
                  col: col + 1,
                  type: "NORMAL",
                }))
            )
            .flat();

        const createData: CreateRoomData = {
          name: data.name,
          cinemaId: data.cinemaId,
          seatLayout: layoutToUse,
          vipPrice: data.vipPrice,
          couplePrice: data.couplePrice,
        };
        await createRoom(createData);
        toast.success("Room created successfully!");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating room:", error);
      const message =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} room`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSeatLayout(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Room" : "Create New Room"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the room information below."
              : "Fill in the details to create a new room."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cinemaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cinema</FormLabel>
                  <FormControl>
                    <CinemaSelector
                      value={field.value ? [field.value] : []}
                      onValueChange={(values) =>
                        field.onChange(values[0] || "")
                      }
                      placeholder="Select a cinema"
                      multiple={false}
                      disabled={isEditing || !!defaultCinemaId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vipPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIP Seat Extra Price (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.00"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseFloat(value) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="couplePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couple Seat Extra Price (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.00"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? 0 : parseFloat(value) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Seat Layout</FormLabel>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLayoutModalOpen(true)}
              >
                {seatLayout ? "Edit room layout" : "Configure room layout"}
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                )}
                {isEditing ? "Update" : "Create"} Room
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <RoomLayoutModal
        open={layoutModalOpen}
        onOpenChange={setLayoutModalOpen}
        roomName={form.getValues("name") || "Room"}
        onSave={(layout) => {
          setSeatLayout(layout);
          toast.success("Room layout saved!");
        }}
        initialLayout={seatLayout ?? undefined}
      />
    </Dialog>
  );
}
