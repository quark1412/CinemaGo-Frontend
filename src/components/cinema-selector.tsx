"use client";

import { GenericInfiniteSelect } from "@/components/ui/generic-infinite-select";
import { useInfiniteCinemas } from "@/hooks/use-infinite-cinemas";

// Placeholder type - replace with actual Cinema type when available
interface Cinema {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

interface CinemaSelectorProps {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // Cinema-specific filters
  locationFilter?: string;
}

export function CinemaSelector({
  value = [],
  onValueChange,
  placeholder = "Select cinemas",
  disabled = false,
  className,
  locationFilter,
}: CinemaSelectorProps) {
  const useCinemaHook = () =>
    useInfiniteCinemas({
      initialPageSize: 20,
      initialFilters: {
        ...(locationFilter && { location: locationFilter }),
      },
    });

  const getOptionFromCinema = (cinema: Cinema) => ({
    value: cinema.id,
    label: `${cinema.name} - ${cinema.location}`,
  });

  return (
    <GenericInfiniteSelect<Cinema>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search cinemas..."
      multiple={true}
      disabled={disabled}
      className={className}
      useInfiniteHook={useCinemaHook}
      getOptionFromItem={getOptionFromCinema}
      showSelectedBadges={true}
      badgeClassName="bg-purple-100 text-purple-800"
    />
  );
}
