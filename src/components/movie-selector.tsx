"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelect } from "@/components/ui/generic-select";
import { getAllMovies } from "@/services/movies";
import { Movie } from "@/types/movie";
import { SelectHookReturn } from "@/components/ui/generic-select";
import { useMemo, useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["movies", genreFilter, ratingFilter],
    queryFn: () =>
      getAllMovies({
        limit: undefined,
        isActive: true,
        ...(genreFilter && { genreQuery: genreFilter }),
        ...(ratingFilter && { rating: ratingFilter }),
      }),
  });

  const filteredMovies = useMemo(() => {
    const movies = data?.data || [];
    if (!searchTerm) return movies;
    const lowerSearch = searchTerm.toLowerCase();
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(lowerSearch)
    );
  }, [data?.data, searchTerm]);

  const useMovieHook = (): SelectHookReturn<Movie> => {
    return {
      items: filteredMovies,
      loading: isLoading,
      search: (term: string) => setSearchTerm(term),
      reset: () => setSearchTerm(""),
    };
  };

  const getOption = (movie: Movie) => ({
    value: movie.id,
    label: movie.title,
  });

  return (
    <GenericSelect<Movie>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search movies..."
      multiple={true}
      disabled={disabled}
      className={className}
      useSelectHook={useMovieHook}
      getOption={getOption}
      showSelectedBadges={true}
      badgeClassName="bg-blue-100 text-blue-800"
    />
  );
}
