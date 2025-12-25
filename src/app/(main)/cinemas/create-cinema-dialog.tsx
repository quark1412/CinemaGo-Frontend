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
import { RoomLayoutModal } from "../rooms/room-layout-modal";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import {
  SelectItem,
  SelectContent,
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng điền tên rạp"),
  address: z.string().min(1, "Vui lòng điền địa chỉ"),
  city: z.string().min(1, "Vui lòng chọn thành phố"),
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
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      const response = await axios.get(
        "https://open.oapi.vn/location/provinces?page=0&size=100"
      );
      setCities(
        response.data.data.map((city: any) => ({
          id: city.id,
          name: city.name,
        }))
      );
      console.log(response.data.data);
    };
    fetchCities();
  }, []);

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
      console.log("Error creating cinema:", error);
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
            <DialogTitle>Tạo rạp mới</DialogTitle>
            <DialogDescription>
              Bước {currentStep} / 3:{" "}
              {currentStep === 1
                ? "Điền thông tin rạp"
                : currentStep === 2
                ? "Thêm phòng"
                : "Xem lại và tạo"}
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
                <div className="flex flex-row gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Tên rạp</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên rạp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Thành phố</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn thành phố" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập địa chỉ chi tiết"
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
                        <FormLabel>Kinh độ (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Ví dụ: 40.7128"
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
                        <FormLabel>Vĩ độ (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="Ví dụ: -74.0060"
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
                <h3 className="text-lg font-semibold">Phòng</h3>
                <Button onClick={handleAddRoom} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm phòng
                </Button>
              </div>

              {rooms.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Chưa có phòng nào được thêm
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
                                  Phòng đã sắp xếp bố cục
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
                                    Tên phòng
                                  </label>
                                  <Input
                                    placeholder="Nhập tên phòng"
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
                                    Giá ghế VIP (VND)
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
                                    Giá ghế đôi (VND)
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
                                  ? "Sửa bố cục phòng"
                                  : "Cấu hình bố cục phòng"}
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
                  <CardTitle>Thông tin rạp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Tên:</span>{" "}
                    {form.getValues().name}
                  </div>
                  <div>
                    <span className="font-medium">Thành phố:</span>{" "}
                    {form.getValues().city}
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {form.getValues().address}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phòng ({rooms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <p className="text-muted-foreground">
                      Chưa có phòng nào được thêm
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((room, index) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {room.name || `Phòng ${index + 1}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              VIP: {formatPrice(room.vipPrice)} | Đôi:{" "}
                              {formatPrice(room.couplePrice)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {room.layout
                              ? "Bố cục đã cấu hình"
                              : "Chưa có bố cục"}
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
              Hủy
            </Button>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
              >
                Trước
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
                    }
                  } else if (currentStep === 2) {
                    // Validate rooms
                    const invalidRooms = rooms.filter(
                      (room) => !room.name || !room.layout
                    );
                    if (invalidRooms.length > 0) {
                      toast.error(
                        "Vui lòng hoàn thành tất cả thông tin phòng và cấu hình bố cục trước khi tiếp tục"
                      );
                      return;
                    }
                    setCurrentStep(3);
                  }
                }}
                disabled={loading}
              >
                Tiếp
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
                Tạo rạp
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
