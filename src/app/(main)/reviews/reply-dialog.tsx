"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Review } from "@/types/review";
import { useReplyToReview } from "@/hooks/use-reviews";
import { Badge } from "@/components/ui/badge";

const replySchema = z.object({
  content: z
    .string()
    .min(1, "Reply content is required")
    .min(10, "Reply must be at least 10 characters")
    .max(1000, "Reply must be less than 1000 characters"),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onSuccess: () => void;
}

export function ReplyDialog({
  open,
  onOpenChange,
  review,
  onSuccess,
}: ReplyDialogProps) {
  const replyMutation = useReplyToReview();

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        content: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (data: ReplyFormData) => {
    if (!review) return;

    try {
      await replyMutation.mutateAsync({
        reviewId: review.id,
        content: data.content,
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {}
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const isLoading = replyMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogDescription>
            Add a reply to this review. The user will be notified.
          </DialogDescription>
        </DialogHeader>

        {review && (
          <div className="space-y-3 py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{review.rating.toFixed(1)}</span>
                <Badge variant="secondary" className="ml-auto">
                  {review.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {review.content || <span className="italic">No content</span>}
              </p>
              <div className="text-xs text-muted-foreground">
                User ID: {review.userId}
              </div>
            </div>

            {review.response && review.response.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Previous Replies:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {review.response.map((reply, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-primary/10 p-3 text-sm"
                    >
                      <p>{reply.content}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Reply</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your reply..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
