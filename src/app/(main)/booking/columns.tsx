"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";

import {
  UserMap,
  MovieMap,
  ShowtimeMap,
  RoomMap,
  CinemaMap,
} from "@/types/booking";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onView: (booking: Booking) => void;
  userMap: UserMap;
  showtimeMap: ShowtimeMap;
  movieMap: MovieMap;
  roomMap: RoomMap;
  cinemaMap: CinemaMap;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDateTime = (dateString: string | Date) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const createColumns = ({
  onView,
  userMap,
  showtimeMap,
  movieMap,
  roomMap,
  cinemaMap,
}: ColumnProps): ColumnDef<Booking>[] => {
  const { t } = useI18n();

  return [
    {
      accessorKey: "id",
      header: () => <div className="font-bold text-xs">{t("bookings.id")}</div>,
      cell: ({ row }) => (
        <span className=" text-xs ">{row.original.id.slice(0, 8)}...</span>
      ),
    },
    {
      accessorKey: "userId",
      header: t("bookings.customer"),
      cell: ({ row }) => {
        const userId = row.original.userId;
        const user = userMap[userId];

        if (!user) {
          return (
            <span className=" italic text-xs">
              {userId ? t("bookings.loadingcus") : t("bookings.unknownCus")}
            </span>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.fullname}</span>
            <span className="text-xs ">{user.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "showtimeId",
      header: t("bookings.showtime"),
      cell: ({ row }) => {
        const stId = row.original.showtimeId;
        const st = showtimeMap[stId];

        if (!st)
          return (
            <span className="text-xs animate-pulse">{t("common.loading")}</span>
          );

        const movie = movieMap[st.movieId];
        const room = roomMap[st.roomId];
        const cinema = st.cinemaId
          ? cinemaMap[st.cinemaId]
          : room?.cinemaId
          ? cinemaMap[room.cinemaId]
          : null;

        const movieName = movie?.title || t("bookings.loadingmovie");
        const roomName = room?.name || t("bookings.loadingroom");
        const cinemaName = cinema?.name || t("bookings.loadingcinema");
        const time = formatDateTime(st.startTime);

        return (
          <div className="max-w-[250px]">
            <div
              className="font-bold text-blue-700 truncate text-sm"
              title={movieName}
            >
              {movieName}
            </div>
            <div className="text-xs  mt-1 flex flex-col gap-0.5">
              {cinemaName && <span className="font-medium ">{cinemaName}</span>}
              <span>
                {roomName} • {time}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("bookings.type"),
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "online" ? "default" : "secondary"}>
            {type === "online" ? t("bookings.online") : t("bookings.offline")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("bookings.total")} />
      ),
      cell: ({ row }) => (
        <b className="text-green-600 text-sm">
          {formatCurrency(row.original.totalPrice)}
        </b>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("bookings.created"),
      cell: ({ row }) => (
        <span className="text-xs ">
          {formatDateTime(row.original.createdAt as any)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-blue-50"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
};
