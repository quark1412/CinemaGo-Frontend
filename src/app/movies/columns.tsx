"use client";

import { Movie } from "@/types/Movie";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";

export const columns: ColumnDef<Movie>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
  },
  {
    accessorKey: "genres",
    header: "Genres",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "releaseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Release Date" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const movie = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(movie.id)}
            >
              Copy movie ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View movie</DropdownMenuItem>
            <DropdownMenuItem>View movie details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
