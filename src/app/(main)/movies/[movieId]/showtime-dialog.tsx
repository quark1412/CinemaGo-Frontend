"use client";

import { useState, useEffect, useCallback } from "react";
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
import { cn, formatPrice } from "@/lib/utils";
import {
  createShowtime,
  updateShowtime,
  CreateShowtimeRequest,
  UpdateShowtimeRequest,
  getBusyRoomIds,
} from "@/services/showtimes";
import { getAllRooms, getAllCinemas } from "@/services/cinemas";
import { Showtime } from "@/types/showtime";
import { Room, Cinema } from "@/types/cinema";
import { Movie } from "@/types/movie";
import { LANGUAGES, FORMATS } from "@/lib/constants";
import { Plus, X } from "lucide-react";

const showtimeSchema = z.object({
  cinemaId: z.string().min(1, "Cinema is required"),
  roomId: z.string().min(1, "Room is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  startTimes: z.array(z.string()).min(1, "At least one start time is required"),
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
  movie: Movie;
  showtime?: Showtime;
  onSuccess: () => void;
}

export function ShowtimeDialog({
  open,
  onOpenChange,
  movieId,
  movie,
  showtime,
  onSuccess,
}: ShowtimeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const [startTimes, setStartTimes] = useState<string[]>(["09:00"]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isEditing = !!showtime;

  const form = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      cinemaId: "",
      roomId: "",
      startDate: new Date(),
      startTimes: ["09:00"],
      price: 0,
      language: "English",
      subtitle: false,
      format: "2D",
    },
  });

  const fetchCinemas = useCallback(async () => {
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
  }, []);

  const fetchRooms = useCallback(async (cinemaId: string) => {
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
  }, []);

  useEffect(() => {
    if (open) {
      fetchCinemas();
    }
  }, [open, fetchCinemas]);

  useEffect(() => {
    if (showtime && open) {
      const startDate = new Date(showtime.startTime);

      // Set the cinema ID and fetch rooms
      setSelectedCinemaId(showtime.cinemaId);
      fetchRooms(showtime.cinemaId);

      form.reset({
        cinemaId: showtime.cinemaId,
        roomId: showtime.roomId,
        startDate,
        startTimes: [format(startDate, "HH:mm")],
        price: showtime.price,
        language: showtime.language,
        subtitle: showtime.subtitle,
        format: showtime.format,
      });
      setStartTimes([format(startDate, "HH:mm")]);
    } else if (!showtime && open) {
      setSelectedCinemaId("");
      setRooms([]);
      setStartTimes(["09:00"]);
      form.reset({
        cinemaId: "",
        roomId: "",
        startDate: new Date(),
        startTimes: ["09:00"],
        price: 0,
        language: "English",
        subtitle: false,
        format: "2D",
      });
    }
  }, [showtime, open]);

  const handleCinemaChange = useCallback(
    (cinemaId: string) => {
      setSelectedCinemaId(cinemaId);
      form.setValue("cinemaId", cinemaId);
      form.setValue("roomId", "");
      fetchRooms(cinemaId);
    },
    [form, fetchRooms]
  );

  const addStartTime = useCallback(() => {
    const newStartTimes = [...startTimes, "09:00"];
    setStartTimes(newStartTimes);
    form.setValue("startTimes", newStartTimes);

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [startTimes, form, validationErrors.length]);

  const removeStartTime = useCallback(
    (index: number) => {
      if (startTimes.length > 1) {
        const newStartTimes = startTimes.filter((_, i) => i !== index);
        setStartTimes(newStartTimes);
        form.setValue("startTimes", newStartTimes);

        // Clear validation errors when user makes changes
        if (validationErrors.length > 0) {
          setValidationErrors([]);
        }
      }
    },
    [startTimes, form, validationErrors.length]
  );

  const updateStartTime = useCallback(
    (index: number, time: string) => {
      const newStartTimes = [...startTimes];
      newStartTimes[index] = time;
      setStartTimes(newStartTimes);
      form.setValue("startTimes", newStartTimes);

      // Clear validation errors when user makes changes
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    },
    [startTimes, form, validationErrors.length]
  );

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  const checkTimeOverlap = (
    time1Start: string,
    time1End: string,
    time2Start: string,
    time2End: string
  ) => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const start1 = parseTime(time1Start);
    const end1 = parseTime(time1End);
    const start2 = parseTime(time2Start);
    const end2 = parseTime(time2End);

    // Check if times overlap
    return start1 < end2 && start2 < end1;
  };

  const validateShowtimes = async (data: ShowtimeFormData) => {
    const errors: string[] = [];

    // Check for overlaps within the new showtimes
    for (let i = 0; i < data.startTimes.length; i++) {
      for (let j = i + 1; j < data.startTimes.length; j++) {
        const startTime1 = data.startTimes[i];
        const endTime1 = calculateEndTime(startTime1, movie.duration);
        const startTime2 = data.startTimes[j];
        const endTime2 = calculateEndTime(startTime2, movie.duration);

        if (checkTimeOverlap(startTime1, endTime1, startTime2, endTime2)) {
          errors.push(
            `Showtime at ${startTime1} overlaps with showtime at ${startTime2}`
          );
        }
      }
    }

    // Check for overlaps with existing showtimes in the same room
    if (data.roomId && data.startTimes.length > 0) {
      try {
        const startDate = data.startDate;

        for (const startTime of data.startTimes) {
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const startDateTime = new Date(startDate);
          startDateTime.setHours(startHours, startMinutes, 0, 0);

          const endTime = calculateEndTime(startTime, movie.duration);
          const [endHours, endMinutes] = endTime.split(":").map(Number);
          const endDateTime = new Date(startDate);
          endDateTime.setHours(endHours, endMinutes, 0, 0);

          const busyRooms = await getBusyRoomIds(
            startDateTime.toISOString(),
            endDateTime.toISOString(),
            data.cinemaId
          );

          if (busyRooms.data.includes(data.roomId)) {
            errors.push(`Room is already booked for showtime at ${startTime}`);
          }
        }
      } catch (error) {
        console.error("Error checking busy rooms:", error);
        errors.push("Failed to validate room availability");
      }
    }

    return errors;
  };

  const onSubmit = async (data: ShowtimeFormData) => {
    try {
      setLoading(true);
      setValidationErrors([]);

      // Validate showtimes before creating
      const validationErrors = await validateShowtimes(data);
      if (validationErrors.length > 0) {
        setValidationErrors(validationErrors);
        toast.error("Validation failed. Please check the errors below.");
        return;
      }

      if (isEditing) {
        // For editing, only handle the first start time
        const [startHours, startMinutes] = data.startTimes[0]
          .split(":")
          .map(Number);
        const startDateTime = new Date(data.startDate);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = calculateEndTime(data.startTimes[0], movie.duration);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const endDateTime = new Date(data.startDate);
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

        await updateShowtime(showtime.id, requestData);
        toast.success("Showtime updated successfully!");
      } else {
        // For creating, handle multiple start times
        const promises = data.startTimes.map(async (startTime) => {
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const startDateTime = new Date(data.startDate);
          startDateTime.setHours(startHours, startMinutes, 0, 0);

          const endTime = calculateEndTime(startTime, movie.duration);
          const [endHours, endMinutes] = endTime.split(":").map(Number);
          const endDateTime = new Date(data.startDate);
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

          return createShowtime(requestData);
        });

        await Promise.all(promises);
        toast.success(
          `${data.startTimes.length} showtime(s) created successfully!`
        );
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
                    <FormLabel>Price (VND)</FormLabel>
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

            {/* Start Date */}
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
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Times */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Start Times</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStartTime}
                  disabled={isEditing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time
                </Button>
              </div>
              {startTimes.map((time, index) => {
                const endTime = calculateEndTime(time, movie.duration);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateStartTime(index, e.target.value)}
                        disabled={isEditing}
                        className="flex-1"
                      />
                      {!isEditing && startTimes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStartTime(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      Duration: {movie.duration} min • Ends at: {endTime}
                    </div>
                  </div>
                );
              })}
              <FormField
                control={form.control}
                name="startTimes"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
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
                        {LANGUAGES.map((language) => (
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
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
                        {FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
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

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">
                  Validation Errors:
                </h4>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
