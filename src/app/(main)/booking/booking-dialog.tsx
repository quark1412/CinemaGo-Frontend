"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import UI Components (Shadcn)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, MapPin, MonitorPlay, Calendar } from "lucide-react";

// Import Services & Types
import { getFoodDrinkById } from "@/services/fooddrinks"; // Đảm bảo bạn đã có service này
import { Booking } from "@/types/booking";

// Import các Map Type từ hook
import {
  UserMap,
  MovieMap,
  ShowTimeMap,
  RoomMap,
  CinemaMap,
} from "@/hooks/use-booking-table";

// --- TYPES CHO LOGIC XỬ LÝ GHẾ ---
interface SeatDef {
  id: string;
  seatNumber: string;
  seatType: string;
  extraPrice?: number;
}

interface DisplaySeat {
  displayName: string; // "A1" hoặc "J10-J11"
  type: string; // "NORMAL", "VIP", "COUPLE"
  price: number;
  isMerged?: boolean;
  row?: string; // Dùng để sort
  number?: number; // Dùng để sort
}

interface BookingDetails {
  userObj: {
    name: string;
    email: string;
    phone?: string;
    gender?: string;
  } | null;
  cinemaName: string;
  roomName: string;
  movieTitle: string;
  showTimeRaw: string;
  displaySeats: DisplaySeat[];
  foodItems: { name: string; quantity: number; price: number }[];
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  // Maps nhận từ hook useBookingTable
  maps: {
    userMap: UserMap;
    showtimeMap: ShowTimeMap;
    movieMap: MovieMap;
    roomMap: RoomMap;
    cinemaMap: CinemaMap;
  };
}

export function BookingDialog({
  open,
  onOpenChange,
  booking,
  maps,
}: BookingDialogProps) {
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loadingFood, setLoadingFood] = useState(false);

  // Helper format tiền
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  // --- LOGIC GỘP GHẾ (GIỮ NGUYÊN TỪ DỰ ÁN CŨ) ---
  const processSeats = (
    bookingSeats: { seatId: string }[],
    allRoomSeats: SeatDef[], // Danh sách ghế gốc của phòng
    basePrice: number
  ): DisplaySeat[] => {
    // 1. Map từ bookingSeat -> thông tin chi tiết
    const rawSeats = bookingSeats
      .map((bs) => {
        // Tìm thông tin ghế trong danh sách ghế của phòng (từ map)
        const seatDef = allRoomSeats.find((s) => s.id === bs.seatId);
        if (!seatDef) return null;

        return {
          name: seatDef.seatNumber,
          type: seatDef.seatType,
          price: basePrice + (seatDef.extraPrice || 0),
          row: seatDef.seatNumber.charAt(0),
          number: parseInt(seatDef.seatNumber.slice(1)) || 0,
        };
      })
      .filter((s): s is NonNullable<typeof s> => !!s);

    // 2. Tách ghế Couple và ghế thường
    const coupleSeats = rawSeats.filter((s) => s.type === "COUPLE");
    const otherSeats = rawSeats.filter((s) => s.type !== "COUPLE");

    // 3. Xử lý gộp ghế Couple liền kề
    coupleSeats.sort((a, b) => {
      if (a.row === b.row) return a.number - b.number;
      return a.row.localeCompare(b.row);
    });

    const mergedCouples: DisplaySeat[] = [];
    const visitedIndices = new Set<number>();

    for (let i = 0; i < coupleSeats.length; i++) {
      if (visitedIndices.has(i)) continue;

      const current = coupleSeats[i];
      const nextIndex = i + 1;

      // Logic kiểm tra ghế liền kề
      if (nextIndex < coupleSeats.length) {
        const next = coupleSeats[nextIndex];
        if (next.row === current.row && next.number === current.number + 1) {
          mergedCouples.push({
            displayName: `${current.name}-${next.name}`,
            type: "COUPLE",
            price: current.price + next.price,
            isMerged: true,
          });
          visitedIndices.add(nextIndex);
          continue;
        }
      }

      mergedCouples.push({
        displayName: current.name,
        type: "COUPLE",
        price: current.price,
        isMerged: false,
      });
    }

    const formattedOthers: DisplaySeat[] = otherSeats.map((s) => ({
      displayName: s.name,
      type: s.type,
      price: s.price,
      isMerged: false,
    }));

    return [...formattedOthers, ...mergedCouples];
  };

  // --- EFFECT XỬ LÝ DỮ LIỆU ---
  useEffect(() => {
    if (open && booking) {
      const { userMap, showtimeMap, movieMap, roomMap, cinemaMap } = maps || {};

      // 1. User Info
      const user = booking.userId ? userMap[booking.userId] : null;
      const userObj = user
        ? {
            name: user.fullname,
            email: user.email,
            phone: user.phone, // Nếu có
            gender: user.gender,
          }
        : null;

      // 2. Cinema & Room Info
      const showTime = showtimeMap[booking.showtimeId];
      // Logic fallback: Đôi khi roomMap chưa có showTime.roomId nếu API chưa trả về
      const room = showTime ? roomMap[showTime.roomId] : null;
      // Logic fallback: Lấy cinema từ showtime hoặc từ room
      const cinemaId = showTime?.cinemaId || room?.cinemaId;
      const cinema = cinemaId ? cinemaMap[cinemaId] : null;

      const roomName = room?.name || "Phòng ?";
      const cinemaName = cinema?.name || "Rạp ?";

      const movie = showTime ? movieMap[showTime.movieId] : null;
      const movieTitle = movie?.title || movie?.name || "Phim ?";

      const basePrice = showTime?.price || 0;

      // 3. Xử lý ghế (Quan trọng: Cần room.seats)
      let displaySeats: DisplaySeat[] = [];
      // Lưu ý: room object trong roomMap CẦN PHẢI chứa mảng `seats`.
      // Nếu API getRoomById của bạn chưa trả về seats, logic này sẽ không chạy được chi tiết.
      // Tạm thời fallback nếu không có seats:
      if (room && (room as any).seats) {
        displaySeats = processSeats(
          booking.bookingSeats || [],
          (room as any).seats,
          basePrice
        );
      } else {
        // Fallback đơn giản nếu không có thông tin ghế chi tiết
        displaySeats = (booking.bookingSeats || []).map((bs: any) => ({
          displayName: bs.seatNumber || "Ghế", // Nếu backend có trả về seatNumber sẵn
          type: "UNKNOWN",
          price: 0,
        }));
      }

      // 4. Xử lý Food (Initial)
      const initialFoods = (booking.bookingFoodDrinks || []).map((f: any) => ({
        name: "Đang tải...",
        quantity: f.quantity,
        price: f.totalPrice,
        id: f.foodDrinkId, // Lưu tạm ID để fetch
      }));

      setDetails({
        userObj,
        cinemaName,
        roomName,
        movieTitle,
        showTimeRaw: showTime?.startTime || "",
        displaySeats,
        foodItems: initialFoods,
      });

      // 5. Fetch Food Names (Lazy)
      if (booking.bookingFoodDrinks?.length > 0) {
        setLoadingFood(true);
        Promise.all(
          booking.bookingFoodDrinks.map(async (item: any) => {
            try {
              // Gọi service lấy tên món
              const food = await getFoodDrinkById(item.foodDrinkId);
              return {
                name: food.name || food.title || "Tên món trống",
                quantity: item.quantity,
                price: item.totalPrice,
              };
            } catch {
              return {
                name: "Món không xác định",
                quantity: item.quantity,
                price: item.totalPrice,
              };
            }
          })
        ).then((updatedFoods) => {
          setDetails((prev) =>
            prev ? { ...prev, foodItems: updatedFoods } : null
          );
          setLoadingFood(false);
        });
      }
    } else {
      setDetails(null);
    }
  }, [open, booking, maps]);

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 border-b bg-muted/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">Chi tiết đơn hàng</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                ID: {booking.id}
              </DialogDescription>
            </div>
            <Badge
              variant={booking.type === "online" ? "default" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {booking.type === "online" ? "Online" : "Tại quầy"}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* 1. Thông tin chung (Grid Card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Khách hàng */}
              <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <User className="h-4 w-4" />
                  <h4>Thông tin khách hàng</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" /> Tên:
                    </span>
                    <span className="font-medium">
                      {details?.userObj?.name || "Khách vãng lai"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email:
                    </span>
                    <span className="font-medium">
                      {details?.userObj?.email || "---"}
                    </span>
                  </div>
                  {details?.userObj?.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" /> SĐT:
                      </span>
                      <span className="font-medium">
                        {details?.userObj?.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Rạp Phim */}
              <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  <MonitorPlay className="h-4 w-4" />
                  <h4>Thông tin suất chiếu</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phim:</span>
                    <span
                      className="font-bold text-right truncate max-w-[180px]"
                      title={details?.movieTitle}
                    >
                      {details?.movieTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rạp / Phòng:</span>
                    <span className="font-medium">
                      {details?.cinemaName} - {details?.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {details?.showTimeRaw &&
                        format(
                          new Date(details.showTimeRaw),
                          "HH:mm - dd/MM/yyyy",
                          { locale: vi }
                        )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 2. Bảng Ghế */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                Ghế đã đặt
                <Badge variant="outline">
                  {details?.displaySeats.length || 0} ghế
                </Badge>
              </h4>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Số ghế</TableHead>
                      <TableHead>Loại ghế</TableHead>
                      <TableHead className="text-right">Giá vé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details?.displaySeats.map((seat, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold">
                          {seat.displayName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              seat.type === "VIP"
                                ? "default"
                                : seat.type === "COUPLE"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {seat.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(seat.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!details?.displaySeats ||
                      details.displaySeats.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground h-16"
                        >
                          Không có dữ liệu ghế
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 3. Bảng Đồ ăn (Nếu có) */}
            {details?.foodItems && details.foodItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  Bắp & Nước
                  {loadingFood && (
                    <span className="text-xs text-muted-foreground font-normal animate-pulse">
                      (Đang tải...)
                    </span>
                  )}
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Tên món</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.foodItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            className={
                              item.name.includes("Đang tải")
                                ? "italic text-muted-foreground"
                                : "font-medium"
                            }
                          >
                            {item.name}
                          </TableCell>
                          <TableCell className="text-center">
                            x{item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-6 border-t bg-gray-50 flex items-center justify-between sm:justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
          <Button onClick={() => onOpenChange(false)} size="lg">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
