"use client";

import { Review } from "@/types/review";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  Clipboard,
  UserIcon,
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
import { formatDateSafe } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserMap, MovieMap } from "./use-review-table";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onReply: (review: Review) => void;
  onHide: (review: Review) => void;
  onUnhide: (review: Review) => void;
  userMap: UserMap;
  movieMap: MovieMap;
}

export const createColumns = ({
  onReply,
  onHide,
  onUnhide,
  userMap,
  movieMap,
}: ColumnProps): ColumnDef<Review>[] => {
  const { t } = useI18n();
  return [
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reviews.user")} />
      ),
      cell: ({ row }) => {
        const userId = row.original.userId;
        const user = userMap[userId];

        return (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              {user ? (
                <>
                  <span className="text-sm font-medium">{user.fullname}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {user.email}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  {userId.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "movieId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reviews.movie")} />
      ),
      cell: ({ row }) => {
        const movieId = row.original.movieId;
        const movie = movieMap[movieId];

        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <span
              className="text-sm font-semibold truncate"
              title={movie?.title}
            >
              {movie ? (
                movie.title
              ) : (
                <span className="text-xs font-mono">
                  {movieId.substring(0, 8)}...
                </span>
              )}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reviews.rating")} />
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
      header: () => (
        <div className="font-bold text-xs">{t("reviews.review content")}</div>
      ),
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
      accessorKey: "status",
      header: () => (
        <div className="font-bold text-xs">{t("reviews.status")}</div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const isReplied = status === "Đã trả lời" || status === "REPLIED";
        return (
          <Badge variant={isReplied ? "default" : "secondary"}>
            {isReplied
              ? t("reviews.filterReviews.replied")
              : t("reviews.filterReviews.Unreplied")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: () => (
        <div className="font-bold text-xs">{t("reviews.visibility")}</div>
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive
              ? t("reviews.filterReviews.active")
              : t("reviews.filterReviews.inactive")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("reviews.created")} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs">
            {formatDateSafe(String(row.original.createdAt))}
          </div>
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
                <span className="text-xs">{t("reviews.reply")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(review.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("reviews.copy")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {review.isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onHide(review)}
                >
                  <EyeOff className="text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {t("reviews.hide")}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onUnhide(review)}
                >
                  <Eye className="text-green-500" />
                  <span className="text-xs text-green-500">
                    {t("reviews.unhide")}
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
