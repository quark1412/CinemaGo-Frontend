import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllCinemas,
  createCinema,
  updateCinema,
  archiveCinema,
  restoreCinema,
} from "@/services/cinemas";
import { GetCinemasParams } from "@/types/cinema";

export const cinemaKeys = {
  all: ["cinemas"] as const,
  lists: () => [...cinemaKeys.all, "list"] as const,
  list: (params: GetCinemasParams) => [...cinemaKeys.lists(), params] as const,
  details: () => [...cinemaKeys.all, "detail"] as const,
  detail: (id: string) => [...cinemaKeys.details(), id] as const,
};

export function useCinemas(params: GetCinemasParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: cinemaKeys.list(params),
    queryFn: () => getAllCinemas(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateCinema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCinema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      toast.success("Cinema created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create cinema");
    },
  });
}

export function useUpdateCinema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCinema(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      toast.success("Cinema updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update cinema");
    },
  });
}

export function useArchiveCinema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveCinema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      toast.success("Cinema archived successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive cinema");
    },
  });
}

export function useRestoreCinema() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreCinema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      toast.success("Cinema restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore cinema");
    },
  });
}
