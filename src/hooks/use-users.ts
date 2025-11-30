import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  createUser,
  updateUser,
  archiveUser,
  restoreUser,
  GetUsersParams,
} from "@/services/users";
import { toast } from "sonner";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch Users Hook
export function useUsers(params: GetUsersParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getAllUsers(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Create User Mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User created successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create user";
      toast.error(message);
    },
  });
}

// Update User Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User updated successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update user";
      toast.error(message);
    },
  });
}

// Archive User Mutation
export function useArchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User archived successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to archive user";
      toast.error(message);
    },
  });
}

// Restore User Mutation
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User restored successfully!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to restore user";
      toast.error(message);
    },
  });
}
