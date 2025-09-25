import { getAllGenres } from "@/services/genres";
import { Genre } from "@/types/genre";
import { useInfiniteScroll } from "./use-infinite-scroll";

interface UseInfiniteGenresReturn {
  genres: Genre[];
  items: Genre[]; // Alias for genres to match generic interface
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  search: (searchTerm: string) => void;
  reset: () => void;
}

export function useInfiniteGenres(
  initialPageSize: number = 20
): UseInfiniteGenresReturn {
  const {
    items: genres,
    loading,
    hasMore,
    loadMore,
    search,
    reset,
  } = useInfiniteScroll<Genre>({
    fetchFn: getAllGenres,
    initialPageSize,
    defaultFilters: { isActive: true }, // Only fetch active genres
    errorMessage: "Failed to fetch genres",
  });

  return {
    genres,
    items: genres, // Alias for genres to match generic interface
    loading,
    hasMore,
    loadMore,
    search,
    reset,
  };
}
