import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
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
  const isInitialLoad = useRef(true);

  const currentParams: PaginationParams = {
    page: currentPage,
    limit: initialPageSize,
    search: searchTerm,
    ...filters,
  };

  const fetchItems = useCallback(
    async (params: PaginationParams, append = false) => {
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
    [fetchFn, initialPageSize, filters, errorMessage]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    // Call fetchItems directly without including it in dependencies
    fetchItems({ page: nextPage, search: searchTerm, ...filters }, true);
  }, [hasMore, loading, currentPage, searchTerm, filters]);

  const search = useCallback(
    (newSearchTerm: string) => {
      setSearchTerm(newSearchTerm);
      setCurrentPage(1);
      setItems([]);
      setHasMore(true);

      fetchItems({ page: 1, search: newSearchTerm, ...filters }, false);
    },
    [filters]
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
    [defaultFilters, searchTerm]
  );

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setSearchTerm("");
    setFiltersState(defaultFilters);
    setHasMore(true);
    fetchItems({ page: 1, search: "", ...defaultFilters }, false);
  }, [defaultFilters]);

  // Initial load effect - only run once on mount
  useEffect(() => {
    if (!isInitialLoad.current) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetchFn({
          page: 1,
          limit: initialPageSize,
          search: "",
          ...defaultFilters,
        });

        setItems(response.data);
        setTotalPages(response.pagination.totalPages);
        setHasMore(response.pagination.hasNextPage);
        isInitialLoad.current = false;
      } catch (error: any) {
        toast.error(errorMessage);
        console.error("Error fetching data:", error);
        isInitialLoad.current = false;
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchFn, initialPageSize, errorMessage, defaultFilters]);

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
