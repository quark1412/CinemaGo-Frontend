"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { CreateCinemaData } from "@/types/cinema";
import { SeatLayout, SeatType } from "@/types/seat";
import { useCreateCinema } from "@/hooks/use-cinemas";
import { createRoom } from "@/services/cinemas";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomLayoutModal } from "./room-layout-modal";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TempRoom {
  id: string;
  name: string;
  vipPrice: number;
  couplePrice: number;
  layout?: SeatLayout;
}

interface CreateCinemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCinemaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCinemaDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [rooms, setRooms] = useState<TempRoom[]>([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [selectedRoomForLayout, setSelectedRoomForLayout] = useState<
    number | null
  >(null);
  const [openRooms, setOpenRooms] = useState<Set<string>>(new Set());

  const createMutation = useCreateCinema();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      longitude: undefined,
      latitude: undefined,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setCurrentStep(1);
      setRooms([]);
      setEditingRoomIndex(null);
      setLayoutModalOpen(false);
      setSelectedRoomForLayout(null);
      setOpenRooms(new Set());
    }
  }, [open, form]);

  const canProceedToStep2 = () => {
    const values = form.getValues();
    const errors = form.formState.errors;
    return !!(
      values.name &&
      values.address &&
      values.city &&
      !errors.name &&
      !errors.address &&
      !errors.city
    );
  };

  const handleAddRoom = () => {
    const newRoom: TempRoom = {
      id: `temp-${Date.now()}`,
      name: "",
      vipPrice: 0,
      couplePrice: 0,
    };
    setRooms([...rooms, newRoom]);
    setEditingRoomIndex(rooms.length);
    setOpenRooms(new Set([...openRooms, newRoom.id]));
  };

  const handleUpdateRoom = (index: number, updates: Partial<TempRoom>) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], ...updates };
    setRooms(updatedRooms);
  };

  const handleDeleteRoom = (index: number) => {
    const roomToDelete = rooms[index];
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
    if (editingRoomIndex === index) {
      setEditingRoomIndex(null);
    }
    // Remove from openRooms set
    const newOpenRooms = new Set(openRooms);
    newOpenRooms.delete(roomToDelete.id);
    setOpenRooms(newOpenRooms);
  };

  const handleOpenLayoutModal = (index: number) => {
    setSelectedRoomForLayout(index);
    setLayoutModalOpen(true);
  };

  const handleSaveLayout = (layout: SeatLayout) => {
    if (selectedRoomForLayout !== null) {
      handleUpdateRoom(selectedRoomForLayout, { layout });
      setLayoutModalOpen(false);
      setSelectedRoomForLayout(null);
      toast.success("Room layout saved!");
    }
  };

  const convertLayoutToBackendFormat = (layout: SeatLayout) => {
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

  const handleFinalSubmit = async () => {
    try {
      // Create cinema
      const cinemaData: CreateCinemaData = {
        name: form.getValues().name,
        address: form.getValues().address,
        city: form.getValues().city,
        longitude: form.getValues().longitude || undefined,
        latitude: form.getValues().latitude || undefined,
      };

      const cinemaResult = await createMutation.mutateAsync(cinemaData);
      const cinemaId = cinemaResult.data.id;

      // Create rooms
      for (const room of rooms) {
        if (!room.name || !room.layout) {
          toast.error(
            `Room "${room.name || "Unnamed"}" is missing required information`
          );
          continue;
        }

        const seatLayoutData = convertLayoutToBackendFormat(room.layout);

        await createRoom({
          name: room.name,
          cinemaId: cinemaId,
          seatLayout: seatLayoutData,
          vipPrice: room.vipPrice,
          couplePrice: room.couplePrice,
        });
      }

      toast.success("Cinema and rooms created successfully!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating cinema:", error);
      const message =
        error.response?.data?.message || "Failed to create cinema";
      toast.error(message);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const loading = createMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Cinema</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3:{" "}
              {currentStep === 1
                ? "Fill in cinema information"
                : currentStep === 2
                ? "Add rooms"
                : "Review and create"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Cinema Information */}
          {currentStep === 1 && (
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cinema Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter cinema name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter full address"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g., 40.7128"
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === ""
                                  ? undefined
                                  : parseFloat(value) || undefined
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
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g., -74.0060"
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === ""
                                  ? undefined
                                  : parseFloat(value) || undefined
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}

          {/* Add Rooms */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rooms</h3>
                <Button onClick={handleAddRoom} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </Button>
              </div>

              {rooms.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No rooms added yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room, index) => {
                    const isOpen = openRooms.has(room.id);
                    return (
                      <Collapsible
                        key={room.id}
                        open={isOpen}
                        onOpenChange={(open) => {
                          const newOpenRooms = new Set(openRooms);
                          if (open) {
                            newOpenRooms.add(room.id);
                          } else {
                            newOpenRooms.delete(room.id);
                          }
                          setOpenRooms(newOpenRooms);
                        }}
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between px-4 pb-2">
                            <CollapsibleTrigger className="flex-1 flex items-center gap-2 hover:opacity-80 transition-opacity">
                              {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <CardTitle className="text-base">
                                {room.name || `Room ${index + 1}`}
                              </CardTitle>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                              {room.layout && (
                                <span className="text-xs text-muted-foreground">
                                  Layout configured
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRoom(index);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CollapsibleContent>
                            <CardContent className="space-y-4 pt-0">
                              <div className="w-full">
                                <div>
                                  <label className="text-sm font-medium">
                                    Room Name
                                  </label>
                                  <Input
                                    placeholder="Enter room name"
                                    value={room.name}
                                    onChange={(e) =>
                                      handleUpdateRoom(index, {
                                        name: e.target.value,
                                      })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">
                                    VIP Price (VND)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={room.vipPrice}
                                    onChange={(e) =>
                                      handleUpdateRoom(index, {
                                        vipPrice:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">
                                    Couple Price (VND)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={room.couplePrice}
                                    onChange={(e) =>
                                      handleUpdateRoom(index, {
                                        couplePrice:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleOpenLayoutModal(index)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {room.layout
                                  ? "Edit Room Layout"
                                  : "Configure Room Layout"}
                              </Button>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cinema Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {form.getValues().name}
                  </div>
                  <div>
                    <span className="font-medium">City:</span>{" "}
                    {form.getValues().city}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {form.getValues().address}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rooms ({rooms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <p className="text-muted-foreground">No rooms added</p>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((room, index) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {room.name || `Room ${index + 1}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              VIP: {formatPrice(room.vipPrice)} | Couple:{" "}
                              {formatPrice(room.couplePrice)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {room.layout
                              ? "✓ Layout configured"
                              : "⚠ No layout"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
              >
                Previous
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={async () => {
                  if (currentStep === 1) {
                    const isValid = await form.trigger();
                    if (isValid) {
                      setCurrentStep(2);
                    } else {
                      const errors = form.formState.errors;
                      if (errors.name) {
                        toast.error(errors.name.message as string);
                      } else if (errors.address) {
                        toast.error(errors.address.message as string);
                      } else if (errors.city) {
                        toast.error(errors.city.message as string);
                      }
                    }
                  } else if (currentStep === 2) {
                    // Validate rooms
                    const invalidRooms = rooms.filter(
                      (room) => !room.name || !room.layout
                    );
                    if (invalidRooms.length > 0) {
                      toast.error(
                        "Please complete all room information and configure layouts before proceeding"
                      );
                      return;
                    }
                    setCurrentStep(3);
                  }
                }}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={
                  loading ||
                  rooms.length === 0 ||
                  rooms.some((room) => !room.name || !room.layout)
                }
              >
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                )}
                Create Cinema
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Layout Modal */}
      {selectedRoomForLayout !== null && (
        <RoomLayoutModal
          open={layoutModalOpen}
          onOpenChange={setLayoutModalOpen}
          roomName={rooms[selectedRoomForLayout]?.name || "Room"}
          onSave={handleSaveLayout}
          initialLayout={rooms[selectedRoomForLayout]?.layout}
        />
      )}
    </>
  );
}
