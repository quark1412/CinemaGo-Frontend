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
import { getAllMovies, getMovieById } from "@/services/movies";
import { Showtime } from "@/types/showtime";
import { Room, Cinema } from "@/types/cinema";
import { Movie } from "@/types/movie";
import { LANGUAGES, FORMATS } from "@/lib/constants";
import { Plus, X } from "lucide-react";
import { MovieSelector } from "@/components/movie-selector";
import { useI18n } from "@/contexts/I18nContext";

const getShowtimeSchema = (t: (key: string) => string) =>
  z.object({
    movieId: z.string().min(1, t("showtimes.validation.movieRequired")),
    cinemaId: z.string().min(1, t("showtimes.validation.cinemaRequired")),
    roomId: z.string().min(1, t("showtimes.validation.roomRequired")),
    startDate: z.date({
      message: t("showtimes.validation.startDateRequired"),
    }),
    startTimes: z
      .array(z.string())
      .min(1, t("showtimes.validation.startTimeRequired")),
    price: z.number().min(0, t("showtimes.validation.pricePositive")),
    language: z.string().min(1, t("showtimes.validation.languageRequired")),
    subtitle: z.boolean(),
    format: z.string().min(1, t("showtimes.validation.formatRequired")),
  });

type ShowtimeFormData = z.infer<ReturnType<typeof getShowtimeSchema>>;

interface ShowtimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId?: string;
  movie?: Movie;
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
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const [startTimes, setStartTimes] = useState<string[]>(["09:00"]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isEditing = !!showtime;

  const showtimeSchema = getShowtimeSchema(t);

  const form = useForm<ShowtimeFormData>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: movieId || "",
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
      toast.error(
        t(
          isEditing
            ? "showtimes.updateShowtime.fetchCinemasError"
            : "showtimes.createShowtime.fetchCinemasError"
        )
      );
      console.error("Error fetching cinemas:", error);
    } finally {
      setCinemasLoading(false);
    }
  }, [t, isEditing]);

  const fetchRooms = useCallback(
    async (cinemaId: string) => {
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
        toast.error(
          t(
            isEditing
              ? "showtimes.updateShowtime.fetchRoomsError"
              : "showtimes.createShowtime.fetchRoomsError"
          )
        );
        console.error("Error fetching rooms:", error);
      } finally {
        setRoomsLoading(false);
      }
    },
    [t, isEditing]
  );

  const fetchMovie = useCallback(
    async (movieId: string) => {
      try {
        setMoviesLoading(true);
        const response = await getMovieById(movieId);
        setSelectedMovie(response.data);
      } catch (error: any) {
        toast.error(
          t(
            isEditing
              ? "showtimes.updateShowtime.fetchMovieError"
              : "showtimes.createShowtime.fetchMovieError"
          )
        );
        console.error("Error fetching movie:", error);
      } finally {
        setMoviesLoading(false);
      }
    },
    [t, isEditing]
  );

  useEffect(() => {
    if (open) {
      fetchCinemas();
      // Initialize movie
      if (movieId && movie) {
        setSelectedMovie(movie);
        form.setValue("movieId", movieId);
      } else if (movieId && !movie) {
        fetchMovie(movieId);
        form.setValue("movieId", movieId);
      } else if (showtime?.movieId) {
        fetchMovie(showtime.movieId);
        form.setValue("movieId", showtime.movieId);
      }
    }
  }, [open, fetchCinemas, movieId, movie, showtime, fetchMovie, form]);

  useEffect(() => {
    if (!open) {
      setValidationErrors([]);
    }
  }, [open]);

  useEffect(() => {
    if (showtime && open) {
      const startDate = new Date(showtime.startTime);

      // Set the cinema ID and fetch rooms
      setSelectedCinemaId(showtime.cinemaId);
      fetchRooms(showtime.cinemaId);

      form.reset({
        movieId: showtime.movieId,
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
        movieId: movieId || "",
        cinemaId: "",
        roomId: "",
        startDate: new Date(),
        startTimes: ["09:00"],
        price: 0,
        language: "English",
        subtitle: false,
        format: "2D",
      });
      if (!movieId) {
        setSelectedMovie(null);
      }
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

  const handleMovieChange = useCallback(
    async (movieIds: string[]) => {
      const selectedMovieId = movieIds[0];
      if (selectedMovieId) {
        form.setValue("movieId", selectedMovieId);
        await fetchMovie(selectedMovieId);
      } else {
        form.setValue("movieId", "");
        setSelectedMovie(null);
      }
    },
    [form, fetchMovie]
  );

  const calculateEndTime = (
    startTime: string,
    duration: number
  ): { time: string; isNextDay: boolean } => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    // Check if end time crosses to the next day (24 hours = 1440 minutes)
    const isNextDay = endHours >= 24;
    const displayHours = isNextDay ? endHours % 24 : endHours;

    return {
      time: `${displayHours.toString().padStart(2, "0")}:${endMins
        .toString()
        .padStart(2, "0")}`,
      isNextDay,
    };
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
        if (!selectedMovie) return errors;
        const startTime1 = data.startTimes[i];
        const endTime1Result = calculateEndTime(
          startTime1,
          selectedMovie.duration
        );
        const startTime2 = data.startTimes[j];
        const endTime2Result = calculateEndTime(
          startTime2,
          selectedMovie.duration
        );

        if (
          checkTimeOverlap(
            startTime1,
            endTime1Result.time,
            startTime2,
            endTime2Result.time
          )
        ) {
          const errorMsg = t(
            isEditing
              ? "showtimes.updateShowtime.overlapError"
              : "showtimes.createShowtime.overlapError"
          )
            .replace("{startTime1}", startTime1)
            .replace("{startTime2}", startTime2);
          errors.push(errorMsg);
        }
      }
    }

    // Check for overlaps with existing showtimes in the same room
    if (data.roomId && data.startTimes.length > 0) {
      try {
        const startDate = data.startDate;

        if (!selectedMovie) return errors;
        for (const startTime of data.startTimes) {
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const startDateTime = new Date(startDate);
          startDateTime.setHours(startHours, startMinutes, 0, 0);

          const endTimeResult = calculateEndTime(
            startTime,
            selectedMovie.duration
          );
          const [endHours, endMinutes] = endTimeResult.time
            .split(":")
            .map(Number);
          const endDateTime = new Date(startDate);
          endDateTime.setHours(endHours, endMinutes, 0, 0);
          // Add a day if end time crosses to the next day
          if (endTimeResult.isNextDay) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }

          if (!isEditing) {
            const busyRooms = await getBusyRoomIds(
              startDateTime.toISOString(),
              endDateTime.toISOString(),
              data.cinemaId
            );

            if (busyRooms.data.includes(data.roomId)) {
              const errorMsg = t(
                isEditing
                  ? "showtimes.updateShowtime.roomBookedError"
                  : "showtimes.createShowtime.roomBookedError"
              ).replace("{startTime}", startTime);
              errors.push(errorMsg);
            }
          }
        }
      } catch (error) {
        console.error("Error checking busy rooms:", error);
        errors.push(
          t(
            isEditing
              ? "showtimes.updateShowtime.validateAvailabilityError"
              : "showtimes.createShowtime.validateAvailabilityError"
          )
        );
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
        toast.error(
          t(
            isEditing
              ? "showtimes.updateShowtime.validationFailed"
              : "showtimes.createShowtime.validationFailed"
          )
        );
        return;
      }

      if (isEditing) {
        // For editing, only handle the first start time
        const [startHours, startMinutes] = data.startTimes[0]
          .split(":")
          .map(Number);
        const startDateTime = new Date(data.startDate);
        startDateTime.setHours(startHours, startMinutes, 0, 0);

        if (!selectedMovie) {
          toast.error(
            t(
              isEditing
                ? "showtimes.updateShowtime.selectMovieError"
                : "showtimes.createShowtime.selectMovieError"
            )
          );
          return;
        }
        const endTimeResult = calculateEndTime(
          data.startTimes[0],
          selectedMovie.duration
        );
        const [endHours, endMinutes] = endTimeResult.time
          .split(":")
          .map(Number);
        const endDateTime = new Date(data.startDate);
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        // Add a day if end time crosses to the next day
        if (endTimeResult.isNextDay) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const requestData = {
          movieId: data.movieId,
          roomId: data.roomId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          price: data.price,
          language: data.language,
          subtitle: data.subtitle,
          format: data.format,
        };

        await updateShowtime(showtime.id, requestData);
        toast.success(t("showtimes.updateShowtime.updateSuccess"));
      } else {
        // For creating, handle multiple start times
        const promises = data.startTimes.map(async (startTime) => {
          const [startHours, startMinutes] = startTime.split(":").map(Number);
          const startDateTime = new Date(data.startDate);
          startDateTime.setHours(startHours, startMinutes, 0, 0);

          if (!selectedMovie) {
            toast.error("Please select a movie");
            return;
          }
          const endTimeResult = calculateEndTime(
            startTime,
            selectedMovie.duration
          );
          const [endHours, endMinutes] = endTimeResult.time
            .split(":")
            .map(Number);
          const endDateTime = new Date(data.startDate);
          endDateTime.setHours(endHours, endMinutes, 0, 0);
          // Add a day if end time crosses to the next day
          if (endTimeResult.isNextDay) {
            endDateTime.setDate(endDateTime.getDate() + 1);
          }

          const requestData = {
            movieId: data.movieId,
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
          `${data.startTimes.length} ${t(
            "showtimes.createShowtime.createSuccess"
          )}`
        );
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        t(
          isEditing
            ? "showtimes.updateShowtime.updateError"
            : "showtimes.createShowtime.createError"
        );
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
            {t(
              isEditing
                ? "showtimes.updateShowtime.title"
                : "showtimes.createShowtime.title"
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              isEditing
                ? "showtimes.updateShowtime.description"
                : "showtimes.createShowtime.description"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Movie Selection */}
            <FormField
              control={form.control}
              name="movieId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      isEditing
                        ? "showtimes.updateShowtime.movieLabel"
                        : "showtimes.createShowtime.movieLabel"
                    )}
                  </FormLabel>
                  <FormControl>
                    <MovieSelector
                      value={field.value ? [field.value] : []}
                      onValueChange={handleMovieChange}
                      placeholder={t(
                        isEditing
                          ? "showtimes.updateShowtime.moviePlaceholder"
                          : "showtimes.createShowtime.moviePlaceholder"
                      )}
                      disabled={isEditing || !!movieId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cinema Selection */}
            <FormField
              control={form.control}
              name="cinemaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      isEditing
                        ? "showtimes.updateShowtime.cinemaLabel"
                        : "showtimes.createShowtime.cinemaLabel"
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={handleCinemaChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-24">
                        <SelectValue
                          placeholder={
                            cinemasLoading
                              ? t(
                                  isEditing
                                    ? "showtimes.updateShowtime.cinemaLoading"
                                    : "showtimes.createShowtime.cinemaLoading"
                                )
                              : t(
                                  isEditing
                                    ? "showtimes.updateShowtime.cinemaPlaceholder"
                                    : "showtimes.createShowtime.cinemaPlaceholder"
                                )
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {cinemasLoading ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t(
                            isEditing
                              ? "showtimes.updateShowtime.cinemaLoading"
                              : "showtimes.createShowtime.cinemaLoading"
                          )}
                        </div>
                      ) : cinemas.length === 0 ? (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          {t(
                            isEditing
                              ? "showtimes.updateShowtime.noCinemas"
                              : "showtimes.createShowtime.noCinemas"
                          )}
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
                    <FormLabel>
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.roomLabel"
                          : "showtimes.createShowtime.roomLabel"
                      )}
                    </FormLabel>
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
                                ? t(
                                    isEditing
                                      ? "showtimes.updateShowtime.roomPlaceholderNoCinema"
                                      : "showtimes.createShowtime.roomPlaceholderNoCinema"
                                  )
                                : roomsLoading
                                ? t(
                                    isEditing
                                      ? "showtimes.updateShowtime.roomLoading"
                                      : "showtimes.createShowtime.roomLoading"
                                  )
                                : t(
                                    isEditing
                                      ? "showtimes.updateShowtime.roomPlaceholder"
                                      : "showtimes.createShowtime.roomPlaceholder"
                                  )
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {!selectedCinemaId ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground">
                            {t(
                              isEditing
                                ? "showtimes.updateShowtime.selectCinemaFirst"
                                : "showtimes.createShowtime.selectCinemaFirst"
                            )}
                          </div>
                        ) : roomsLoading ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t(
                              isEditing
                                ? "showtimes.updateShowtime.roomLoading"
                                : "showtimes.createShowtime.roomLoading"
                            )}
                          </div>
                        ) : rooms.length === 0 ? (
                          <div className="px-2 py-3 text-sm text-muted-foreground">
                            {t(
                              isEditing
                                ? "showtimes.updateShowtime.noRooms"
                                : "showtimes.createShowtime.noRooms"
                            )}
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
                                    [{room.totalSeats} {t("rooms.seats")}]
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
                    <FormLabel>
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.priceLabel"
                          : "showtimes.createShowtime.priceLabel"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t(
                          isEditing
                            ? "showtimes.updateShowtime.pricePlaceholder"
                            : "showtimes.createShowtime.pricePlaceholder"
                        )}
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
                  <FormLabel>
                    {t(
                      isEditing
                        ? "showtimes.updateShowtime.startDateLabel"
                        : "showtimes.createShowtime.startDateLabel"
                    )}
                  </FormLabel>
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
                            <span>
                              {t(
                                isEditing
                                  ? "showtimes.updateShowtime.pickDate"
                                  : "showtimes.createShowtime.pickDate"
                              )}
                            </span>
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
                <FormLabel>
                  {t(
                    isEditing
                      ? "showtimes.updateShowtime.startTimesLabel"
                      : "showtimes.createShowtime.startTimesLabel"
                  )}
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStartTime}
                  disabled={isEditing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t(
                    isEditing
                      ? "showtimes.updateShowtime.addTime"
                      : "showtimes.createShowtime.addTime"
                  )}
                </Button>
              </div>
              {startTimes.map((time, index) => {
                const endTimeResult = selectedMovie
                  ? calculateEndTime(time, selectedMovie.duration)
                  : null;
                const nextDayText = t(
                  isEditing
                    ? "showtimes.updateShowtime.nextDay"
                    : "showtimes.createShowtime.nextDay"
                );
                const endTimeDisplay = endTimeResult
                  ? endTimeResult.isNextDay
                    ? `${endTimeResult.time} ${nextDayText}`
                    : endTimeResult.time
                  : "";
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
                    {selectedMovie && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {t(
                          isEditing
                            ? "showtimes.updateShowtime.duration"
                            : "showtimes.createShowtime.duration"
                        )}
                        : {selectedMovie.duration} min •{" "}
                        {t(
                          isEditing
                            ? "showtimes.updateShowtime.endsAt"
                            : "showtimes.createShowtime.endsAt"
                        )}
                        : {endTimeDisplay}
                      </div>
                    )}
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
                    <FormLabel>
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.languageLabel"
                          : "showtimes.createShowtime.languageLabel"
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              isEditing
                                ? "showtimes.updateShowtime.languagePlaceholder"
                                : "showtimes.createShowtime.languagePlaceholder"
                            )}
                          />
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
                    <FormLabel>
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.formatLabel"
                          : "showtimes.createShowtime.formatLabel"
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              isEditing
                                ? "showtimes.updateShowtime.formatPlaceholder"
                                : "showtimes.createShowtime.formatPlaceholder"
                            )}
                          />
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
                    <FormLabel className="text-base">
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.subtitlesLabel"
                          : "showtimes.createShowtime.subtitlesLabel"
                      )}
                    </FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      {t(
                        isEditing
                          ? "showtimes.updateShowtime.subtitlesDescription"
                          : "showtimes.createShowtime.subtitlesDescription"
                      )}
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
                  {t(
                    isEditing
                      ? "showtimes.updateShowtime.validationErrors"
                      : "showtimes.createShowtime.validationErrors"
                  )}
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
                {t(
                  isEditing
                    ? "showtimes.updateShowtime.cancel"
                    : "showtimes.createShowtime.cancel"
                )}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing
                  ? t("showtimes.updateShowtime.update")
                  : t("showtimes.createShowtime.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
