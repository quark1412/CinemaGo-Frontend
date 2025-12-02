"use client";

import { Cinema } from "@/types/cinema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Clipboard,
  MoreHorizontal,
  Pencil,
  MapPin,
  Eye,
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
  onEdit: (cinema: Cinema) => void;
  onArchive: (cinema: Cinema) => void;
  onRestore: (cinema: Cinema) => void;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
}: ColumnProps): ColumnDef<Cinema>[] => {
  const { t } = useI18n();
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("cinemas.name")} />
      ),
      cell: ({ row }) => {
        return <div className="text-xs font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("cinemas.city")} />
      ),
      cell: ({ row }) => {
        return <div className="text-xs">{row.original.city}</div>;
      },
    },
    {
      accessorKey: "address",
      header: () => (
        <div className="font-bold text-xs">{t("cinemas.address")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-80 text-wrap text-xs">
            {row.original.address}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: () => (
        <div className="font-bold text-xs">{t("cinemas.status")}</div>
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
        <DataTableColumnHeader column={column} title={t("cinemas.createdAt")} />
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
        <DataTableColumnHeader column={column} title={t("cinemas.updatedAt")} />
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
        const cinema = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only text-xs"></span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(cinema)}
              >
                <Pencil className="text-primary" />
                <span className="text-xs">{t("common.actions.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(cinema.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("common.actions.copyId")}</span>
              </DropdownMenuItem>
              {cinema.longitude && cinema.latitude && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${cinema.latitude},${cinema.longitude}`,
                      "_blank"
                    )
                  }
                >
                  <MapPin className="text-primary" />
                  <span className="text-xs">
                    {t("common.actions.viewOnMap")}
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {cinema.isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onArchive(cinema)}
                >
                  <Archive className="text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {t("common.actions.archive")}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onRestore(cinema)}
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
