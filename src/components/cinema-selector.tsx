"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelect } from "@/components/ui/generic-select";
import { getAllCinemas } from "@/services/cinemas";
import { Cinema } from "@/types/cinema";
import { SelectHookReturn } from "@/components/ui/generic-select";
import { useMemo, useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cinemas"],
    queryFn: () =>
      getAllCinemas({
        limit: undefined,
        isActive: true,
      }),
  });

  const filteredCinemas = useMemo(() => {
    const cinemas = data?.data || [];
    if (!searchTerm) return cinemas;
    const lowerSearch = searchTerm.toLowerCase();
    return cinemas.filter(
      (cinema) =>
        cinema.name.toLowerCase().includes(lowerSearch) ||
        cinema.city.toLowerCase().includes(lowerSearch)
    );
  }, [data?.data, searchTerm]);

  const useCinemaHook = (): SelectHookReturn<Cinema> => {
    return {
      items: filteredCinemas,
      loading: isLoading,
      search: (term: string) => setSearchTerm(term),
      reset: () => setSearchTerm(""),
    };
  };

  const getOption = (cinema: Cinema) => ({
    value: cinema.id,
    label: `${cinema.name} - ${cinema.city}`,
  });

  return (
    <GenericSelect<Cinema>
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      multiple={multiple}
      disabled={disabled}
      className={className}
      useSelectHook={useCinemaHook}
      getOption={getOption}
      showSelectedBadges={multiple}
      badgeClassName="bg-blue-50 text-blue-700"
      showSearch={false}
    />
  );
}
