import { useState, useEffect, useCallback } from "react";
import { Cinema } from "@/types/cinema";
import { getAllCinemas } from "@/services/cinemas";
import { InfiniteSelectHookReturn } from "@/components/ui/generic-infinite-select";

export function useInfiniteCinemas(
  initialLimit: number = 20
): InfiniteSelectHookReturn<Cinema> {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadCinemas = useCallback(
    async (pageNum: number, search: string = "", reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const response = await getAllCinemas({
          page: pageNum,
          limit: initialLimit,
          search: search.trim() || undefined,
          isActive: filters.isActive,
          ...filters,
        });

        const newCinemas = response.data;

        if (reset) {
          setCinemas(newCinemas);
        } else {
          setCinemas((prev) => [...prev, ...newCinemas]);
        }

        setHasMore(response.pagination.hasNextPage);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading cinemas:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [loading, initialLimit, filters]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadCinemas(page + 1, searchTerm);
    }
  }, [loading, hasMore, page, searchTerm, loadCinemas]);

  const search = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setPage(1);
      setHasMore(true);
      loadCinemas(1, term, true);
    },
    [loadCinemas]
  );

  const reset = useCallback(() => {
    setSearchTerm("");
    setPage(1);
    setHasMore(true);
    setCinemas([]);
    loadCinemas(1, "", true);
  }, [loadCinemas]);

  const updateFilters = useCallback(
    (newFilters: Record<string, any>) => {
      setFilters(newFilters);
      setPage(1);
      setHasMore(true);
      loadCinemas(1, searchTerm, true);
    },
    [loadCinemas, searchTerm]
  );

  useEffect(() => {
    loadCinemas(1, "", true);
  }, []);

  return {
    items: cinemas,
    loading,
    hasMore,
    loadMore,
    search,
    reset,
    setFilters: updateFilters,
  };
}
