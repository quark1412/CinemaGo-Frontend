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
import { useI18n } from "@/contexts/I18nContext";

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
  const { t } = useI18n();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("users.createUser.createUserSuccess"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t("users.createUser.createUserError");
      toast.error(message);
    },
  });
}

// Update User Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("users.updateUser.updateUserSuccess"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t("users.updateUser.updateUserError");
      toast.error(message);
    },
  });
}

// Archive User Mutation
export function useArchiveUser() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: archiveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("users.archiveUser.archiveUserSuccess"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        t("users.archiveUser.archiveUserError");
      toast.error(message);
    },
  });
}

// Restore User Mutation
export function useRestoreUser() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(t("users.restoreUser.restoreUserSuccess"));
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        t("users.restoreUser.restoreUserError");
      toast.error(message);
    },
  });
}
