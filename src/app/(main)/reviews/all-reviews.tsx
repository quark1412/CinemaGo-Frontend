"use client";

import { useState, useMemo } from "react";

import { Review } from "@/types/review";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { ReplyDialog } from "./reply-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { GetReviewsParams } from "@/services/reviews";
import {
  useReviews,
  useHideReview,
  useUnhideReview,
} from "@/hooks/use-reviews";
import { useReviewTable } from "./use-review-table";
import { useI18n } from "@/contexts/I18nContext";

export default function AllReviews() {
  const { t } = useI18n();
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    review: Review | null;
    action: "hide" | "unhide";
  }>({
    open: false,
    review: null,
    action: "hide",
  });
  const [currentParams, setCurrentParams] = useState<GetReviewsParams>({
    page: 1,
    limit: 10,
  });

  const {
    reviews,
    pagination,
    isLoading,
    maps, // Chứa userMap và movieMap
    onPaginationChange,

    setMovieFilter,
    setStatusFilter,
    setVisibilityFilter,

    refresh, // Hàm reload lại list sau khi action
  } = useReviewTable({
    page: 1,
    limit: 10,
  });

  const movieOptions = useMemo(() => {
    // Chuyển Map { id: Movie } thành mảng Option { value, label }
    return Object.values(maps.movieMap).map((m) => ({
      value: m.id,
      label: m.title,
    }));
  }, [maps.movieMap]);

  const hideMutation = useHideReview();
  const unhideMutation = useUnhideReview();

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setReplyDialogOpen(true);
  };

  const handleHideClick = (review: Review) => {
    setConfirmationDialog({
      open: true,
      review,
      action: "hide",
    });
  };

  const handleUnhideClick = (review: Review) => {
    setConfirmationDialog({
      open: true,
      review,
      action: "unhide",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.review) return;

    try {
      if (confirmationDialog.action === "hide") {
        await hideMutation.mutateAsync(confirmationDialog.review.id);
      } else {
        await unhideMutation.mutateAsync(confirmationDialog.review.id);
      }
      refresh(); // Reload list
      setConfirmationDialog({ open: false, review: null, action: "hide" });
    } catch (error) {}
  };

  const handleReplySuccess = () => {
    refresh(); // Reload list sau khi reply
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, userId: search });
  };

  const columns = createColumns({
    onReply: handleReplyClick,
    onHide: handleHideClick,
    onUnhide: handleUnhideClick,
    userMap: maps.userMap, // Truyền Map
    movieMap: maps.movieMap, // Truyền Map
  });

  return (
    <div className="h-full">
      <DataTable
        // columns={columns}
        // data={data?.data || []}
        // pagination={
        //   data?.pagination || {
        //     totalItems: 0,
        //     totalPages: 0,
        //     currentPage: 1,
        //     pageSize: 10,
        //     hasNextPage: false,
        //     hasPrevPage: false,
        //   }
        // }
        // onPaginationChange={handlePaginationChange}
        // onSearchChange={handleSearchChange}
        // loading={isLoading}
        movieOptions={movieOptions}
        columns={columns}
        data={reviews}
        loading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onMovieChange={setMovieFilter}
        onStatusChange={setStatusFilter}
        onVisibilityChange={setVisibilityFilter}
      />

      <ReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        review={selectedReview}
        onSuccess={handleReplySuccess}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.action === "hide"
            ? t("reviews.archiveReview.title")
            : t("reviews.restoreReview.title")
        }
        description={
          confirmationDialog.action === "hide"
            ? t("reviews.archiveReview.confirmText")
            : t("reviews.restoreReview.confirmText")
        }
        confirmText={
          confirmationDialog.action === "hide"
            ? t("reviews.hide")
            : t("reviews.unhide")
        }
        cancelText={t("common.cancel")}
        variant={confirmationDialog.action === "hide" ? "archive" : "restore"}
        onConfirm={handleConfirmAction}
        loading={hideMutation.isPending || unhideMutation.isPending}
      />
    </div>
  );
}
