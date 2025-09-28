"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createShowtime,
  updateShowtime,
  CreateShowtimeRequest,
  UpdateShowtimeRequest,
} from "@/services/showtimes";
import { getAllRooms, getAllCinemas } from "@/services/cinemas";
import { Showtime } from "@/types/showtime";
import { Room, Cinema } from "@/types/cinema";

const showtimeSchema = z.object({
  cinemaId: z.string().min(1, "Cinema is required"),
  roomId: z.string().min(1, "Room is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.date({
    message: "End date is required",
  }),
  endTime: z.string().min(1, "End time is required"),
  price: z.number().min(0, "Price must be positive"),
  language: z.string().min(1, "Language is required"),
  subtitle: z.boolean(),
  format: z.string().min(1, "Format is required"),
});

type ShowtimeFormData = z.infer<typeof showtimeSchema>;

interface ShowtimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string;
  showtime?: Showtime;
  onSuccess: () => void;
}

export function ShowtimeDialog({
  open,
  onOpenChange,
  movieId,
  showtime,
  onSuccess,
}: ShowtimeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const isEditing = !!showtime;

  const form = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      cinemaId: "",
      roomId: "",
      startDate: new Date(),
      startTime: "09:00",
      endDate: new Date(),
      endTime: "11:00",
      price: 0,
      language: "English",
      subtitle: false,
      format: "2D",
    },
  });

  const fetchCinemas = async () => {
    try {
      setCinemasLoading(true);
      let allCinemas: Cinema[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getAllCinemas({
          page: currentPage,
          isActive: true,
        });

        allCinemas = [...allCinemas, ...response.data];

        hasMore = response.pagination.hasNextPage;
        currentPage++;
      }

      setCinemas(allCinemas);
    } catch (error: any) {
      toast.error("Failed to fetch cinemas");
      console.error("Error fetching cinemas:", error);
    } finally {
      setCinemasLoading(false);
    }
  };

  const fetchRooms = async (cinemaId: string) => {
    if (!cinemaId) {
      setRooms([]);
      return;
    }

    try {
      setRoomsLoading(true);
      let allRooms: Room[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getAllRooms({
          page: currentPage,
          cinemaId: cinemaId,
          isActive: true,
        });

        allRooms = [...allRooms, ...response.data];

        hasMore = response.pagination.hasNextPage;
        currentPage++;
      }

      setRooms(allRooms);
    } catch (error: any) {
      toast.error("Failed to fetch rooms");
      console.error("Error fetching rooms:", error);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCinemas();
    }
  }, [open]);

  useEffect(() => {
    if (showtime && open) {
      const startDate = new Date(showtime.startTime);
      const endDate = new Date(showtime.endTime);

      // Set the cinema ID and fetch rooms
      setSelectedCinemaId(showtime.cinemaId);
      fetchRooms(showtime.cinemaId);

      form.reset({
        cinemaId: showtime.cinemaId,
        roomId: showtime.roomId,
        startDate,
        startTime: format(startDate, "HH:mm"),
        endDate,
        endTime: format(endDate, "HH:mm"),
        price: showtime.price,
        language: showtime.language,
        subtitle: showtime.subtitle,
        format: showtime.format,
      });
    } else if (!showtime && open) {
      setSelectedCinemaId("");
      setRooms([]);
      form.reset({
        cinemaId: "",
        roomId: "",
        startDate: new Date(),
        startTime: "09:00",
        endDate: new Date(),
        endTime: "11:00",
        price: 0,
        language: "English",
        subtitle: false,
        format: "2D",
      });
    }
  }, [showtime, open, form]);

  const handleCinemaChange = (cinemaId: string) => {
    setSelectedCinemaId(cinemaId);
    form.setValue("cinemaId", cinemaId);
    form.setValue("roomId", "");
    fetchRooms(cinemaId);
  };

  const onSubmit = async (data: ShowtimeFormData) => {
    try {
      setLoading(true);

      // Combine date and time
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);

      const startDateTime = new Date(data.startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(data.endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const requestData = {
        movieId,
        roomId: data.roomId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        price: data.price,
        language: data.language,
        subtitle: data.subtitle,
        format: data.format,
      };

      if (isEditing) {
        await updateShowtime(showtime.id, requestData);
        toast.success("Showtime updated successfully!");
      } else {
        await createShowtime(requestData);
        toast.success("Showtime created successfully!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} showtime`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Showtime" : "Add New Showtime"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the showtime details below."
              : "Fill in the details to create a new showtime for this movie."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Cinema Selection */}
            <FormField
              control={form.control}
              name="cinemaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cinema</FormLabel>
                  <Select
                    onValueChange={handleCinemaChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-24">
                        <SelectValue
                          placeholder={
                            cinemasLoading
                              ? "Loading cinemas..."
                              : "Select a cinema"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {cinemasLoading ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading cinemas...
                        </div>
                      ) : cinemas.length === 0 ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No cinemas available
                        </div>
                      ) : (
                        cinemas.map((cinema) => (
                          <SelectItem key={cinema.id} value={cinema.id}>
                            <div className="flex items-center gap-10">
                              <span>
                                {cinema.name}{" "}
                                <span className="text-xs text-muted-foreground">
                                  ({cinema.city})
                                </span>
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room */}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCinemaId}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-20">
                          <SelectValue
                            placeholder={
                              !selectedCinemaId
                                ? "Select a cinema first"
                                : roomsLoading
                                ? "Loading rooms..."
                                : "Select a room"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {!selectedCinemaId ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground">
                            Please select a cinema first
                          </div>
                        ) : roomsLoading ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading rooms...
                          </div>
                        ) : rooms.length === 0 ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground">
                            No rooms available for this cinema
                          </div>
                        ) : (
                          rooms.map((room) => (
                            <SelectItem
                              key={room.id}
                              value={room.id}
                              className="w-full"
                            >
                              <div className="flex items-center gap-10">
                                <span>
                                  {room.name}{" "}
                                  <span className="text-xs text-muted-foreground">
                                    [{room.totalSeats} seats]
                                  </span>
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Korean">Korean</SelectItem>
                        <SelectItem value="Mandarin">Mandarin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Format */}
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2D">2D</SelectItem>
                        <SelectItem value="3D">3D</SelectItem>
                        <SelectItem value="IMAX">IMAX</SelectItem>
                        <SelectItem value="4DX">4DX</SelectItem>
                        <SelectItem value="Dolby Atmos">Dolby Atmos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Subtitle */}
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Subtitles</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      Enable subtitles for this showtime
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Showtime
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
