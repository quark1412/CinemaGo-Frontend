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

interface ColumnProps {
  onRefresh: () => void;
  onEdit: (showtime: Showtime) => void;
}

export const createShowtimeColumns = ({
  onRefresh,
  onEdit,
}: ColumnProps): ColumnDef<Showtime>[] => [
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
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
      <DataTableColumnHeader column={column} title="End Time" />
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
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.original.price;
      return <div className="text-xs font-medium">{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    cell: ({ row }) => {
      return <div className="text-xs">{row.original.language}</div>;
    },
  },
  {
    accessorKey: "subtitle",
    header: () => <div className="font-bold">Subtitle</div>,
    cell: ({ row }) => {
      const hasSubtitle = row.original.subtitle;
      return (
        <Badge
          variant={hasSubtitle ? "default" : "secondary"}
          className="text-xs"
        >
          {hasSubtitle ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "format",
    header: () => <div className="font-bold">Format</div>,
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="text-xs">
          {row.original.format}
        </Badge>
      );
    },
  },
  {
    accessorKey: "roomId",
    header: () => <div className="font-bold">Room ID</div>,
    cell: ({ row }) => {
      return <div className="text-xs font-mono">{row.original.roomId}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="font-bold">Status</div>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
          {isActive ? "Active" : "Archived"}
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
          toast.success("Showtime archived successfully!");
          onRefresh();
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to archive showtime";
          toast.error(message);
        }
      };

      const handleRestore = async () => {
        try {
          await restoreShowtime(showtime.id);
          toast.success("Showtime restored successfully!");
          onRefresh();
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to restore showtime";
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
              <span className="text-xs">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(showtime.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy showtime ID</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {showtime.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleArchive}
              >
                <Archive className="text-orange-500" />
                <span className="text-xs text-orange-500">Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleRestore}
              >
                <ArchiveRestore className="text-green-500" />
                <span className="text-xs text-green-500">Restore</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
