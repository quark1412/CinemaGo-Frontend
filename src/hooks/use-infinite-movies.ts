import { getAllMovies } from "@/services/movies";
import { Movie } from "@/types/movie";
import { useInfiniteScroll } from "./use-infinite-scroll";

interface UseInfiniteMoviesReturn {
  movies: Movie[];
  items: Movie[]; // Required for generic interface compatibility
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  search: (searchTerm: string) => void;
  reset: () => void;
  setFilters: (filters: Record<string, any>) => void;
}

interface UseInfiniteMoviesOptions {
  initialPageSize?: number;
  initialFilters?: {
    rating?: number;
    genreQuery?: string;
    isActive?: boolean;
  };
}

export function useInfiniteMovies({
  initialPageSize = 20,
  initialFilters = {},
}: UseInfiniteMoviesOptions = {}): UseInfiniteMoviesReturn {
  const {
    items: movies,
    loading,
    hasMore,
    loadMore,
    search,
    reset,
    setFilters,
  } = useInfiniteScroll<Movie>({
    fetchFn: getAllMovies,
    initialPageSize,
    defaultFilters: { isActive: true, ...initialFilters },
    errorMessage: "Failed to fetch movies",
  });

  return {
    movies,
    items: movies, // Alias for generic interface compatibility
    loading,
    hasMore,
    loadMore,
    search,
    reset,
    setFilters,
  };
}
