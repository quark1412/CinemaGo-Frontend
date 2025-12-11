"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodDrink, FoodDrinkType } from "@/types/fooddrink";
import { useCreateFoodDrink, useUpdateFoodDrink } from "@/hooks/use-fooddrinks";
import { useI18n } from "@/contexts/I18nContext";

interface FoodDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodDrink?: FoodDrink | null;
  onSuccess: () => void;
}

export function FoodDrinkDialog({
  open,
  onOpenChange,
  foodDrink,
  onSuccess,
}: FoodDrinkDialogProps) {
  const { t } = useI18n();

  const foodDrinkSchema = z.object({
    name: z
      .string()
      .min(1, t("foodDrinks.modal.name.min1"))
      .min(2, t("foodDrinks.modal.name.min2"))
      .max(100, t("foodDrinks.modal.name.max100")),
    description: z
      .string()
      .min(1, t("foodDrinks.modal.desc.min1"))
      .max(500, t("foodDrinks.modal.desc.max500")),
    price: z
      .number({ error: t("foodDrinks.modal.price.number") })
      .min(0, t("foodDrinks.modal.price.min0"))
      .int(t("foodDrinks.modal.price.int")),
    type: z.enum(["SNACK", "DRINK", "COMBO"], {
      error: t("foodDrinks.modal.type.error"),
    }),
    image: z.string().optional(),
  });

  type FoodDrinkFormData = z.infer<typeof foodDrinkSchema>;

  const isEditing = !!foodDrink;
  const createMutation = useCreateFoodDrink();
  const updateMutation = useUpdateFoodDrink();

  const [imagePreview, setImagePreview] = useState<{
    imagePath: string;
    imageFile: File | null;
  } | null>(null);

  const form = useForm<FoodDrinkFormData>({
    resolver: zodResolver(foodDrinkSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      type: "SNACK",
      image: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (foodDrink) {
        form.reset({
          name: foodDrink.name,
          description: foodDrink.description,
          price: foodDrink.price,
          type: foodDrink.type,
          image: foodDrink.image,
        });
        setImagePreview({
          imagePath: foodDrink.image,
          imageFile: null,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: undefined,
          type: "SNACK",
          image: "",
        });
        setImagePreview(null);
      }
    }
  }, [open, foodDrink, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePath = reader.result as string;
        setImagePreview({
          imagePath,
          imageFile: file,
        });
        form.setValue("image", imagePath);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", "");
  };

  const onSubmit = async (data: FoodDrinkFormData) => {
    try {
      if (isEditing && foodDrink) {
        const updateData: any = {
          name: data.name,
          description: data.description,
          price: data.price,
          type: data.type,
        };

        if (imagePreview?.imageFile) {
          updateData.image = imagePreview.imageFile;
        }

        await updateMutation.mutateAsync({
          id: foodDrink.id,
          data: updateData,
        });
      } else {
        if (!imagePreview?.imageFile) {
          form.setError("image", {
            message: "Image is required",
          });
          return;
        }

        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          price: data.price,
          type: data.type,
          image: imagePreview.imageFile,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {}
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setImagePreview(null);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("foodDrinks.updateFoodDrink.title")
              : t("foodDrinks.createFoodDrink.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("foodDrinks.updateFoodDrink.description")
              : t("foodDrinks.createFoodDrink.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("foodDrinks.image")}
                    {!isEditing && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        id="image-file"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {!imagePreview ? (
                        <div
                          className={`flex h-48 items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:bg-accent ${
                            form.formState.errors.image
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <Label
                            htmlFor="image-file"
                            className="cursor-pointer w-full h-full flex items-center justify-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <ImagePlus size={40} />
                              <p className="mt-2 text-sm text-gray-500 font-semibold">
                                {t("foodDrinks.uploadimage")}
                              </p>
                              <p className="text-xs text-gray-400">
                                {t("foodDrinks.size")}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ) : (
                        <div className="relative w-full">
                          <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                            <Image
                              src={imagePreview.imagePath}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 600px) 100vw, 600px"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {imagePreview.imageFile?.name ||
                              t("foodDrinks.currentimage")}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("foodDrinks.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("foodDrinks.modal.enter_name")}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("foodDrinks.type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SNACK">
                          {t("foodDrinks.filterFoodDrink.SNACK")}
                        </SelectItem>
                        <SelectItem value="DRINK">
                          {" "}
                          {t("foodDrinks.filterFoodDrink.DRINK")}
                        </SelectItem>
                        <SelectItem value="COMBO">
                          {" "}
                          {t("foodDrinks.filterFoodDrink.COMBO")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("foodDrinks.price")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("foodDrinks.modal.enter_price")}
                      {...field}
                      value={field.value?.toString() ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : Number(value)
                        );
                      }}
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
                  <FormLabel>{t("foodDrinks.desc")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("foodDrinks.modal.enter_desc")}
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
                  ? t("foodDrinks.updateFoodDrink.title")
                  : t("foodDrinks.createFoodDrink.title")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
