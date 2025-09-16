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

const formSchema = z.object({
  title: z.string().min(1, {
    error: "Title is required",
  }),
  description: z.string().min(1, {
    error: "Description is required",
  }),
  duration: z.number().min(1),
  releaseDate: z.date(),
  genres: z.array(z.string()),
});

export default function CreateMovie() {
  const [thumbnail, setThumbnail] = useState<{
    imagePath: string;
    imageFile: File | null;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      releaseDate: new Date(),
      genres: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail({
          imagePath: reader.result as string,
          imageFile: file,
        });
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
      <div className="mt-8 flex flex-col gap-4 bg-white px-4 rounded-lg">
        <p className="text-lg font-bold">Movie information</p>
        <div className="flex gap-8 justify-between">
          <Input
            id="dropzone-file"
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <div
            className={`flex h-fit flex-[1] p-5 max-h-80 flex-row flex-wrap items-center justify-center rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50`}
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
                    height={400}
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

          <div className="flex flex-col gap-4 flex-[2]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
