"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Cinema, CreateCinemaData, UpdateCinemaData } from "@/types/cinema";
import { createCinema, updateCinema } from "@/services/cinemas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CinemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cinema?: Cinema | null;
  onSuccess?: () => void;
}

export function CinemaDialog({
  open,
  onOpenChange,
  cinema,
  onSuccess,
}: CinemaDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!cinema;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      longitude: undefined,
      latitude: undefined,
    },
  });

  useEffect(() => {
    if (cinema) {
      form.reset({
        name: cinema.name,
        address: cinema.address,
        city: cinema.city,
        longitude: cinema.longitude,
        latitude: cinema.latitude,
      });
    } else {
      form.reset({
        name: "",
        address: "",
        city: "",
        longitude: undefined,
        latitude: undefined,
      });
    }
  }, [cinema, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (isEditing && cinema) {
        const updateData: UpdateCinemaData = {
          ...data,
          longitude: data.longitude || undefined,
          latitude: data.latitude || undefined,
        };
        await updateCinema(cinema.id, updateData);
        toast.success("Cinema updated successfully!");
      } else {
        const createData: CreateCinemaData = {
          ...data,
          longitude: data.longitude || undefined,
          latitude: data.latitude || undefined,
        };
        await createCinema(createData);
        toast.success("Cinema created successfully!");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} cinema`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Cinema" : "Create New Cinema"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the cinema information below."
              : "Fill in the details to create a new cinema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cinema Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cinema name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 40.7128"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === ""
                              ? undefined
                              : parseFloat(value) || undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., -74.0060"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === ""
                              ? undefined
                              : parseFloat(value) || undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                )}
                {isEditing ? "Update" : "Create"} Cinema
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
