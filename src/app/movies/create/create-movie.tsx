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
import { ImagePlus, CalendarIcon, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  thumbnail: z.string().min(1, {
    error: "Thumbnail is required",
  }),
  title: z.string().min(1, {
    error: "Title is required",
  }),
  description: z.string().min(1, {
    error: "Description is required",
  }),
  duration: z.number().min(1, {
    error: "Duration must be greater than 0",
  }),
  genres: z.array(z.string()).min(1, {
    error: "At least one genre is required",
  }),
  showtimes: z
    .array(
      z.object({
        roomId: z.string().min(1, "Room is required"),
        date: z.date({ error: "Date is required" }),
        time: z.string().min(1, "Time is required"),
      })
    )
    .min(1, "At least one showtime is required"),
});

const mockGenres = [
  { id: "1", name: "Action" },
  { id: "2", name: "Comedy" },
  { id: "3", name: "Drama" },
  { id: "4", name: "Horror" },
  { id: "5", name: "Romance" },
  { id: "6", name: "Sci-Fi" },
];

const mockRooms = [
  { id: "1", name: "Room 1" },
  { id: "2", name: "Room 2" },
  { id: "3", name: "Room 3" },
  { id: "4", name: "Room 4" },
  { id: "5", name: "Room 5" },
];

export default function CreateMovie() {
  const [thumbnail, setThumbnail] = useState<{
    imagePath: string;
    imageFile: File | null;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thumbnail: "",
      title: "",
      description: "",
      duration: 0,
      genres: [],
      showtimes: [
        {
          roomId: "",
          date: new Date(),
          time: "",
        },
      ],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const addShowtime = () => {
    const currentShowtimes = form.getValues("showtimes");
    form.setValue("showtimes", [
      ...currentShowtimes,
      {
        roomId: "",
        date: new Date(),
        time: "",
      },
    ]);
  };

  const removeShowtime = (index: number) => {
    const currentShowtimes = form.getValues("showtimes");
    if (currentShowtimes.length > 1) {
      form.setValue(
        "showtimes",
        currentShowtimes.filter((_, i) => i !== index)
      );
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
      <div className="mt-8 flex flex-col gap-6 bg-white px-6 py-6 rounded-lg">
        <p className="text-xl font-bold">Movie information</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem className="flex-[1]">
                    <FormLabel>Thumbnail</FormLabel>
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
                          className={`flex h-64 p-5 flex-row flex-wrap items-center justify-center rounded-lg border-2 border-dashed ${
                            form.formState.errors.thumbnail
                              ? "border-red-500"
                              : "border-gray-300"
                          } cursor-pointer hover:bg-gray-50`}
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
                                  width={400}
                                  height={480}
                                  className="rounded-lg object-contain"
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

              <div className="flex-[2] flex flex-col gap-4">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Title</FormLabel>
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
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Minutes"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                        <FormLabel>Genres</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          <Select
                            onValueChange={(value) => {
                              const currentGenres = field.value || [];
                              if (!currentGenres.includes(value)) {
                                field.onChange([...currentGenres, value]);
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select genres" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockGenres.map((genre) => (
                                <SelectItem key={genre.id} value={genre.id}>
                                  {genre.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((genreId) => {
                                const genre = mockGenres.find(
                                  (g) => g.id === genreId
                                );
                                return (
                                  <span
                                    key={genreId}
                                    className="inline-flex items-center gap-1 bg-success/10 text-success text-xs pl-3 pr-2 py-1 rounded-full"
                                  >
                                    {genre?.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== genreId
                                          )
                                        );
                                      }}
                                      className="hover:bg-success/20 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Description</FormLabel>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Showtimes</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addShowtime}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add showtime
                </Button>
              </div>

              {form.watch("showtimes").map((_, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <FormField
                    control={form.control}
                    name={`showtimes.${index}.roomId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Room</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockRooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`showtimes.${index}.date`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`showtimes.${index}.time`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("showtimes").length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeShowtime(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-start mt-10">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
              >
                Add movie
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
