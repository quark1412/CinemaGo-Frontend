"use client";

import { Movie } from "@/types/movie";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveRestore,
  Clipboard,
  Eye,
  MoreHorizontal,
  Pencil,
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
import { formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ColumnProps {
  onEdit: (movie: Movie) => void;
  onArchive: (movie: Movie) => void;
  onRestore: (movie: Movie) => void;
}

export const createColumns = ({
  onEdit,
  onArchive,
  onRestore,
}: ColumnProps): ColumnDef<Movie>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return <div className="text-xs text-wrap">{row.original.title}</div>;
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height={20}
            width={20}
            viewBox="0 0 640 640"
          >
            <path
              fill="#FFD43B"
              d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"
            />
          </svg>
          <p className="text-xs">{row.original.rating}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "genres",
    header: () => <div className="font-bold">Genres</div>,
    cell: ({ row }) => {
      const genres = row.original.genres;
      return (
        <div className="flex flex-wrap gap-1 max-w-60">
          {genres.map((genre) => (
            <Badge key={genre.id} variant={"secondary"}>
              {genre.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="font-bold">Description</div>,
    cell: ({ row }) => {
      return (
        <div className="max-w-60 text-wrap text-xs">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: () => <div className="font-bold">Duration</div>,
    cell: ({ row }) => {
      return <div className="text-xs">{formatTime(row.original.duration)}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="font-bold">Active Status</div>,
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
    accessorKey: "status",
    header: () => <div className="font-bold">Movie Status</div>,
    cell: ({ row }) => {
      const status = row.original.status;

      if (process.env.NODE_ENV === "development" && !status) {
        console.warn(
          "Movie status is undefined for movie:",
          row.original.title
        );
      }

      const getStatusVariant = (status: string | undefined) => {
        switch (status) {
          case "NOW_SHOWING":
            return "default";
          case "COMING_SOON":
            return "secondary";
          case "ENDED":
            return "destructive";
          default:
            return "outline";
        }
      };
      return (
        <Badge variant={getStatusVariant(status)}>
          {status ? status.replace("_", " ") : "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "releaseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Release Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">{formatDate(row.original.releaseDate)}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const movie = row.original;

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
              onClick={() => onEdit(movie)}
            >
              <Pencil className="text-primary" />
              <span className="text-xs">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(movie.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy movie ID</span>
            </DropdownMenuItem>
            <Link href={`/movies/${movie.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="text-primary" />
                <span className="text-xs">View details</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            {movie.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onArchive(movie)}
              >
                <Archive className="text-orange-500" />
                <span className="text-xs text-orange-500">Archive</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onRestore(movie)}
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
