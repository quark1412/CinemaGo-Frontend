"use client";

import { Room } from "@/types/cinema";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Clipboard,
  MoreHorizontal,
  Pencil,
  Layout,
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

interface ColumnProps {
  onEdit: (room: Room) => void;
  onArchive: (room: Room) => void;
  onRestore: (room: Room) => void;
  onDesignLayout: (room: Room) => void;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
  onDesignLayout,
}: ColumnProps): ColumnDef<Room>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Room Name" />
    ),
    cell: ({ row }) => {
      return <div className="text-xs font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "totalSeats",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Seats" />
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
    header: () => <div className="font-bold text-sm">Status</div>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Archived"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">{formatDate(row.original.createdAt)}</div>
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
              <span className="sr-only text-xs">Actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(room)}
            >
              <Pencil className="text-primary" />
              <span className="text-xs">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onDesignLayout(room)}
            >
              <Layout className="text-primary" />
              <span className="text-xs">Design Layout</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(room.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy room ID</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {room.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onArchive(room)}
              >
                <Archive className="text-orange-500" />
                <span className="text-xs text-orange-500">Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onRestore(room)}
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
