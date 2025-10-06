import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllReviews,
  replyToReview,
  updateReview,
  hideReview,
  unhideReview,
  GetReviewsParams,
} from "@/services/reviews";

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (params: GetReviewsParams) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};

export function useReviews(params: GetReviewsParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => getAllReviews(params),
    staleTime: 30 * 1000,
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      content,
    }: {
      reviewId: string;
      content: string;
    }) => replyToReview(reviewId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Reply added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add reply");
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Review updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update review");
    },
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hideReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Review hidden successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to hide review");
    },
  });
}

export function useUnhideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unhideReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Review unhidden successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unhide review");
    },
  });
}
