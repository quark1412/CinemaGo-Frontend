import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getAllRooms, archiveRoom, restoreRoom } from "@/services/cinemas";
import { GetRoomsParams } from "@/types/cinema";

export const roomsKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomsKeys.all, "list"] as const,
  list: (params: GetRoomsParams) => [...roomsKeys.lists(), params] as const,
};

export function useRooms(params: GetRoomsParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: roomsKeys.list(params),
    queryFn: () => getAllRooms(params),
    staleTime: 30 * 1000,
  });
}

export function useArchiveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
      toast.success("Room archived successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive room");
    },
  });
}

export function useRestoreRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.lists() });
      toast.success("Room restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore room");
    },
  });
}
