"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ShoppingCart,
  User,
  Calendar,
  Film,
  Armchair,
} from "lucide-react";
import { getAllUsers, GetUsersParams } from "@/services/users/users";
import { getAllShowtimes, getShowtimeById } from "@/services/showtimes";
import { getRoomById } from "@/services/cinemas";
import { getAllFoodDrinks } from "@/services/fooddrinks";
import { getAllMovies } from "@/services/movies";
import {
  createBooking,
  getBookedSeats,
  holdSeat,
  releaseSeat,
  getHeldSeats,
} from "@/services/booking";
import { useUser } from "@/contexts/UserContext";
import { User as UserType } from "@/types/user";
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

interface SelectedFoodDrink {
  foodDrink: FoodDrink;
  quantity: number;
}

export default function POSPage() {
  const { user: adminUser } = useUser();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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

  // User search
  const [userSearch, setUserSearch] = useState("");
  const [userParams, setUserParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    role: "USER",
    isActive: true,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", userParams],
    queryFn: () => getAllUsers(userParams),
  });

  // Movies
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["movies", "active"],
    queryFn: () => getAllMovies({ isActive: true, limit: 100 }),
  });

  // Showtimes
  const [showtimeDate, setShowtimeDate] = useState<string>("");
  const { data: showtimesData, isLoading: showtimesLoading } = useQuery({
    queryKey: ["showtimes", selectedMovie?.id, showtimeDate],
    queryFn: () =>
      getAllShowtimes({
        isActive: true,
        movieId: selectedMovie?.id,
        startTime: showtimeDate
          ? new Date(showtimeDate).toISOString()
          : undefined,
        endTime: showtimeDate
          ? new Date(
              new Date(showtimeDate).setHours(23, 59, 59, 999)
            ).toISOString()
          : undefined,
        limit: 100,
      }),
    enabled: !!selectedMovie && !!showtimeDate,
  });

  // Food & Drinks
  const { data: foodDrinksData, isLoading: foodDrinksLoading } = useQuery({
    queryKey: ["foodDrinks", "available"],
    queryFn: () => getAllFoodDrinks({ isAvailable: true, limit: 100 }),
  });

  // Load room layout and booked seats
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
        setBookedSeatIds(bookedSeatsResponse.data);

        // Load held seats
        const heldSeatsResponse = await getHeldSeats(selectedShowtime.id);
        setHeldSeatIds(heldSeatsResponse.data.map((h) => h.seatId));
      } catch (error: any) {
        toast.error(error.message || "Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    loadRoomAndSeats();
  }, [selectedShowtime]);

  // Reset showtime when movie changes
  useEffect(() => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setHeldSeatIds([]);
    setRoom(null);
  }, [selectedMovie]);

  // Set today's date as default
  useEffect(() => {
    if (!showtimeDate) {
      setShowtimeDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, []);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    if (!userSearch) return usersData.data;
    return usersData.data.filter(
      (user) =>
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.fullname.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [usersData, userSearch]);

  // Handle seat selection from layout
  const handleSeatClick = async (seatPosition: SeatPosition) => {
    if (!selectedShowtime || !seatPosition.seatNumber) {
      return;
    }

    // Use admin user if no user is selected
    const bookingUserId = selectedUser?.id || adminUser?.id;
    if (!bookingUserId) {
      toast.error("Please select a user or ensure you are logged in");
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
        toast.error(error.response?.data?.message || "Failed to hold seat(s)");
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
    bookedSeatIds.forEach((seatId) => {
      const seat = Array.from(seatMap.values()).find((s) => s.id === seatId);
      if (seat) numbers.add(seat.seatNumber);
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
    const bookingUserId = selectedUser?.id || adminUser?.id;
    if (!bookingUserId) {
      toast.error("Please select a user or ensure you are logged in");
      return;
    }

    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error("Please select a showtime and at least one seat");
      return;
    }

    setCreatingBooking(true);
    try {
      await createBooking({
        type: "offline",
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map((s) => s.id),
        foodDrinks: selectedFoodDrinks.map((fd) => ({
          foodDrinkId: fd.foodDrink.id,
          quantity: fd.quantity,
        })),
      });

      toast.success("Booking created successfully!");

      // Reset form
      setSelectedUser(null);
      setSelectedMovie(null);
      setSelectedShowtime(null);
      setSelectedSeats([]);
      setSelectedFoodDrinks([]);
      setHeldSeatIds([]);
      setUserSearch("");
      setShowtimeDate(format(new Date(), "yyyy-MM-dd"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setCreatingBooking(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search User</Label>
                  <Input
                    placeholder="Search by email or name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                {usersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="h-32 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="font-medium">{user.fullname}</div>
                        <div className="text-sm opacity-80">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">
                      Selected: {selectedUser.fullname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Movie Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Select Movie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {moviesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="h-48 overflow-y-auto space-y-2">
                    {moviesData?.data.map((movie) => (
                      <div
                        key={movie.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMovie?.id === movie.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedMovie(movie)}
                      >
                        <div className="font-medium">{movie.title}</div>
                        <div className="text-sm opacity-80">
                          {movie.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Showtime Selection */}
          {selectedMovie && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Showtime
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={showtimeDate}
                    onChange={(e) => setShowtimeDate(e.target.value)}
                  />
                </div>
                {showtimesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : showtimesData?.data.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No showtimes available for this movie on the selected date
                  </div>
                ) : (
                  <div className="h-48 overflow-y-auto space-y-2">
                    {showtimesData?.data.map((showtime) => (
                      <div
                        key={showtime.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedShowtime?.id === showtime.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedShowtime(showtime)}
                      >
                        <div className="font-medium">
                          {format(new Date(showtime.startTime), "HH:mm")} -{" "}
                          {format(new Date(showtime.endTime), "HH:mm")}
                        </div>
                        <div className="text-sm opacity-80">
                          {showtime.language} • {showtime.format}
                        </div>
                        <div className="text-sm opacity-80">
                          Price: ${showtime.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seat Selection */}
          {selectedShowtime && room && seatLayout && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Armchair className="h-5 w-5" />
                  Select Seats - {room.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 justify-center flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-800 rounded"></div>
                        <span className="text-sm">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                        <span className="text-sm">Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                        <span className="text-sm">Held by others</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                        <span className="text-sm">Booked</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 overflow-x-auto flex justify-center">
                      {seatLayout && (
                        <BookingSeatGrid
                          layout={seatLayout}
                          bookedSeatNumbers={bookedSeatNumbers}
                          heldSeatNumbers={heldSeatNumbers}
                          selectedSeatNumbers={selectedSeatNumbers}
                          onSeatClick={handleSeatClick}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Food & Drinks Selection */}
          {selectedShowtime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Food & Drinks (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {foodDrinksLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="h-64 overflow-y-auto space-y-4">
                    {foodDrinksData?.data.map((foodDrink) => {
                      const selected = selectedFoodDrinks.find(
                        (fd) => fd.foodDrink.id === foodDrink.id
                      );
                      return (
                        <div
                          key={foodDrink.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{foodDrink.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${foodDrink.price}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleFoodDrinkQuantityChange(
                                  foodDrink,
                                  (selected?.quantity || 0) - 1
                                )
                              }
                              disabled={!selected || selected.quantity === 0}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {selected?.quantity || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleFoodDrinkQuantityChange(
                                  foodDrink,
                                  (selected?.quantity || 0) + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">User</Label>
                <div className="font-medium">
                  {selectedUser
                    ? selectedUser.fullname
                    : adminUser?.fullname || "Admin"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedUser ? selectedUser.email : adminUser?.email || ""}
                </div>
                {!selectedUser && (
                  <div className="text-xs text-muted-foreground mt-1">
                    (Booking for admin)
                  </div>
                )}
              </div>

              {selectedShowtime && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Showtime
                    </Label>
                    <div className="font-medium">
                      {format(
                        new Date(selectedShowtime.startTime),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedSeats.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Seats
                    </Label>
                    {/* Seat type breakdown with seat numbers */}
                    <div className="mt-3 space-y-2">
                      {(() => {
                        // Group seats by type and handle couple seats
                        const seatsByType: Record<
                          string,
                          { seats: SeatType[]; coupleSeats: Set<string> }
                        > = {};
                        const processedSeatNumbers = new Set<string>();

                        // First, find all couple seats from seatLayout
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
                                for (let num = startNum; num <= endNum; num++) {
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
                                  const coupleSeat = selectedSeats.find((s) => {
                                    const seatNum = parseInt(
                                      s.seatNumber.slice(1)
                                    );
                                    return (
                                      s.seatNumber.startsWith(rowLetter) &&
                                      seatNum >= startNum &&
                                      seatNum <= endNum
                                    );
                                  });

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

                            return (
                              <div
                                key={type}
                                className="text-sm text-muted-foreground"
                              >
                                <span className="font-medium">{type}:</span>{" "}
                                <span>{seatNumbers.join(", ")}</span>
                              </div>
                            );
                          }
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              {selectedFoodDrinks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Food & Drinks
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
                            ${(fd.foodDrink.price * fd.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Total</Label>
                <div className="text-2xl font-bold">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCreateBooking}
                disabled={
                  (!selectedUser && !adminUser) ||
                  !selectedShowtime ||
                  selectedSeats.length === 0 ||
                  creatingBooking
                }
              >
                {creatingBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
