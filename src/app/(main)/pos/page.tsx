"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Loader2,
  ShoppingCart,
  User,
  Calendar as CalendarIcon,
  Film,
  Armchair,
  Clock,
  MapPin,
  Globe,
  MessageSquare,
  Play,
  X,
  Search,
} from "lucide-react";
import { getAllShowtimes } from "@/services/showtimes";
import { getRoomById } from "@/services/cinemas";
import {
  createBooking,
  getBookedSeats,
  holdSeat,
  releaseSeat,
  getHeldSeats,
} from "@/services/booking";
import { Showtime } from "@/types/showtime";
import { Room, Seat as SeatType } from "@/types/cinema";
import { FoodDrink } from "@/types/fooddrink";
import { Movie } from "@/types/movie";
import {
  SeatLayout,
  SeatPosition,
  SeatType as SeatTypeEnum,
} from "@/types/seat";
import { BookingSeatGrid } from "@/components/seat-layout/booking-seat-grid";
import { format } from "date-fns";
import Image from "next/image";
import { convertToEmbedUrl, formatPrice, cn } from "@/lib/utils";
import { getSocket } from "@/services/socket";
import { getAllMovies } from "@/services/movies";
import { getAllFoodDrinks } from "@/services/fooddrinks";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { paymentService } from "@/services/payment";
import type { Booking } from "@/services/booking";

interface SelectedFoodDrink {
  foodDrink: FoodDrink;
  quantity: number;
}

interface MovieWithShowtimes extends Movie {
  showtimes: Showtime[];
}

export default function POSPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [movieSearchTerm, setMovieSearchTerm] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [selectedFoodDrinks, setSelectedFoodDrinks] = useState<
    SelectedFoodDrink[]
  >([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [seatMap, setSeatMap] = useState<Map<string, SeatType>>(new Map());
  const [seatPriceMap, setSeatPriceMap] = useState<Map<string, number>>(
    new Map()
  );
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);
  const [heldSeatIds, setHeldSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMovieForBooking, setSelectedMovieForBooking] =
    useState<Movie | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [foodDrinkSelectOpen, setFoodDrinkSelectOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO">("COD");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Set today's date as default
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, []);

  // Fetch showtimes for selected date
  const { data: showtimesData, isLoading: showtimesLoading } = useQuery({
    queryKey: ["showtimes", selectedDate],
    queryFn: () =>
      getAllShowtimes({
        isActive: true,
        startTime: selectedDate
          ? new Date(selectedDate).toISOString()
          : undefined,
        endTime: selectedDate
          ? new Date(
              new Date(selectedDate).setHours(23, 59, 59, 999)
            ).toISOString()
          : undefined,
        limit: undefined,
      }),
    enabled: !!selectedDate,
  });

  // Fetch showtimes for selected movie when booking
  const { data: movieShowtimesData, isLoading: movieShowtimesLoading } =
    useQuery({
      queryKey: ["showtimes", selectedMovieForBooking?.id, selectedDate],
      queryFn: () =>
        getAllShowtimes({
          isActive: true,
          movieId: selectedMovieForBooking?.id,
          startTime: selectedDate
            ? new Date(selectedDate).toISOString()
            : undefined,
          endTime: selectedDate
            ? new Date(
                new Date(selectedDate).setHours(23, 59, 59, 999)
              ).toISOString()
            : undefined,
          limit: undefined,
        }),
      enabled: !!selectedMovieForBooking && !!selectedDate && sheetOpen,
    });

  // Fetch movies
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () =>
      getAllMovies({
        limit: undefined,
        isActive: true,
      }),
  });

  // Get unique movie IDs from showtimes
  const movieIdsWithShowtimes = useMemo(() => {
    if (!showtimesData?.data) return new Set<string>();
    return new Set(
      showtimesData.data
        .map((st) => st.movieId)
        .filter((id): id is string => !!id)
    );
  }, [showtimesData]);

  // Group showtimes by movie and filter to only movies with showtimes
  const moviesWithShowtimes = useMemo(() => {
    if (!showtimesData?.data || !moviesData?.data.length) return [];

    const movieMap = new Map<string, MovieWithShowtimes>();

    // Initialize movies that have showtimes
    moviesData.data
      .filter((movie) => movieIdsWithShowtimes.has(movie.id))
      .forEach((movie) => {
        movieMap.set(movie.id, { ...movie, showtimes: [] });
      });

    // Add showtimes to their respective movies
    showtimesData.data.forEach((showtime) => {
      if (showtime.movieId) {
        const movie = movieMap.get(showtime.movieId);
        if (movie) {
          movie.showtimes.push(showtime);
        }
      }
    });

    // Filter out movies with no showtimes, filter by search term, and sort by title
    const filtered = Array.from(movieMap.values())
      .filter((movie) => movie.showtimes.length > 0)
      .filter((movie) => {
        if (!movieSearchTerm.trim()) return true;
        const searchLower = movieSearchTerm.toLowerCase();
        return movie.title.toLowerCase().includes(searchLower);
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return filtered;
  }, [showtimesData, moviesData, movieIdsWithShowtimes, movieSearchTerm]);

  // Food & Drinks with pagination
  const { data: foodDrinksData, isLoading: foodDrinksLoading } = useQuery({
    queryKey: ["foodDrinks"],
    queryFn: () =>
      getAllFoodDrinks({
        limit: undefined,
        isAvailable: true,
      }),
  });

  // Load room layout and booked seats when showtime is selected
  useEffect(() => {
    const loadRoomAndSeats = async () => {
      if (!selectedShowtime) {
        setRoom(null);
        setSeatLayout(null);
        setSeatMap(new Map());
        setSeatPriceMap(new Map());
        setBookedSeatIds([]);
        setSelectedSeats([]);
        setHeldSeatIds([]);
        return;
      }

      setLoading(true);
      try {
        // Load room details with seat layout
        const roomResponse = await getRoomById(selectedShowtime.roomId);
        const roomData = roomResponse.data;
        setRoom(roomData);

        // Create seat map from room.seats array
        const newSeatMap = new Map<string, SeatType>();
        const newSeatPriceMap = new Map<string, number>();

        // Get seat type prices
        const seatTypePrices: Record<string, number> = {};
        if (roomData.seats && Array.isArray(roomData.seats)) {
          roomData.seats.forEach((seat: SeatType) => {
            newSeatMap.set(seat.seatNumber, seat);
            const extraPrice =
              seat.extraPrice || (roomData as any)[seat.seatType] || 0;
            newSeatPriceMap.set(seat.seatNumber, extraPrice);

            if (!seatTypePrices[seat.seatType]) {
              seatTypePrices[seat.seatType] = extraPrice;
            }
          });
        }
        setSeatMap(newSeatMap);
        setSeatPriceMap(newSeatPriceMap);

        // Convert seatLayout array to SeatLayout
        if (roomData.seatLayout && Array.isArray(roomData.seatLayout)) {
          let maxRow = 0;
          let maxCol = 0;

          roomData.seatLayout.forEach((seat: any) => {
            const rowIndex = seat.row.charCodeAt(0) - 65;
            const colIndex = seat.col - 1;

            if (rowIndex > maxRow) maxRow = rowIndex;
            if (colIndex > maxCol) maxCol = colIndex;
          });

          // Create empty layout
          const rows = maxRow + 1;
          const cols = maxCol + 1;
          const seats: SeatPosition[][] = Array.from(
            { length: rows },
            (_, rowIndex) =>
              Array.from({ length: cols }, (_, colIndex) => ({
                row: rowIndex,
                col: colIndex,
                type: SeatTypeEnum.EMPTY,
              }))
          );

          roomData.seatLayout.forEach((seat: any) => {
            const rowIndex = seat.row.charCodeAt(0) - 65;
            const colIndex = seat.col - 1;

            if (rowIndex < rows && colIndex < cols) {
              const seatNumber = `${seat.row}${seat.col}`;
              const seatData = newSeatMap.get(seatNumber);
              const extraPrice =
                seatData?.extraPrice ||
                (roomData as any)[seat.type] ||
                seatTypePrices[seat.type] ||
                0;

              seats[rowIndex][colIndex] = {
                row: rowIndex,
                col: colIndex,
                type: seat.type as SeatTypeEnum,
                seatNumber: seatNumber,
                extraPrice: extraPrice,
              };
            }
          });

          for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let colIndex = 0; colIndex < cols - 1; colIndex++) {
              const currentSeat = seats[rowIndex][colIndex];
              const nextSeat = seats[rowIndex][colIndex + 1];

              if (
                currentSeat.type === SeatTypeEnum.COUPLE &&
                nextSeat.type === SeatTypeEnum.COUPLE &&
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

        // Load booked seats
        const bookedSeatsResponse = await getBookedSeats(selectedShowtime.id);
        const bookedIds: string[] = Array.isArray(bookedSeatsResponse.data)
          ? bookedSeatsResponse.data
              .map((booking) => booking.seatId)
              .filter((id): id is string => Boolean(id))
          : [];
        setBookedSeatIds(bookedIds);

        // Load held seats
        const heldSeatsResponse = await getHeldSeats(selectedShowtime.id);
        setHeldSeatIds(heldSeatsResponse.data.map((h) => h.seatId));
      } catch (error: any) {
        if (error.response?.status === 404) {
          setBookedSeatIds([]);
          return;
        } else {
          toast.error(error.message || "Failed to load room details");
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoomAndSeats();
  }, [selectedShowtime]);

  // Reset when sheet closes
  useEffect(() => {
    if (!sheetOpen) {
      if (selectedShowtime && selectedSeats.length > 0) {
        (async () => {
          try {
            await Promise.all(
              selectedSeats.map((seat) =>
                releaseSeat({
                  showtimeId: selectedShowtime.id,
                  seatId: seat.id,
                }).catch(() => {})
              )
            );
          } catch {}
        })();
      }

      setSelectedMovieForBooking(null);
      setSelectedShowtime(null);
      setSelectedSeats([]);
      setSelectedFoodDrinks([]);
      setHeldSeatIds([]);
    }
  }, [sheetOpen]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Socket connected for POS");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected from POS");
    });

    // Listen for seat update events
    socket.on(
      "seat-update",
      async (data: {
        showtimeId: string;
        seatId: string;
        status: "held" | "booked" | "released";
        expiresAt: number | null;
      }) => {
        if (selectedShowtime?.id === data.showtimeId) {
          try {
            // Re-fetch held seats to get the latest state
            const heldSeatsResponse = await getHeldSeats(data.showtimeId);
            const newHeldSeatIds = heldSeatsResponse.data.map((h) => h.seatId);
            setHeldSeatIds(newHeldSeatIds);

            // If a seat was booked, update booked seats and remove from selected/held
            if (data.status === "booked") {
              // Remove from selected seats if it was selected
              setSelectedSeats((prev) =>
                prev.filter((seat) => seat.id !== data.seatId)
              );
              // Update booked seats list
              const bookedSeatsResponse = await getBookedSeats(data.showtimeId);
              const bookedIds: string[] = Array.isArray(
                bookedSeatsResponse.data
              )
                ? bookedSeatsResponse.data
                    .map((booking) => booking.seatId)
                    .filter((id): id is string => Boolean(id))
                : [];
              setBookedSeatIds(bookedIds);
            }

            // If a seat was released, check if it's still in our selected seats
            if (data.status === "released") {
              // Check if the seat is no longer held
              if (!newHeldSeatIds.includes(data.seatId)) {
                // Remove from selected seats only if it's no longer held
                setSelectedSeats((prev) => {
                  const seat = prev.find((s) => s.id === data.seatId);
                  // Only remove if the seat exists and is no longer held
                  if (seat && !newHeldSeatIds.includes(data.seatId)) {
                    return prev.filter((s) => s.id !== data.seatId);
                  }
                  return prev;
                });
              }
            }
          } catch (error) {
            console.error(
              "Failed to refresh seat data after socket update:",
              error
            );
          }
        }
      }
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("seat-update");
    };
  }, [selectedShowtime]);

  // Join/leave showtime room when showtime changes
  useEffect(() => {
    const socket = getSocket();

    if (selectedShowtime) {
      socket.emit("join-showtime", selectedShowtime.id);
      console.log("Joined showtime room:", selectedShowtime.id);
    }

    return () => {
      if (selectedShowtime) {
        socket.emit("leave-showtime", selectedShowtime.id);
        console.log("Left showtime room:", selectedShowtime.id);
      }
    };
  }, [selectedShowtime]);

  const handleBookTicketClick = (movie: Movie) => {
    setSelectedMovieForBooking(movie);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedFoodDrinks([]);
    setSheetOpen(true);
  };

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
  };

  // Handle seat selection from layout
  const handleSeatClick = async (seatPosition: SeatPosition) => {
    if (!selectedShowtime || !seatPosition.seatNumber) {
      return;
    }

    // Handle couple seats
    let seatsToProcess: SeatType[] = [];

    if (seatPosition.isCoupleSeat && seatPosition.seatNumber.includes("-")) {
      // Extract individual seat numbers from couple seat number
      const [start, end] = seatPosition.seatNumber.split("-");
      const rowLetter = start[0];
      const startNum = parseInt(start.slice(1));
      const endNum = parseInt(end);

      // Find both seats in the couple
      for (let num = startNum; num <= endNum; num++) {
        const individualSeatNumber = `${rowLetter}${num}`;
        const seat = seatMap.get(individualSeatNumber);
        if (seat) {
          seatsToProcess.push(seat);
        }
      }
    } else {
      // Regular seat
      const seat = seatMap.get(seatPosition.seatNumber);
      if (seat) {
        seatsToProcess.push(seat);
      }
    }

    if (seatsToProcess.length === 0) {
      return;
    }

    // Check if any seat is already booked
    const bookedSeats = seatsToProcess.filter((seat) =>
      bookedSeatIds.includes(seat.id)
    );
    if (bookedSeats.length > 0) {
      toast.error("One or more seats are already booked");
      return;
    }

    // Check if all seats are already selected
    const allSelected = seatsToProcess.every((seat) =>
      selectedSeats.some((s) => s.id === seat.id)
    );

    if (allSelected) {
      // Deselect and release all seats
      const seatIdsToRemove = seatsToProcess.map((s) => s.id);
      setSelectedSeats(
        selectedSeats.filter((s) => !seatIdsToRemove.includes(s.id))
      );
      setHeldSeatIds(heldSeatIds.filter((id) => !seatIdsToRemove.includes(id)));

      // Release all seats
      await Promise.all(
        seatsToProcess.map((seat) =>
          releaseSeat({
            showtimeId: selectedShowtime.id,
            seatId: seat.id,
          }).catch(() => {})
        )
      );
    } else {
      // Select and hold all seats
      try {
        await Promise.all(
          seatsToProcess.map((seat) =>
            holdSeat({
              showtimeId: selectedShowtime.id,
              seatId: seat.id,
            })
          )
        );
        setSelectedSeats([...selectedSeats, ...seatsToProcess]);
        setHeldSeatIds([...heldSeatIds, ...seatsToProcess.map((s) => s.id)]);
      } catch (error: any) {
        if (error.response?.status === 409) {
          toast.error("Seat is already held by another user");
          return;
        }
        toast.error("Failed to hold seat(s)");
      }
    }
  };

  // Handle food/drink selection
  const handleFoodDrinkQuantityChange = (
    foodDrink: FoodDrink,
    quantity: number
  ) => {
    if (quantity <= 0) {
      setSelectedFoodDrinks(
        selectedFoodDrinks.filter((fd) => fd.foodDrink.id !== foodDrink.id)
      );
    } else {
      const existing = selectedFoodDrinks.find(
        (fd) => fd.foodDrink.id === foodDrink.id
      );
      if (existing) {
        setSelectedFoodDrinks(
          selectedFoodDrinks.map((fd) =>
            fd.foodDrink.id === foodDrink.id ? { ...fd, quantity } : fd
          )
        );
      } else {
        setSelectedFoodDrinks([...selectedFoodDrinks, { foodDrink, quantity }]);
      }
    }
  };

  // Get sets of seat numbers
  const bookedSeatNumbers = useMemo(() => {
    const numbers = new Set<string>();
    if (bookedSeatIds.length === 0 || seatMap.size === 0) {
      return numbers;
    }
    bookedSeatIds.forEach((seatId) => {
      const seat = Array.from(seatMap.values()).find((s) => s.id === seatId);
      if (seat && seat.seatNumber) {
        numbers.add(seat.seatNumber);
      }
    });
    return numbers;
  }, [bookedSeatIds, seatMap]);

  const selectedSeatNumbers = useMemo(() => {
    return new Set(selectedSeats.map((s) => s.seatNumber));
  }, [selectedSeats]);

  const heldSeatNumbers = useMemo(() => {
    const numbers = new Set<string>();
    heldSeatIds.forEach((seatId) => {
      const seat = Array.from(seatMap.values()).find((s) => s.id === seatId);
      const isSelectedByCurrent =
        seat && selectedSeats.some((s) => s.id === seat.id);
      if (seat && !isSelectedByCurrent) {
        numbers.add(seat.seatNumber);
      }
    });
    return numbers;
  }, [heldSeatIds, seatMap, selectedSeats]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = 0;

    // Seat prices
    if (selectedShowtime && selectedSeats.length > 0) {
      selectedSeats.forEach((seat) => {
        const extraPrice =
          seatPriceMap.get(seat.seatNumber) || seat.extraPrice || 0;
        price += selectedShowtime.price + extraPrice;
      });
    }

    // Food/Drink prices
    selectedFoodDrinks.forEach((fd) => {
      price += fd.foodDrink.price * fd.quantity;
    });

    return price;
  }, [selectedShowtime, selectedSeats, selectedFoodDrinks, seatPriceMap]);

  // Create booking
  const handleCreateBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error("Please select a showtime and at least one seat");
      return;
    }

    setCreatingBooking(true);
    try {
      const bookingResponse = await createBooking({
        type: "offline",
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map((s) => s.id),
        foodDrinks: selectedFoodDrinks.map((fd) => ({
          foodDrinkId: fd.foodDrink.id,
          quantity: fd.quantity,
        })),
      });

      const booking = bookingResponse.data;

      if (paymentMethod === "MOMO") {
        try {
          const momoResponse = await paymentService.checkoutWithMoMo(
            totalPrice,
            booking.id
          );

          if (momoResponse.URL) {
            if (typeof window !== "undefined") {
              if (momoResponse.paymentId) {
                window.localStorage.setItem(
                  "paymentId",
                  momoResponse.paymentId
                );
              }
              window.localStorage.setItem("bookingId", booking.id);

              window.open(momoResponse.URL, "_self");
            }
          }
        } catch (error: any) {
          toast.error(
            error.message ||
              "Không thể khởi tạo thanh toán MoMo cho đơn đặt vé này"
          );
        }
      } else {
        setSuccessBooking(booking as Booking);
        setSuccessMessage("Đặt vé thành công. Thanh toán tại quầy (COD).");
        setSuccessDialogOpen(true);
      }

      // Reset form
      setSelectedShowtime(null);
      setSelectedSeats([]);
      setSelectedFoodDrinks([]);
      setHeldSeatIds([]);
      setSheetOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setCreatingBooking(false);
    }
  };

  // Convert selectedDate string to Date for Calendar
  const selectedDateAsDate = selectedDate ? new Date(selectedDate) : new Date();

  return (
    <div className="container space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        {/* Movie Search */}
        <div className="flex-1 sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phim..."
              value={movieSearchTerm}
              onChange={(e) => setMovieSearchTerm(e.target.value)}
              className="pl-10 w-3/4"
            />
          </div>
        </div>

        {/* Date Picker */}
        <div className="">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDateAsDate, "dd/MM/yyyy")
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDateAsDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(format(date, "yyyy-MM-dd"));
                  }
                }}
                // disabled={(date) =>
                //   date < new Date(new Date().setHours(0, 0, 0, 0))
                // }
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Movies with Showtimes */}
      {showtimesLoading || moviesLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : moviesWithShowtimes.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Không có phim nào có suất chiếu cho ngày đã chọn
        </div>
      ) : (
        <div className="flex flex-row gap-6">
          {moviesWithShowtimes.map((movie) => (
            <div
              key={movie.id}
              className="overflow-hidden min-w-62 hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-xl cursor-pointer"
            >
              <div className="relative group">
                {/* Poster */}
                <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-700 rounded-t-xl">
                  {movie.thumbnail ? (
                    <Image
                      src={movie.thumbnail}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 rounded-t-xl group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <Film className="h-12 w-12" />
                    </div>
                  )}

                  {/* Hover overlay with detailed information */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/90 to-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <h3 className="text-white font-bold text-xl mb-2">
                          {movie.title}
                        </h3>
                        {movie.status && (
                          <Badge variant="secondary" className="mb-2">
                            {movie.status}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-sm line-clamp-3">
                        {movie.description}
                      </p>

                      {/* Movie Details */}
                      <div className="space-y-2 text-white/90 text-sm">
                        {/* Genres */}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.map((genre) => (
                              <Badge
                                key={genre.id}
                                variant="outline"
                                className="text-xs border-white/30 text-white/90 bg-white/10"
                              >
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{movie.duration} phút</span>
                        </div>

                        {/* Language/Format */}
                        {movie.showtimes.length > 0 && (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {movie.showtimes[0]?.language || "Phụ đề"}
                            </span>
                          </div>
                        )}

                        {/* Rating */}
                        {movie.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span>{movie.rating.toFixed(1)}/10</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom section*/}
                <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 p-5">
                  <h3 className="text-white font-bold text-lg mb-4 text-center line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {movie.trailerUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrailerUrl(movie.trailerUrl);
                          setTrailerOpen(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span className="underline">Xem Trailer</span>
                      </Button>
                    )}
                  </div>
                  <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base py-3 shadow-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleBookTicketClick(movie)}
                  >
                    ĐẶT VÉ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full min-w-4xl sm:max-w-2xl p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-8 pt-8 pb-4 flex-shrink-0">
            <SheetTitle className="text-2xl font-bold">
              {selectedMovieForBooking
                ? `Đặt vé - ${selectedMovieForBooking.title}`
                : "Tạo đơn đặt vé"}
            </SheetTitle>
            <SheetDescription>
              {selectedShowtime
                ? "Chọn ghế và thêm đồ ăn/uống cho suất chiếu"
                : "Vui lòng chọn suất chiếu"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-4">
            <div className="space-y-6 mt-6">
              {/* Showtime Selection */}
              {selectedMovieForBooking && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Chọn suất chiếu -{" "}
                    {format(new Date(selectedDate), "dd/MM/yyyy")}
                  </Label>
                  {movieShowtimesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : !movieShowtimesData?.data ||
                    movieShowtimesData.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Không có suất chiếu nào cho ngày đã chọn
                    </div>
                  ) : (
                    <div className="flex flex-row flex-wrap gap-3">
                      {movieShowtimesData.data
                        .sort(
                          (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                        )
                        .map((showtime: Showtime) => {
                          const isSelected =
                            selectedShowtime?.id === showtime.id;
                          return (
                            <Button
                              key={showtime.id}
                              variant="outline"
                              className={`h-auto cursor-pointer py-3 flex flex-col items-start transition-all ${
                                isSelected
                                  ? "border-primary border-2 ring-2 ring-primary ring-offset-2 bg-primary/10 dark:bg-primary/20"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              }`}
                              onClick={() => handleShowtimeSelect(showtime)}
                            >
                              <div
                                className={`font-semibold text-base ${
                                  isSelected ? "text-primary" : ""
                                }`}
                              >
                                {format(new Date(showtime.startTime), "HH:mm")}{" "}
                                - {format(new Date(showtime.endTime), "HH:mm")}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  isSelected
                                    ? "text-primary/80 dark:text-primary/90"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {showtime.language} • {showtime.format}
                              </div>
                              <div
                                className={`text-sm font-bold mt-1 ${
                                  isSelected ? "text-primary" : ""
                                }`}
                              >
                                {formatPrice(showtime.price)}
                              </div>
                            </Button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* User and Food/Drink Selection Row */}
              {selectedShowtime && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Food/Drink Selection */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Đồ ăn/uống</Label>
                    <Select
                      onValueChange={(value) => {
                        const foodDrink = foodDrinksData?.data.find(
                          (fd) => fd.id === value
                        );
                        if (foodDrink) {
                          handleFoodDrinkQuantityChange(
                            foodDrink,
                            (selectedFoodDrinks.find(
                              (fd) => fd.foodDrink.id === foodDrink.id
                            )?.quantity || 0) + 1
                          );
                        }
                      }}
                      onOpenChange={setFoodDrinkSelectOpen}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Thêm đồ ăn/uống" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {foodDrinksData?.data.map((foodDrink) => (
                          <SelectItem key={foodDrink.id} value={foodDrink.id}>
                            {foodDrink.name}
                          </SelectItem>
                        ))}
                        {foodDrinksLoading && (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Đang tải...
                            </span>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Selected Food/Drinks */}
              {selectedShowtime && selectedFoodDrinks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">
                    Đồ ăn/uống đã chọn
                  </Label>
                  <div className="space-y-2">
                    {selectedFoodDrinks.map((fd) => (
                      <div
                        key={fd.foodDrink.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {fd.foodDrink.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(fd.foodDrink.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleFoodDrinkQuantityChange(
                                fd.foodDrink,
                                fd.quantity - 1
                              )
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{fd.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleFoodDrinkQuantityChange(
                                fd.foodDrink,
                                fd.quantity + 1
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seat Selection */}
              {selectedShowtime && room && seatLayout && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Chọn ghế - {room.name}
                  </Label>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4 justify-center flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-white border-2 border-gray-800 rounded"></div>
                          <span className="text-sm">Còn trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                          <span className="text-sm">Đã chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                          <span className="text-sm">Đã giữ bởi người khác</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                          <span className="text-sm">Đã đặt</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4 overflow-x-auto flex justify-center">
                        <BookingSeatGrid
                          layout={seatLayout}
                          bookedSeatNumbers={bookedSeatNumbers}
                          heldSeatNumbers={heldSeatNumbers}
                          selectedSeatNumbers={selectedSeatNumbers}
                          onSeatClick={handleSeatClick}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary - Fixed at bottom */}
          {selectedShowtime && (
            <div className="flex-shrink-0 border-t bg-background px-8 py-4 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div>
                <Label className="text-lg font-semibold">Suất chiếu</Label>
                <div>
                  {format(
                    new Date(selectedShowtime.startTime),
                    "HH:mm dd/MM/yyyy"
                  )}
                </div>
              </div>

              {/* Seats and Food/Drinks */}
              {(selectedSeats.length > 0 || selectedFoodDrinks.length > 0) && (
                <>
                  <Separator />
                  <div className="flex flex-row gap-4">
                    {/* Seats Column */}
                    {selectedSeats.length > 0 && (
                      <div className="flex-1">
                        <Label className="text-sm text-muted-foreground">
                          Ghế
                        </Label>
                        <div className="mt-2 space-y-2">
                          {(() => {
                            const getSeatTypeName = (type: string) => {
                              const typeMap: Record<string, string> = {
                                NORMAL: "Thường",
                                VIP: "VIP",
                                COUPLE: "Đôi",
                              };
                              return typeMap[type] || type;
                            };

                            // Group seats by type and handle couple seats
                            const seatsByType: Record<
                              string,
                              { seats: SeatType[]; coupleSeats: Set<string> }
                            > = {};
                            const processedSeatNumbers = new Set<string>();

                            // Find all couple seats from seatLayout
                            if (seatLayout) {
                              seatLayout.seats.forEach((row) => {
                                row.forEach((seatPos) => {
                                  if (
                                    seatPos.isCoupleSeat &&
                                    seatPos.seatNumber &&
                                    selectedSeatNumbers.has(seatPos.seatNumber)
                                  ) {
                                    // Check if all individual seats in the couple are selected
                                    const [start, end] =
                                      seatPos.seatNumber.split("-");
                                    const rowLetter = start[0];
                                    const startNum = parseInt(start.slice(1));
                                    const endNum = parseInt(end);

                                    let allSeatsSelected = true;
                                    for (
                                      let num = startNum;
                                      num <= endNum;
                                      num++
                                    ) {
                                      const individualSeatNumber = `${rowLetter}${num}`;
                                      if (
                                        !selectedSeatNumbers.has(
                                          individualSeatNumber
                                        )
                                      ) {
                                        allSeatsSelected = false;
                                        break;
                                      }
                                    }

                                    if (allSeatsSelected) {
                                      // Find the seat type from one of the individual seats
                                      const coupleSeat = selectedSeats.find(
                                        (s) => {
                                          const seatNum = parseInt(
                                            s.seatNumber.slice(1)
                                          );
                                          return (
                                            s.seatNumber.startsWith(
                                              rowLetter
                                            ) &&
                                            seatNum >= startNum &&
                                            seatNum <= endNum
                                          );
                                        }
                                      );

                                      if (coupleSeat) {
                                        const type =
                                          coupleSeat.seatType || "COUPLE";
                                        if (!seatsByType[type]) {
                                          seatsByType[type] = {
                                            seats: [],
                                            coupleSeats: new Set(),
                                          };
                                        }
                                        seatsByType[type].coupleSeats.add(
                                          seatPos.seatNumber
                                        );

                                        // Mark individual seats as processed
                                        for (
                                          let num = startNum;
                                          num <= endNum;
                                          num++
                                        ) {
                                          processedSeatNumbers.add(
                                            `${rowLetter}${num}`
                                          );
                                        }
                                      }
                                    }
                                  }
                                });
                              });
                            }

                            // Add regular seats (not part of couple seats)
                            selectedSeats.forEach((seat) => {
                              if (!processedSeatNumbers.has(seat.seatNumber)) {
                                const type = seat.seatType || "NORMAL";
                                if (!seatsByType[type]) {
                                  seatsByType[type] = {
                                    seats: [],
                                    coupleSeats: new Set(),
                                  };
                                }
                                seatsByType[type].seats.push(seat);
                              }
                            });

                            const basePrice = selectedShowtime?.price || 0;

                            return Object.entries(seatsByType).map(
                              ([type, { seats, coupleSeats }]) => {
                                const seatNumbers: string[] = [];

                                // Add couple seat numbers (e.g., "J5-6")
                                coupleSeats.forEach((coupleNum) => {
                                  seatNumbers.push(coupleNum);
                                });

                                // Add regular seat numbers
                                seats.forEach((seat) => {
                                  seatNumbers.push(seat.seatNumber);
                                });

                                // Calculate total price for this seat type
                                let totalSeatPrice = 0;

                                // Calculate price for regular seats
                                seats.forEach((seat) => {
                                  const extraPrice =
                                    seatPriceMap.get(seat.seatNumber) ||
                                    seat.extraPrice ||
                                    0;
                                  totalSeatPrice += basePrice + extraPrice;
                                });

                                // Calculate price for couple seats (each couple = 2 seats)
                                coupleSeats.forEach((coupleNum) => {
                                  const [start] = coupleNum.split("-");
                                  const rowLetter = start[0];
                                  const startNum = parseInt(start.slice(1));
                                  // Get the first seat of the couple for pricing
                                  const firstSeatNumber = `${rowLetter}${startNum}`;
                                  const firstSeat = selectedSeats.find(
                                    (s) => s.seatNumber === firstSeatNumber
                                  );
                                  const extraPrice = firstSeat
                                    ? seatPriceMap.get(firstSeatNumber) ||
                                      firstSeat.extraPrice ||
                                      0
                                    : 0;
                                  // Couple seat = 2 seats
                                  totalSeatPrice +=
                                    (basePrice + extraPrice) * 2;
                                });

                                return (
                                  <div
                                    key={type}
                                    className="flex justify-between text-sm"
                                  >
                                    <span>
                                      {getSeatTypeName(type)}:{" "}
                                      {seatNumbers.join(", ")}
                                    </span>
                                    <span>{formatPrice(totalSeatPrice)}</span>
                                  </div>
                                );
                              }
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Vertical Separator */}
                    {selectedSeats.length > 0 &&
                      selectedFoodDrinks.length > 0 && (
                        <div className="w-px bg-border"></div>
                      )}

                    {/* Food/Drinks Column */}
                    {selectedFoodDrinks.length > 0 && (
                      <div className="flex-1">
                        <Label className="text-lg font-semibold">
                          Đồ ăn/uống
                        </Label>
                        <div className="space-y-2 mt-2">
                          {selectedFoodDrinks.map((fd) => (
                            <div
                              key={fd.foodDrink.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {fd.foodDrink.name} × {fd.quantity}
                              </span>
                              <span>
                                {formatPrice(fd.foodDrink.price * fd.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <Label className="text-xl font-semibold">Tổng</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Phương thức thanh toán:
                    </span>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as "COD" | "MOMO")
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COD">
                          Thanh toán khi nhận (COD)
                        </SelectItem>
                        <SelectItem value="MOMO">
                          Thanh toán với MoMo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {formatPrice(totalPrice)}
                </div>
              </div>

              <Button
                className="w-full cursor-pointer"
                size="lg"
                onClick={handleCreateBooking}
                disabled={
                  !selectedShowtime ||
                  selectedSeats.length === 0 ||
                  creatingBooking ||
                  checkingPayment
                }
              >
                {creatingBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : checkingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kiểm tra thanh toán...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Thanh toán
                  </>
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Trailer Dialog */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="min-w-6xl w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center justify-between"></DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            {trailerUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={convertToEmbedUrl(trailerUrl)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông báo đặt vé</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-base font-medium">{successMessage}</p>
            {successBooking && (
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-semibold">Mã đơn hàng:</span>{" "}
                  {successBooking.id}
                </div>
                <div>
                  <span className="font-semibold">Tổng tiền:</span>{" "}
                  {formatPrice(successBooking.totalPrice)}
                </div>
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setSuccessDialogOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
