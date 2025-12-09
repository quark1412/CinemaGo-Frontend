"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createMovie } from "@/services/movies";
import { GenreSelector } from "@/components/genre-selector";
import { convertToEmbedUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/contexts/I18nContext";

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
  trailer: z.string().optional(),
  trailerUrl: z.string().optional(),
});

interface CreateMovieProps {
  open?: boolean;
  onClose?: () => void;
}

export default function CreateMovie({
  open = true,
  onClose,
}: CreateMovieProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [trailerMode, setTrailerMode] = useState<"file" | "url">("file");
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
      trailerUrl: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (trailerMode === "file") {
      if (!trailer?.videoFile) {
        toast.error(
          t("movies.createMovie.pleaseUploadTrailerFileOrSwitchToUrlMode")
        );
        return;
      }
    } else {
      if (!values.trailerUrl) {
        toast.error(
          t("movies.createMovie.pleaseEnterTrailerUrlOrSwitchToFileUploadMode")
        );
        return;
      }
    }

    const movieData: {
      title: string;
      description: string;
      duration: number;
      genres: string[];
      thumbnail: File;
      trailer?: File;
      trailerPath?: string;
    } = {
      title: values.title,
      description: values.description,
      duration: values.duration,
      genres: values.genres,
      thumbnail: thumbnail?.imageFile as File,
    };

    if (trailerMode === "file" && trailer?.videoFile) {
      movieData.trailer = trailer.videoFile;
    } else if (trailerMode === "url" && values.trailerUrl) {
      movieData.trailerPath = values.trailerUrl;
    }

    createMovie(movieData)
      .then(() => {
        toast.success(t("movies.createMovie.createMovieSuccess"));
        form.reset();
        setThumbnail(null);
        setTrailer(null);
        setTrailerMode("file");
        form.setValue("trailerUrl", "");
        handleClose();
      })
      .catch((error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          t("movies.createMovie.createMovieError");
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/movies");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("movies.createMovie.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="mt-4 flex flex-col gap-6 bg-background px-4 py-4 rounded-lg">
            <p className="text-xl font-bold">
              {t("movies.createMovie.movieInformation")}
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex gap-8 items-start flex-wrap">
                  {/* Trailer Upload/URL */}
                  <FormItem className="flex-2 min-w-64">
                    <FormLabel>
                      {t("movies.createMovie.trailer")}{" "}
                      <span className="text-xs text-red-500">*</span>
                    </FormLabel>
                    <Tabs
                      value={trailerMode}
                      onValueChange={(value) => {
                        setTrailerMode(value as "file" | "url");
                        if (value === "file") {
                          form.setValue("trailerUrl", "");
                          setTrailer(null);
                        } else {
                          form.setValue("trailer", "");
                          setTrailer(null);
                        }
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">
                          {t("movies.createMovie.uploadFile")}
                        </TabsTrigger>
                        <TabsTrigger value="url">
                          {t("movies.createMovie.enterUrl")}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="file" className="mt-3">
                        <FormField
                          control={form.control}
                          name="trailer"
                          render={({ field }) => (
                            <FormItem>
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
                                            {t(
                                              "movies.createMovie.uploadTrailerVideo"
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {t(
                                              "movies.createMovie.uploadTrailerVideoDesc"
                                            )}
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
                                            {t(
                                              "movies.createMovie.clickToChange"
                                            )}
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
                      </TabsContent>
                      <TabsContent value="url" className="mt-3">
                        <FormField
                          control={form.control}
                          name="trailerUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input
                                    placeholder={t(
                                      "movies.createMovie.enterTrailerUrlPlaceholder"
                                    )}
                                    {...field}
                                  />
                                  {field.value && (
                                    <div className="relative aspect-video w-full rounded-lg border border-gray-300 overflow-hidden">
                                      <iframe
                                        src={convertToEmbedUrl(field.value)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </FormItem>

                  {/* Thumbnail Upload */}
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem className="flex-[1] min-w-64">
                        <FormLabel>
                          {t("movies.createMovie.thumbnail")}{" "}
                          <span className="text-xs text-red-500">*</span>
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
                                      {t("movies.createMovie.uploadThumbnail")}
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
                                        {t("movies.createMovie.clickToChange")}
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
                              {t("movies.title")}{" "}
                              <span className="text-xs text-red-500">*</span>
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
                              {t("movies.duration")}{" "}
                              <span className="text-xs text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t(
                                  "movies.createMovie.minutesPlaceholder"
                                )}
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
                              {t("movies.genres")}{" "}
                              <span className="text-xs text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <GenreSelector
                                value={field.value || []}
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "movies.createMovie.selectGenres"
                                )}
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
                            {t("movies.description")}{" "}
                            <span className="text-xs text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t(
                                "movies.createMovie.enterDescriptionPlaceholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-start mt-6">
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/90"
                    onClick={() => {
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    {t("movies.createMovie.createMovie")}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t("movies.createMovie.cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
