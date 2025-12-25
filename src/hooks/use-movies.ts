import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllMovies,
  archiveMovie,
  restoreMovie,
  GetMoviesParams,
} from "@/services/movies";

export const movieKeys = {
  all: ["movies"] as const,
  lists: () => [...movieKeys.all, "list"] as const,
  list: (params: GetMoviesParams) => [...movieKeys.lists(), params] as const,
  details: () => [...movieKeys.all, "detail"] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
};

export function useMovies(params: GetMoviesParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: movieKeys.list(params),
    queryFn: () => getAllMovies(params),
    staleTime: 30 * 1000,
  });
}

export function useArchiveMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      toast.success("Lưu trữ phim thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lưu trữ phim thất bại!");
    },
  });
}

export function useRestoreMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      toast.success("Khôi phục phim thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Khôi phục phim thất bại!");
    },
  });
}
