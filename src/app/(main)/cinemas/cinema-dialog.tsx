"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { Cinema, CreateCinemaData, UpdateCinemaData } from "@/types/cinema";
import { useCreateCinema, useUpdateCinema } from "@/hooks/use-cinemas";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";

export const createCinemaSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("cinemas.name.required")),
    address: z.string().min(1, t("cinemas.address.required")),
    city: z.string().min(1, t("cinemas.city.required")),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  });

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
  const isEditing = !!cinema;
  const createMutation = useCreateCinema();
  const updateMutation = useUpdateCinema();
  const { t } = useI18n();
  const formSchema = useMemo(() => createCinemaSchema(t), [t]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
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
    const fetchCities = async () => {
      const response = await axios.get(
        "https://open.oapi.vn/location/provinces?page=0&size=100"
      );
      setCities(
        response.data.data.map((city: any) => ({
          id: city.id,
          name: city.name,
        }))
      );
    };

    fetchCities();
  }, []);

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && cinema) {
        const updateData: UpdateCinemaData = {
          ...data,
          longitude: data.longitude || undefined,
          latitude: data.latitude || undefined,
        };
        await updateMutation.mutateAsync({ id: cinema.id, data: updateData });
      } else {
        const createData: CreateCinemaData = {
          ...data,
          longitude: data.longitude || undefined,
          latitude: data.latitude || undefined,
        };
        await createMutation.mutateAsync(createData);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("cinemas.updateCinema.title")
              : t("cinemas.createCinema.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("cinemas.updateCinema.description")
              : t("cinemas.createCinema.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cinemas.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cinemas.updateCinema.namePlaceholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("cinemas.city")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "cinemas.updateCinema.cityPlaceholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>{t("cinemas.address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("cinemas.updateCinema.addressPlaceholder")}
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
                    <FormLabel>
                      {t("cinemas.updateCinema.latitudeOptional")}
                    </FormLabel>
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
                    <FormLabel>
                      {t("cinemas.updateCinema.longitudeOptional")}
                    </FormLabel>
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
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                )}
                {isEditing ? t("common.update") : t("common.create")}{" "}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
