"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { createGenre, updateGenre } from "@/services/genres";

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
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!genre;

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
    setIsLoading(true);

    try {
      if (isEditing && genre) {
        await updateGenre(genre.id, data);
        toast.success("Genre updated successfully!");
      } else {
        await createGenre(data);
        toast.success("Genre created successfully!");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} genre`;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Genre" : "Create New Genre"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the genre information below."
              : "Add a new genre to your movie catalog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter genre name"
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter genre description"
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
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Genre"
                  : "Create Genre"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
