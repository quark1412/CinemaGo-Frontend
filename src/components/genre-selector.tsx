"use client";

import { GenericInfiniteSelect } from "@/components/ui/generic-infinite-select";
import { useInfiniteGenres } from "@/hooks/use-infinite-genres";
import { Genre } from "@/types/genre";

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
  const useGenreHook = () => useInfiniteGenres(20);

  const getOptionFromGenre = (genre: Genre) => ({
    value: genre.id,
    label: genre.name,
  });

  return (
    <GenericInfiniteSelect<Genre>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      multiple={true}
      disabled={disabled}
      className={className}
      useInfiniteHook={useGenreHook}
      getOptionFromItem={getOptionFromGenre}
      showSelectedBadges={true}
      badgeClassName="bg-success/10 text-success"
      showSearch={false}
    />
  );
}
