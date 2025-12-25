"use client";

import { useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { getMovieById } from "@/services/movies";
import { toast } from "sonner";
import {
  formatTime,
  formatDate,
  convertToEmbedUrl,
  isVideoPlatformUrl,
  formatDuration,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/contexts/I18nContext";
import { Loader2, Star, Calendar, Clock, Tag } from "lucide-react";
import Image from "next/image";

interface MovieDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId: string | null;
}

export function MovieDetailsDialog({
  open,
  onOpenChange,
  movieId,
}: MovieDetailsDialogProps) {
  const { t } = useI18n();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && movieId) {
      fetchMovieDetails();
    }
  }, [open, movieId]);

  const fetchMovieDetails = async () => {
    if (!movieId) return;

    try {
      setLoading(true);
      const response = await getMovieById(movieId);
      setMovie(response.data);
    } catch (error: any) {
      toast.error(t("movies.details.fetchError"));
      console.log("Error fetching movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMovie(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="[&>button:last-child]:hidden min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-2">
          <DialogTitle className="text-2xl font-bold text-center">
            {movie?.title}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t("movies.details.loading")}</span>
          </div>
        ) : movie ? (
          <div className="space-y-8">
            {/* Header with Title and Basic Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {movie.rating || t("movies.details.notRatedYet")}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={movie.isActive ? "default" : "secondary"}>
                  {movie.isActive
                    ? t("movies.filterMovies.active")
                    : t("movies.filterMovies.archived")}
                </Badge>
              </div>

              {/* Genres */}
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Thumbnail */}
              <div className="space-y-3">
                <div className="relative aspect-[2/3] w-full max-w-xs mx-auto">
                  <Image
                    src={movie.thumbnail}
                    alt={`${movie.title} thumbnail`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Trailer */}
              <div className="space-y-3">
                <div className="relative aspect-video w-full h-full">
                  {movie.trailerUrl && isVideoPlatformUrl(movie.trailerUrl) ? (
                    <iframe
                      src={convertToEmbedUrl(movie.trailerUrl)}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={movie.trailerUrl}
                      controls
                      className="w-full h-full rounded-lg object-cover"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                {t("movies.description")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleClose}>{t("common.close")}</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t("movies.details.noData")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
