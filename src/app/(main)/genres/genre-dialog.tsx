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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Genre } from "@/types/genre";
import { useCreateGenre, useUpdateGenre } from "@/hooks/use-genres";
import { useI18n } from "@/contexts/I18nContext";

const genreSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
});

type GenreFormData = z.infer<typeof genreSchema>;

interface GenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genre?: Genre | null;
  onSuccess: () => void;
}

export function GenreDialog({
  open,
  onOpenChange,
  genre,
  onSuccess,
}: GenreDialogProps) {
  const { t } = useI18n();
  const isEditing = !!genre;
  const createMutation = useCreateGenre();
  const updateMutation = useUpdateGenre();

  const form = useForm<GenreFormData>({
    resolver: zodResolver(genreSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when dialog opens/closes or genre changes
  useEffect(() => {
    if (open) {
      if (genre) {
        form.reset({
          name: genre.name,
          description: genre.description,
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, genre, form]);

  const onSubmit = async (data: GenreFormData) => {
    try {
      if (isEditing && genre) {
        await updateMutation.mutateAsync({ id: genre.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {}
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("genres.updateGenre.title")
              : t("genres.createGenre.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("genres.updateGenre.description")
              : t("genres.createGenre.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("genres.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("genres.enterGenreNamePlaceholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("genres.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("genres.enterGenreDescriptionPlaceholder")}
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
                  ? isEditing
                    ? t("common.updating")
                    : t("common.creating")
                  : isEditing
                  ? t("genres.updateGenre.title")
                  : t("genres.createGenre.title")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
