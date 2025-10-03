import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllGenres,
  createGenre,
  updateGenre,
  archiveGenre,
  restoreGenre,
  GetGenresParams,
} from "@/services/genres";

export const genreKeys = {
  all: ["genres"] as const,
  lists: () => [...genreKeys.all, "list"] as const,
  list: (params: GetGenresParams) => [...genreKeys.lists(), params] as const,
  details: () => [...genreKeys.all, "detail"] as const,
  detail: (id: string) => [...genreKeys.details(), id] as const,
};

export function useGenres(params: GetGenresParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: genreKeys.list(params),
    queryFn: () => getAllGenres(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Genre created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create genre");
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateGenre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Genre updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update genre");
    },
  });
}

export function useArchiveGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Genre archived successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive genre");
    },
  });
}

export function useRestoreGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Genre restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore genre");
    },
  });
}
