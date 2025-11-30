"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelect } from "@/components/ui/generic-select";
import { getAllGenres } from "@/services/genres";
import { Genre } from "@/types/genre";
import { SelectHookReturn } from "@/components/ui/generic-select";
import { useMemo, useState } from "react";

interface GenreSelectorProps {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GenreSelector({
  value = [],
  onValueChange,
  placeholder = "Select genres",
  disabled = false,
  className,
}: GenreSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: () =>
      getAllGenres({
        limit: undefined,
        isActive: true,
      }),
  });

  const filteredGenres = useMemo(() => {
    const genres = data?.data || [];
    if (!searchTerm) return genres;
    const lowerSearch = searchTerm.toLowerCase();
    return genres.filter((genre) =>
      genre.name.toLowerCase().includes(lowerSearch)
    );
  }, [data?.data, searchTerm]);

  const useGenreHook = (): SelectHookReturn<Genre> => {
    return {
      items: filteredGenres,
      loading: isLoading,
      search: (term: string) => setSearchTerm(term),
      reset: () => setSearchTerm(""),
    };
  };

  const getOption = (genre: Genre) => ({
    value: genre.id,
    label: genre.name,
  });

  return (
    <GenericSelect<Genre>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      multiple={true}
      disabled={disabled}
      className={className}
      useSelectHook={useGenreHook}
      getOption={getOption}
      showSelectedBadges={true}
      badgeClassName="bg-success/10 text-success"
      showSearch={false}
    />
  );
}
