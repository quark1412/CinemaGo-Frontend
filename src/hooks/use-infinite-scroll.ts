import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any; // Allow additional filter parameters
}

export interface PaginationResponse<T> {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: T[];
}

export interface InfiniteScrollConfig<T> {
  fetchFn: (params: PaginationParams) => Promise<PaginationResponse<T>>;
  initialPageSize?: number;
  defaultFilters?: Record<string, any>;
  errorMessage?: string;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  search: (searchTerm: string) => void;
  reset: () => void;
  setFilters: (filters: Record<string, any>) => void;
  currentParams: PaginationParams;
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialPageSize = 20,
  defaultFilters = {},
  errorMessage = "Failed to fetch data",
}: InfiniteScrollConfig<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFiltersState] = useState(defaultFilters);
  const [totalPages, setTotalPages] = useState(0);

  const currentParams: PaginationParams = {
    page: currentPage,
    limit: initialPageSize,
    search: searchTerm,
    ...filters,
  };

  const fetchItems = useCallback(
    async (params: PaginationParams, append = false) => {
      if (loading) return;

      try {
        setLoading(true);
        const response = await fetchFn({
          ...params,
          limit: initialPageSize,
          ...filters,
        });

        if (append) {
          setItems((prev) => [...prev, ...response.data]);
        } else {
          setItems(response.data);
        }

        setTotalPages(response.pagination.totalPages);
        setHasMore(response.pagination.hasNextPage);
      } catch (error: any) {
        toast.error(errorMessage);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, initialPageSize, filters, loading, errorMessage]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchItems({ page: nextPage, search: searchTerm, ...filters }, true);
  }, [hasMore, loading, currentPage, searchTerm, filters, fetchItems]);

  const search = useCallback(
    (newSearchTerm: string) => {
      setSearchTerm(newSearchTerm);
      setCurrentPage(1);
      setItems([]);
      setHasMore(true);

      fetchItems({ page: 1, search: newSearchTerm, ...filters }, false);
    },
    [filters, fetchItems]
  );

  const setFilters = useCallback(
    (newFilters: Record<string, any>) => {
      setFiltersState({ ...defaultFilters, ...newFilters });
      setCurrentPage(1);
      setItems([]);
      setHasMore(true);

      fetchItems(
        { page: 1, search: searchTerm, ...defaultFilters, ...newFilters },
        false
      );
    },
    [defaultFilters, searchTerm, fetchItems]
  );

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setSearchTerm("");
    setFiltersState(defaultFilters);
    setHasMore(true);
    fetchItems({ page: 1, search: "", ...defaultFilters }, false);
  }, [defaultFilters, fetchItems]);

  useEffect(() => {
    fetchItems({ page: 1, search: "", ...defaultFilters }, false);
  }, [fetchItems]);

  useEffect(() => {
    if (!hasMore && loading) {
      setLoading(false);
    }
  }, [hasMore, loading]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    search,
    reset,
    setFilters,
    currentParams,
  };
}
