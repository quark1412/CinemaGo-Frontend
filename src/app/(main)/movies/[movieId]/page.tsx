"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Star,
  Tag,
  Plus,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Movie } from "@/types/movie";
import { Showtime } from "@/types/showtime";
import { getMovieById } from "@/services/movies";
import { getShowtimes, GetShowtimesParams } from "@/services/showtimes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTime, formatDate } from "@/lib/utils";
import { ShowtimesDataTable } from "./showtimes-data-table";
import { ShowtimeDialog } from "./showtime-dialog";

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.movieId as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [showtimeDialogOpen, setShowtimeDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<
    Showtime | undefined
  >();

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
      fetchShowtimes();
    }
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await getMovieById(movieId);
      setMovie(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch movie details");
      console.error("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      setShowtimesLoading(true);
      const response = await getShowtimes({ movieId, limit: 100 });
      setShowtimes(response.data);
    } catch (error: any) {
      toast.error("Failed to fetch showtimes");
      console.error("Error fetching showtimes:", error);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowtimeDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowtimeDialogOpen(open);
    if (!open) {
      setEditingShowtime(undefined);
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
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/movies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{movie.title}</h1>
        </div>
      </div>

      {/* Movie Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Movie Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(movie.duration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating || "Not rated yet"}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trailer */}
          <Card>
            <CardHeader>
              <CardTitle>Trailer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full">
                <video
                  src={movie.trailerUrl}
                  controls
                  className="w-full h-full rounded-lg object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movie Poster */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.thumbnail}
                  alt={`${movie.title} thumbnail`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(movie.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(movie.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Showtimes Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Showtimes Management</CardTitle>
            <Button onClick={() => setShowtimeDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Showtime
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showtimesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading showtimes...</span>
            </div>
          ) : (
            <ShowtimesDataTable
              data={showtimes}
              onRefresh={fetchShowtimes}
              onEdit={handleEditShowtime}
            />
          )}
        </CardContent>
      </Card>

      {/* Showtime Dialog */}
      <ShowtimeDialog
        open={showtimeDialogOpen}
        onOpenChange={handleCloseDialog}
        movieId={movieId}
        movie={movie}
        showtime={editingShowtime}
        onSuccess={fetchShowtimes}
      />
    </div>
  );
}
