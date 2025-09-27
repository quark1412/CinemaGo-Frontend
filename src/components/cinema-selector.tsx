"use client";

import { GenericInfiniteSelect } from "@/components/ui/generic-infinite-select";
import { useInfiniteCinemas } from "@/hooks/use-infinite-cinemas";
import { Cinema } from "@/types/cinema";

interface CinemaSelectorProps {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
}

export function CinemaSelector({
  value = [],
  onValueChange,
  placeholder = "Select cinema",
  disabled = false,
  className,
  multiple = false,
}: CinemaSelectorProps) {
  const useCinemaHook = () => useInfiniteCinemas(20);

  const getOptionFromCinema = (cinema: Cinema) => ({
    value: cinema.id,
    label: `${cinema.name} - ${cinema.city}`,
  });

  return (
    <GenericInfiniteSelect<Cinema>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      multiple={multiple}
      disabled={disabled}
      className={className}
      useInfiniteHook={useCinemaHook}
      getOptionFromItem={getOptionFromCinema}
      showSelectedBadges={multiple}
      badgeClassName="bg-blue-50 text-blue-700"
      showSearch={false}
    />
  );
}
