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
  return [
    {
      accessorKey: "id",
      header: "Mã đơn",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-600">
          {row.original.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "userId",
      header: "Khách hàng",
      cell: ({ row }) => {
        const userId = row.original.userId;
        const user = userMap[userId];

        if (!user) {
          return (
            <span className="text-gray-400 italic text-xs">
              {userId ? "Đang tải..." : "Khách vãng lai"}
            </span>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.fullname}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "showtimeId",
      header: "Suất chiếu / Phim",
      cell: ({ row }) => {
        const stId = row.original.showtimeId;
        const st = showtimeMap[stId];

        if (!st)
          return (
            <span className="text-xs text-gray-400 animate-pulse">
              Checking...
            </span>
          );

        const movie = movieMap[st.movieId];
        const room = roomMap[st.roomId];
        const cinema = st.cinemaId
          ? cinemaMap[st.cinemaId]
          : room?.cinemaId
          ? cinemaMap[room.cinemaId]
          : null;

        const movieName = movie?.title || "Đang tải phim...";
        const roomName = room?.name || "Phòng ?";
        const cinemaName = cinema?.name || "";
        const time = formatDateTime(st.startTime);

        return (
          <div className="max-w-[250px]">
            <div
              className="font-bold text-blue-700 truncate text-sm"
              title={movieName}
            >
              {movieName}
            </div>
            <div className="text-xs text-gray-600 mt-1 flex flex-col gap-0.5">
              {cinemaName && (
                <span className="font-medium text-gray-500">{cinemaName}</span>
              )}
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
      header: "Hình thức",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "online" ? "default" : "secondary"}>
            {type === "online" ? "Đặt Online" : "Tại quầy"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tổng tiền" />
      ),
      cell: ({ row }) => (
        <b className="text-green-600 text-sm">
          {formatCurrency(row.original.totalPrice)}
        </b>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày đặt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
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
          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
};
