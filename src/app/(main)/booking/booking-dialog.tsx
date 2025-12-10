"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

import { getFoodDrinkById } from "@/services/fooddrinks";
import { Booking } from "@/types/booking";

import {
  UserMap,
  MovieMap,
  ShowTimeMap,
  RoomMap,
  CinemaMap,
} from "@/app/(main)/booking/use-booking-table";
import { useI18n } from "@/contexts/I18nContext";

interface SeatDef {
  id: string;
  seatNumber: string;
  seatType: string;
  extraPrice?: number;
}

interface DisplaySeat {
  displayName: string;
  type: string;
  price: number;
  isMerged?: boolean;
  row?: string;
  number?: number;
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
  const { t } = useI18n();

  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loadingFood, setLoadingFood] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const processSeats = (
    bookingSeats: { seatId: string }[],
    allRoomSeats: SeatDef[],
    basePrice: number
  ): DisplaySeat[] => {
    const rawSeats = bookingSeats
      .map((bs) => {
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

    const coupleSeats = rawSeats.filter((s) => s.type === "COUPLE");
    const otherSeats = rawSeats.filter((s) => s.type !== "COUPLE");

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

  useEffect(() => {
    if (open && booking) {
      const { userMap, showtimeMap, movieMap, roomMap, cinemaMap } = maps || {};

      const user = booking.userId ? userMap[booking.userId] : null;
      const userObj = user
        ? {
            name: user.fullname,
            email: user.email,

            gender: user.gender,
          }
        : null;

      const showTime = showtimeMap[booking.showtimeId];
      const room = showTime ? roomMap[showTime.roomId] : null;
      const cinemaId = showTime?.cinemaId || room?.cinemaId;
      const cinema = cinemaId ? cinemaMap[cinemaId] : null;

      const roomName = room?.name || "Phòng ?";
      const cinemaName = cinema?.name || "Rạp ?";

      const movie = showTime ? movieMap[showTime.movieId] : null;
      const movieTitle = movie?.title || "Phim ?";

      const basePrice = showTime?.price || 0;

      let displaySeats: DisplaySeat[] = [];

      if (room && (room as any).seats) {
        displaySeats = processSeats(
          booking.bookingSeats || [],
          (room as any).seats,
          basePrice
        );
      } else {
        displaySeats = (booking.bookingSeats || []).map((bs: any) => ({
          displayName: bs.seatNumber || "Ghế",
          type: "UNKNOWN",
          price: 0,
        }));
      }

      const initialFoods = (booking.bookingFoodDrinks || []).map((f: any) => ({
        name: "Đang tải...",
        quantity: f.quantity,
        price: f.totalPrice,
        id: f.foodDrinkId,
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

      if (booking.bookingFoodDrinks?.length > 0) {
        setLoadingFood(true);
        Promise.all(
          booking.bookingFoodDrinks.map(async (item: any) => {
            try {
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
        <DialogHeader className="p-6 border-b bg-muted/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">
                {t("bookings.modal.title")}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                ID: {booking.id}
              </DialogDescription>
            </div>
            <Badge
              variant={booking.type === "online" ? "default" : "secondary"}
              className="text-sm px-3 py-1"
            >
              {booking.type === "online"
                ? t("bookings.online")
                : t("bookings.offline")}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <User className="h-4 w-4" />
                  <h4>{t("bookings.modal.cusinfo")}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" /> {t("bookings.modal.name")}
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
                        <Phone className="h-3 w-3" />{" "}
                        {t("bookings.modal.phone")}
                      </span>
                      <span className="font-medium">
                        {details?.userObj?.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  <MonitorPlay className="h-4 w-4" />
                  <h4> {t("bookings.modal.showtimeinfo")}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {" "}
                      {t("bookings.modal.movie")}
                    </span>
                    <span
                      className="font-bold text-right truncate max-w-[180px]"
                      title={details?.movieTitle}
                    >
                      {details?.movieTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {" "}
                      {t("bookings.modal.room/cinema")}
                    </span>
                    <span className="font-medium">
                      {details?.cinemaName} - {details?.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("bookings.modal.time")}
                    </span>
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

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                {t("bookings.modal.bookedseat")}
                <Badge variant="outline">
                  {details?.displaySeats.length || 0} {t("bookings.modal.seat")}
                </Badge>
              </h4>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{t("bookings.modal.seatnumber")}</TableHead>
                      <TableHead>{t("bookings.modal.seattype")}</TableHead>
                      <TableHead className="text-right">
                        {t("bookings.modal.ticketprice")}
                      </TableHead>
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
                                ? "pink"
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
                          {t("bookings.modal.noseat")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {details?.foodItems && details.foodItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {t("bookings.modal.foodDrink")}
                  {loadingFood && (
                    <span className="text-xs text-muted-foreground font-normal animate-pulse">
                      {t("common.loading")}
                    </span>
                  )}
                </h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead> {t("bookings.modal.foodname")}</TableHead>
                        <TableHead className="text-center">
                          {" "}
                          {t("bookings.modal.quantity")}
                        </TableHead>
                        <TableHead className="text-right">
                          {" "}
                          {t("bookings.modal.foodprice")}
                        </TableHead>
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

        <DialogFooter className="p-6 border-t bg-background flex items-center justify-between sm:justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              {t("bookings.modal.totalprice")}
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
          <Button onClick={() => onOpenChange(false)} size="lg">
            {t("bookings.modal.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
