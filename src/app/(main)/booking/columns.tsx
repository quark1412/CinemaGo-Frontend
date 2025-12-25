"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onUpdatePaymentStatus: (id: string, status: string) => void;
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
  onUpdatePaymentStatus,
  userMap,
  showtimeMap,
  movieMap,
  roomMap,
  cinemaMap,
}: ColumnProps): ColumnDef<Booking>[] => {
  const { t } = useI18n();

  return [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => {
        if (!row.getCanSelect()) {
          return null;
        }

        return (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
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
        const user = userId ? userMap[userId] : null;

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
      accessorKey: "paymentMethod",
      header: t("bookings.paymentMethod"),
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return (
          <Badge variant="outline" className="uppercase">
            {method || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("bookings.status"),
      cell: ({ row }) => {
        const status = row.original.status || "PENDING";

        // Map status to VI labels
        let label = status;
        let colorClass = "bg-gray-100 text-gray-800 border-gray-200";

        switch (status) {
          case "Đã thanh toán":
            label = t("bookings.paid");
            colorClass = "bg-green-100 text-green-800 border-green-200";
            break;
          case "Chưa thanh toán":
            label = t("bookings.unpaid");
            colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
            break;
          case "Thanh toán thất bại":
            label = t("bookings.failed");
            colorClass = "bg-red-100 text-red-800 border-red-200";
            break;
        }

        return (
          <Badge
            className={`${colorClass} hover:${colorClass}`}
            variant="outline"
          >
            {label}
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
