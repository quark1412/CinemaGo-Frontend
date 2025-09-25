"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createMovie } from "@/services/movies";
import { GenreSelector } from "@/components/genre-selector";

const formSchema = z.object({
  thumbnail: z.string().min(1, { message: "Thumbnail is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  duration: z
    .number({ error: "Duration is required" })
    .min(1, { message: "Duration must be greater than 0" }),
  genres: z
    .array(z.string())
    .min(1, { message: "At least one genre is required" }),
  trailer: z.string().min(1, { message: "Trailer is required" }),
});

export default function CreateMovie() {
  const [thumbnail, setThumbnail] = useState<{
    imagePath: string;
    imageFile: File | null;
  } | null>(null);

  const [trailer, setTrailer] = useState<{
    videoPath: string;
    videoFile: File | null;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thumbnail: "",
      title: "",
      description: "",
      duration: undefined,
      genres: [],
      trailer: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMovie({
      ...values,
      thumbnail: thumbnail?.imageFile as File,
      trailer: trailer?.videoFile as File,
    })
      .then(() => {
        toast.success("Movie created successfully");
      })
      .catch((error) => {
        console.error("Create movie error:", error);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to create movie";
        toast.error(message);
      });
  };

  const handleTrailerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setTrailer({
        videoPath: videoUrl,
        videoFile: file,
      });
      form.setValue("trailer", videoUrl);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePath = reader.result as string;
        setThumbnail({
          imagePath,
          imageFile: file,
        });
        form.setValue("thumbnail", imagePath);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/movies">All movies</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create movie</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-8 flex flex-col gap-6 bg-background px-6 py-6 rounded-lg">
        <p className="text-xl font-bold">Movie information</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-8 items-start flex-wrap">
              {/* Trailer Upload */}
              <FormField
                control={form.control}
                name="trailer"
                render={({ field }) => (
                  <FormItem className="flex-2 min-w-64">
                    <FormLabel>
                      Trailer <span className="text-xs text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          id="trailer-file"
                          className="hidden"
                          type="file"
                          accept="video/*"
                          onChange={handleTrailerChange}
                        />
                        <div
                          className={`flex h-84 p-5 flex-row flex-wrap items-center justify-center rounded-lg border-2 border-dashed ${
                            form.formState.errors.trailer
                              ? "border-red-500"
                              : "border-gray-300"
                          } cursor-pointer hover:bg-accent`}
                        >
                          <Label
                            htmlFor="trailer-file"
                            className="cursor-pointer w-full h-full flex items-center justify-center"
                          >
                            {!trailer ? (
                              <div className="flex flex-col items-center justify-center">
                                <ImagePlus size={60} />
                                <p className="mt-2 text-sm text-gray-500 font-semibold">
                                  Upload trailer video
                                </p>
                                <p className="text-xs text-gray-400">
                                  MP4, AVI, MOV up to 100MB
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <video
                                  src={trailer.videoPath}
                                  className="w-full h-full rounded object-cover"
                                  controls
                                />
                                <div className="text-center">
                                  <p className="text-sm font-semibold text-gray-700">
                                    {trailer.videoFile?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {trailer.videoFile &&
                                      `${(
                                        trailer.videoFile.size /
                                        (1024 * 1024)
                                      ).toFixed(2)} MB`}
                                  </p>
                                </div>
                                <p className="text-xs text-primary">
                                  Click to change
                                </p>
                              </div>
                            )}
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail Upload */}
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem className="flex-[1] min-w-64">
                    <FormLabel>
                      Thumbnail <span className="text-xs text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          id="dropzone-file"
                          className="hidden"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                        <div
                          className={`flex h-84 w-60 flex-row flex-wrap items-center justify-center rounded-lg border-2 border-dashed ${
                            form.formState.errors.thumbnail
                              ? "border-red-500"
                              : "border-gray-300"
                          } cursor-pointer hover:bg-accent`}
                        >
                          <Label
                            htmlFor="dropzone-file"
                            className="cursor-pointer w-full h-full flex items-center justify-center"
                          >
                            {!thumbnail ? (
                              <div className="flex flex-col items-center justify-center">
                                <ImagePlus size={60} />
                                <p className="mt-2 text-sm text-gray-500 font-semibold">
                                  Upload thumbnail
                                </p>
                              </div>
                            ) : (
                              <div className="relative">
                                <Image
                                  src={thumbnail.imagePath}
                                  alt="thumbnail"
                                  width={200}
                                  height={280}
                                  className="rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                  <p className="text-white text-sm font-semibold">
                                    Change thumbnail
                                  </p>
                                </div>
                              </div>
                            )}
                          </Label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex-[2] flex flex-col gap-4 min-w-64">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          Title <span className="text-xs text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          Duration{" "}
                          <span className="text-xs text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Minutes"
                            {...field}
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : Number(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          Genres <span className="text-xs text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <GenreSelector
                            value={field.value || []}
                            onValueChange={field.onChange}
                            placeholder="Select genres"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        Description{" "}
                        <span className="text-xs text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a short description about movie..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-start mt-10">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/90"
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
              >
                Add movie
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/movies">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
