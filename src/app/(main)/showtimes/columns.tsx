"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Clipboard,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Showtime } from "@/types/showtime";
import { archiveShowtime, restoreShowtime } from "@/services/showtimes";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onRefresh: () => void;
  onEdit: (showtime: Showtime) => void;
  movieMap?: Map<string, string>;
  roomCinemaMap?: Map<string, { roomName: string; cinemaName: string }>;
}

export const createShowtimeColumns = ({
  onRefresh,
  onEdit,
  movieMap,
  roomCinemaMap,
}: ColumnProps): ColumnDef<Showtime>[] => {
  const { t } = useI18n();
  return [
    {
      id: "movieName",
      accessorFn: (row) => {
        if (row.movieId && movieMap) {
          return movieMap.get(row.movieId) ?? "";
        }
        return "";
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("showtimes.movie")} />
      ),
      cell: ({ row }) => {
        const movieRowSpan = (row.original as any)._movieRowSpan || 0;
        const isFirstInGroup = movieRowSpan > 0;

        if (!isFirstInGroup) {
          return null;
        }

        const movieName =
          (row.original.movieId && movieMap
            ? movieMap.get(row.original.movieId)
            : null) || t("showtimes.unknownMovie");
        return (
          <div className="text-xs font-medium text-center">{movieName}</div>
        );
      },
    },
    {
      id: "roomCinema",
      accessorFn: (row) => {
        if (row.roomId && roomCinemaMap) {
          const roomCinema = roomCinemaMap.get(row.roomId);
          return roomCinema
            ? `${roomCinema.roomName} - ${roomCinema.cinemaName}`
            : "";
        }
        return "";
      },
      header: () => (
        <div className="font-bold text-xs">{t("showtimes.room")}</div>
      ),
      cell: ({ row }) => {
        const cinemaRowSpan = (row.original as any)._cinemaRowSpan || 0;
        const isFirstInCinemaGroup = cinemaRowSpan > 0;

        const roomCinema =
          row.original.roomId && roomCinemaMap
            ? roomCinemaMap.get(row.original.roomId)
            : null;

        if (!roomCinema) {
          if (!isFirstInCinemaGroup) {
            return null;
          }
          return (
            <div className="text-xs text-muted-foreground text-center">
              {t("showtimes.unknownRoom")}
            </div>
          );
        }

        // Only show cinema name on first row of cinema group
        if (!isFirstInCinemaGroup) {
          return (
            <div className="text-xs text-center">
              <div className="font-medium">{roomCinema.roomName}</div>
            </div>
          );
        }

        return (
          <div className="text-xs text-center">
            <div className="font-medium">{roomCinema.roomName}</div>
            <div className="text-muted-foreground">{roomCinema.cinemaName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("showtimes.startTime")}
        />
      ),
      cell: ({ row }) => {
        const startTime = row.original.startTime;
        return (
          <div className="text-xs ">
            <div>{formatTime(startTime)}</div>
            <div className="text-muted-foreground">
              {formatDate(new Date(startTime))}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "endTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("showtimes.endTime")} />
      ),
      cell: ({ row }) => {
        const endTime = row.original.endTime;
        return (
          <div className="text-xs">
            <div>{formatTime(endTime)}</div>
            <div className="text-muted-foreground">
              {formatDate(new Date(endTime))}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("showtimes.price")} />
      ),
      cell: ({ row }) => {
        const price = row.original.price;
        return <div className="text-xs font-medium">{formatPrice(price)}</div>;
      },
    },
    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("showtimes.language")}
        />
      ),
      cell: ({ row }) => {
        return <div className="text-xs">{row.original.language}</div>;
      },
    },
    {
      accessorKey: "subtitle",
      header: () => (
        <div className="font-bold text-xs">{t("showtimes.subtitle")}</div>
      ),
      cell: ({ row }) => {
        const hasSubtitle = row.original.subtitle;
        return (
          <Badge
            variant={hasSubtitle ? "default" : "secondary"}
            className="text-xs"
          >
            {hasSubtitle
              ? t("showtimes.filterShowtimes.yes")
              : t("showtimes.filterShowtimes.no")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "format",
      header: () => (
        <div className="font-bold text-xs">{t("showtimes.format")}</div>
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="text-xs">
            {row.original.format}
          </Badge>
        );
      },
    },

    {
      accessorKey: "isActive",
      header: () => (
        <div className="font-bold text-xs">{t("showtimes.status")}</div>
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {isActive ? t("common.status.active") : t("common.status.inactive")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const showtime = row.original;

        const handleArchive = async () => {
          try {
            await archiveShowtime(showtime.id);
            toast.success(
              t("showtimes.archiveShowtime.success") ||
                "Showtime archived successfully!"
            );
            onRefresh();
          } catch (error: any) {
            const message =
              error.response?.data?.message ||
              t("showtimes.archiveShowtime.error") ||
              "Failed to archive showtime";
            toast.error(message);
          }
        };

        const handleRestore = async () => {
          try {
            await restoreShowtime(showtime.id);
            toast.success(
              t("showtimes.restoreShowtime.success") ||
                "Showtime restored successfully!"
            );
            onRefresh();
          } catch (error: any) {
            const message =
              error.response?.data?.message ||
              t("showtimes.restoreShowtime.error") ||
              "Failed to restore showtime";
            toast.error(message);
          }
        };

        const handleEdit = () => {
          onEdit(showtime);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only text-xs">Actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Pencil className="text-primary" />
                <span className="text-xs">{t("common.actions.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(showtime.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("common.actions.copyId")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {showtime.isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleArchive}
                >
                  <Archive className="text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {t("common.actions.archive")}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleRestore}
                >
                  <ArchiveRestore className="text-green-500" />
                  <span className="text-xs text-green-500">
                    {t("common.actions.restore")}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
