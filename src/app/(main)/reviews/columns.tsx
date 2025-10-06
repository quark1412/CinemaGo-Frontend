"use client";

import { Review } from "@/types/review";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  Clipboard,
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
  onReply: (review: Review) => void;
  onHide: (review: Review) => void;
  onUnhide: (review: Review) => void;
}

export const createColumns = ({
  onReply,
  onHide,
  onUnhide,
}: ColumnProps): ColumnDef<Review>[] => [
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs font-mono">
          {row.original.userId.substring(0, 8)}...
        </div>
      );
    },
  },
  {
    accessorKey: "movieId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Movie ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs font-mono">
          {row.original.movieId.substring(0, 8)}...
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.original.rating;
      return (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-xs font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "content",
    header: () => <div className="font-bold text-sm">Review Content</div>,
    cell: ({ row }) => {
      const content = row.original.content;
      return (
        <div className="max-w-96 text-wrap text-xs text-muted-foreground">
          {content || <span className="italic">No content</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="font-bold text-sm">Sentiment</div>,
    cell: ({ row }) => {
      const type = row.original.type;
      const variant =
        type === "Tích cực" || type === "POSITIVE"
          ? "default"
          : type === "Tiêu cực" || type === "NEGATIVE"
          ? "destructive"
          : "secondary";
      return <Badge variant={variant}>{type}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="font-bold text-sm">Status</div>,
    cell: ({ row }) => {
      const status = row.original.status;
      const isReplied = status === "Đã trả lời" || status === "REPLIED";
      return (
        <Badge variant={isReplied ? "default" : "secondary"}>
          {isReplied ? "Replied" : "Unreplied"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="font-bold text-sm">Visibility</div>,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Visible" : "Hidden"}
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
      const review = row.original;

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
              onClick={() => onReply(review)}
            >
              <MessageSquare className="text-primary" />
              <span className="text-xs">Reply</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(review.id)}
            >
              <Clipboard className="text-primary" />
              <span className="text-xs">Copy review ID</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {review.isActive ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onHide(review)}
              >
                <EyeOff className="text-orange-500" />
                <span className="text-xs text-orange-500">Hide</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onUnhide(review)}
              >
                <Eye className="text-green-500" />
                <span className="text-xs text-green-500">Unhide</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
