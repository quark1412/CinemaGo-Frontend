"use client";

import { useEffect, useState } from "react";
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
import { useI18n } from "@/contexts/I18nContext";
import { formatDateSafe } from "@/lib/utils";
import { getUserById } from "@/services/users";

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
  const { t } = useI18n();

  const replySchema = z.object({
    content: z
      .string()
      .min(1, t("reviews.modal.min1"))
      .min(10, t("reviews.modal.min10"))
      .max(1000, t("reviews.modal.max1000")),
  });

  type ReplyFormData = z.infer<typeof replySchema>;

  const replyMutation = useReplyToReview();

  const [userName, setUserName] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    const fetchUserName = async () => {
      if (!review?.userId) return;

      setLoadingUser(true);
      try {
        const userData = await getUserById(review.userId);
        setUserName(userData.data.fullname || review.userId);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUserName(review.userId);
      } finally {
        setLoadingUser(false);
      }
    };

    if (open && review) {
      fetchUserName();
      form.reset({ content: "" });
    } else {
      setUserName("");
    }
  }, [open, review, form]);

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
          <DialogTitle>{t("reviews.modal.title")}</DialogTitle>
          <DialogDescription>{t("reviews.modal.desc")}</DialogDescription>
        </DialogHeader>

        {review && (
          <div className="space-y-3 py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{review.rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {review.content || (
                  <span className="italic">
                    {t("reviews.modal.no_content")}
                  </span>
                )}
              </p>
              <div className="text-xs text-muted-foreground">
                {t("reviews.user")}: {loadingUser ? "Loading..." : userName}
              </div>
            </div>

            {review.response && review.response.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {" "}
                  {t("reviews.modal.previous_replies")}
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {review.response.map((reply, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-primary/10 p-3 text-sm"
                    >
                      <p>{reply.content}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateSafe(String(reply.createdAt))}
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
                  <FormLabel> {t("reviews.modal.your_reply")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("reviews.modal.enter") + "..."}
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
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t("reviews.modal.sending")
                  : t("reviews.modal.send")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
