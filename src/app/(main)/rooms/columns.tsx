"use client";

import { Room } from "@/types/cinema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Clipboard,
  MoreHorizontal,
  Pencil,
  Users,
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
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onEdit: (room: Room) => void;
  onArchive: (room: Room) => void;
  onRestore: (room: Room) => void;
  cinemaMap?: Map<string, string>;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
  cinemaMap,
}: ColumnProps): ColumnDef<Room>[] => {
  const { t } = useI18n();

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="font-bold text-xs">{t("rooms.name")}</div>
      ),
      cell: ({ row }) => {
        return <div className="text-xs font-medium">{row.original.name}</div>;
      },
    },
    {
      id: "cinemaName",
      accessorFn: (row) => {
        if (row.cinema?.name) {
          return row.cinema.name;
        }
        if (row.cinemaId && cinemaMap) {
          return cinemaMap.get(row.cinemaId) ?? "";
        }
        return "";
      },
      header: ({ column }) => (
        <div className="font-bold text-xs">{t("rooms.cinema")}</div>
      ),
      cell: ({ row }) => {
        const cinemaName =
          row.original.cinema?.name ||
          (row.original.cinemaId && cinemaMap
            ? cinemaMap.get(row.original.cinemaId)
            : null) ||
          t("rooms.unknownCinema");

        return <div className="text-xs">{cinemaName}</div>;
      },
    },
    {
      accessorKey: "totalSeats",
      header: ({ column }) => (
        <div className="font-bold text-xs">{t("rooms.totalSeats")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            {row.original.totalSeats}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: () => (
        <div className="font-bold text-xs">{t("rooms.status")}</div>
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t("common.status.active") : t("common.status.inactive")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.createdAt")} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs">{formatDate(row.original.createdAt)}</div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.updatedAt")} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs">{formatDate(row.original.updatedAt)}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const room = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only text-xs">
                  {t("common.actions.edit")}
                </span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(room)}
              >
                <Pencil className="text-primary" />
                <span className="text-xs">{t("common.actions.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(room.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("common.actions.copyId")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {room.isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onArchive(room)}
                >
                  <Archive className="text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {t("common.actions.archive")}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onRestore(room)}
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
