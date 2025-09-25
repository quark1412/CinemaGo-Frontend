"use client";

import { GenericInfiniteSelect } from "@/components/ui/generic-infinite-select";
import { useInfiniteMovies } from "@/hooks/use-infinite-movies";
import { Movie } from "@/types/movie";

interface MovieSelectorProps {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Movie-specific filters
  genreFilter?: string;
  ratingFilter?: number;
}

export function MovieSelector({
  value = [],
  onValueChange,
  placeholder = "Select movies",
  disabled = false,
  className,
  genreFilter,
  ratingFilter,
}: MovieSelectorProps) {
  const useMovieHook = () =>
    useInfiniteMovies({
      initialPageSize: 20,
      initialFilters: {
        ...(genreFilter && { genreQuery: genreFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
      },
    });

  const getOptionFromMovie = (movie: Movie) => ({
    value: movie.id,
    label: movie.title,
  });

  return (
    <GenericInfiniteSelect<Movie>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search movies..."
      multiple={true}
      disabled={disabled}
      className={className}
      useInfiniteHook={useMovieHook}
      getOptionFromItem={getOptionFromMovie}
      showSelectedBadges={true}
      badgeClassName="bg-blue-100 text-blue-800"
    />
  );
}
