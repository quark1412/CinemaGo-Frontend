"use client";

import { Genre } from "@/types/genre";
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
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onEdit: (genre: Genre) => void;
  onArchive: (genre: Genre) => void;
  onRestore: (genre: Genre) => void;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
}: ColumnProps): ColumnDef<Genre>[] => {
  const { t } = useI18n();
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("genres.name")} />
      ),
      cell: ({ row }) => {
        return <div className="text-xs font-medium">{row.original.name}</div>;
      },
    },
    {
      accessorKey: "description",
      header: () => (
        <div className="font-bold text-xs">{t("genres.description")}</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-80 text-wrap text-xs">
            {row.original.description}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: () => (
        <div className="font-bold text-xs">{t("genres.status")}</div>
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
        <DataTableColumnHeader
          column={column}
          title={t("genres.header.createdAt")}
        />
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
        <DataTableColumnHeader
          column={column}
          title={t("genres.header.updatedAt")}
        />
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
        const genre = row.original;

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
                onClick={() => onEdit(genre)}
              >
                <Pencil className="text-primary" />
                <span className="text-xs">{t("common.actions.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(genre.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("common.actions.copyId")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {genre.isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onArchive(genre)}
                >
                  <Archive className="text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {t("common.actions.archive")}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onRestore(genre)}
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
