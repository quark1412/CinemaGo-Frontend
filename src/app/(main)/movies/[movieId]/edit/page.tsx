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
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getMovieById, updateMovie } from "@/services/movies";
import { GenreSelector } from "@/components/genre-selector";
import { Movie } from "@/types/movie";
import { Genre } from "@/types/genre";
import { convertToEmbedUrl } from "@/lib/utils";

const formSchema = z.object({
  thumbnail: z.string().optional(),
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

export default function EditMoviePage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.movieId as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const response = await getMovieById(movieId);
      const movieData = response.data;
      setMovie(movieData);

      const isTrailerUrl =
        movieData.trailerUrl &&
        (movieData.trailerUrl.startsWith("http") ||
          movieData.trailerUrl.startsWith("<iframe"));

      form.reset({
        thumbnail: movieData.thumbnail,
        title: movieData.title,
        description: movieData.description,
        duration: movieData.duration,
        genres: movieData.genres.map((g: Genre) => g.id),
        trailer: isTrailerUrl ? "" : movieData.trailerUrl,
        trailerUrl: isTrailerUrl ? movieData.trailerUrl : "",
      });

      setThumbnail({
        imagePath: movieData.thumbnail,
        imageFile: null,
      });

      if (isTrailerUrl) {
        setTrailerMode("url");
        setTrailer(null);
      } else {
        setTrailerMode("file");
        setTrailer({
          videoPath: movieData.trailerUrl,
          videoFile: null,
        });
      }
    } catch (error: any) {
      toast.error("Failed to fetch movie details");
      console.error("Error fetching movie:", error);
      router.push("/movies");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!movie) return;

    if (trailerMode === "file") {
      if (!trailer?.videoFile && !trailer?.videoPath) {
        toast.error("Please upload a trailer file or switch to URL mode");
        return;
      }
    } else {
      if (!values.trailerUrl) {
        toast.error("Please enter a trailer URL or switch to file upload mode");
        return;
      }
    }

    try {
      setSubmitting(true);

      const updateData: {
        title: string;
        description: string;
        duration: number;
        releaseDate: string;
        genresIds: string;
        thumbnail?: File;
        trailer?: File;
        trailerPath?: string;
      } = {
        title: values.title,
        description: values.description,
        duration: values.duration,
        releaseDate:
          movie.releaseDate instanceof Date
            ? movie.releaseDate.toISOString()
            : new Date(movie.releaseDate).toISOString(),
        genresIds: values.genres.join(","),
        thumbnail: thumbnail?.imageFile || undefined,
      };

      if (trailerMode === "file" && trailer?.videoFile) {
        updateData.trailer = trailer.videoFile;
      } else if (trailerMode === "url" && values.trailerUrl) {
        updateData.trailerPath = values.trailerUrl;
      }

      await updateMovie(movieId, updateData);
      toast.success("Movie updated successfully");
      router.push(`/movies/${movieId}`);
    } catch (error: any) {
      console.error("Update movie error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update movie";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading movie details...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Movie not found.</p>
        <Link href="/movies">
          <Button className="mt-4">Back to Movies</Button>
        </Link>
      </div>
    );
  }

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
            <BreadcrumbLink asChild>
              <Link href={`/movies/${movieId}`}>{movie.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit movie</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-8 flex flex-col gap-6 bg-background px-6 py-6 rounded-lg">
        <p className="text-xl font-bold">Movie information</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-8 items-start flex-wrap">
              {/* Trailer Upload/URL */}
              <FormItem className="flex-2 min-w-64">
                <FormLabel>
                  Trailer{" "}
                  <span className="text-xs text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <Tabs
                  value={trailerMode}
                  onValueChange={(value) => {
                    setTrailerMode(value as "file" | "url");
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                    <TabsTrigger value="url">Enter URL</TabsTrigger>
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
                                          {trailer.videoFile?.name ||
                                            "Current trailer"}
                                        </p>
                                        {trailer.videoFile && (
                                          <p className="text-xs text-gray-500">
                                            {`${(
                                              trailer.videoFile.size /
                                              (1024 * 1024)
                                            ).toFixed(2)} MB`}
                                          </p>
                                        )}
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
                                placeholder="Enter trailer URL (e.g., YouTube embed URL, Vimeo URL, etc.)"
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
                      Thumbnail{" "}
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update movie"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/movies/${movieId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
