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
      toast.success("Thêm thể loại thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Thêm thể loại thất bại!");
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
      toast.success("Cập nhật thể loại thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật thể loại thất bại!"
      );
    },
  });
}

export function useArchiveGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Lưu trữ thể loại thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Lưu trữ thể loại thất bại!"
      );
    },
  });
}

export function useRestoreGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      toast.success("Khôi phục thể loại thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Khôi phục thể loại thất bại!"
      );
    },
  });
}
