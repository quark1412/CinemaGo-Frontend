"use client";

import { useState } from "react";

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

export default function AllReviews() {
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

  const { data, isLoading } = useReviews(currentParams);
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
      setConfirmationDialog({
        open: false,
        review: null,
        action: "hide",
      });
    } catch (error) {}
  };

  const handleReplySuccess = () => {};

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
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={
          data?.pagination || {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        }
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        loading={isLoading}
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
          confirmationDialog.action === "hide" ? "Hide Review" : "Unhide Review"
        }
        description={
          confirmationDialog.action === "hide"
            ? `Are you sure you want to hide this review? It will not be visible to users.`
            : `Are you sure you want to unhide this review? It will be visible to users again.`
        }
        confirmText={confirmationDialog.action === "hide" ? "Hide" : "Unhide"}
        variant={confirmationDialog.action === "hide" ? "archive" : "restore"}
        onConfirm={handleConfirmAction}
        loading={hideMutation.isPending || unhideMutation.isPending}
      />
    </div>
  );
}
