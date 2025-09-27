"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Room, CreateRoomData, UpdateRoomData } from "@/types/cinema";
import { createRoom, updateRoom } from "@/services/cinemas";
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

const formSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  cinemaId: z.string().min(1, "Cinema is required"),
  vipPrice: z.number().min(0, "VIP price must be 0 or greater"),
  couplePrice: z.number().min(0, "Couple price must be 0 or greater"),
});

type FormData = z.infer<typeof formSchema>;

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSuccess?: () => void;
}

export function RoomDialog({
  open,
  onOpenChange,
  room,
  onSuccess,
}: RoomDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!room;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cinemaId: "",
      vipPrice: 0,
      couplePrice: 0,
    },
  });

  useEffect(() => {
    if (room) {
      form.reset({
        name: room.name,
        cinemaId: room.cinemaId,
        vipPrice: 0,
        couplePrice: 0,
      });
    } else {
      form.reset({
        name: "",
        cinemaId: "",
        vipPrice: 0,
        couplePrice: 0,
      });
    }
  }, [room, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isEditing && room) {
        const updateData: UpdateRoomData = {
          name: data.name,
          cinemaId: data.cinemaId,
          seatLayout: room.seatLayout,
          vipPrice: data.vipPrice,
          couplePrice: data.couplePrice,
        };
        await updateRoom(room.id, updateData);
        toast.success("Room updated successfully!");
      } else {
        const basicSeatLayout = Array(5)
          .fill(null)
          .map((_, row) =>
            Array(10)
              .fill(null)
              .map((_, col) => ({
                row: String.fromCharCode(65 + row),
                col: col + 1,
                type: "NORMAL",
              }))
          );

        console.log(basicSeatLayout);

        const createData: CreateRoomData = {
          name: data.name,
          cinemaId: data.cinemaId,
          seatLayout: basicSeatLayout,
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
                      disabled={isEditing} // Don't allow changing cinema for existing rooms
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
                    <FormLabel>VIP Seat Extra Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                    <FormLabel>Couple Seat Extra Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
    </Dialog>
  );
}
