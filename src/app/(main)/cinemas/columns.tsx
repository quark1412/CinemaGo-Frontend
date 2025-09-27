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
  onEdit: (cinema: Cinema) => void;
  onArchive: (cinema: Cinema) => void;
  onRestore: (cinema: Cinema) => void;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
}: ColumnProps): ColumnDef<Cinema>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="text-xs font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      return <div className="text-xs">{row.original.city}</div>;
    },
  },
  {
    accessorKey: "address",
    header: () => <div className="font-bold text-sm">Address</div>,
    cell: ({ row }) => {
      return (
        <div className="max-w-80 text-wrap text-xs text-muted-foreground">
          {row.original.address}
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
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
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
              <span className="sr-only text-xs">Actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(cinema)}
            >
              <Pencil className="text-primary" />
              <span className="text-xs">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(cinema.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy cinema ID</span>
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
                <MapPin className="text-blue-500" />
                <span className="text-xs text-blue-500">View on Map</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {cinema.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onArchive(cinema)}
              >
                <Archive className="text-orange-500" />
                <span className="text-xs text-orange-500">Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onRestore(cinema)}
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
