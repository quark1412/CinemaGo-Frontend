import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllFoodDrinks,
  toggleFoodDrinkAvailability,
  createFoodDrink,
  updateFoodDrink,
  GetFoodDrinksParams,
} from "@/services/fooddrinks";
import { useI18n } from "@/contexts/I18nContext";

export const foodDrinkKeys = {
  all: ["foodDrinks"] as const,
  lists: () => [...foodDrinkKeys.all, "list"] as const,
  list: (params: GetFoodDrinksParams) =>
    [...foodDrinkKeys.lists(), params] as const,
  details: () => [...foodDrinkKeys.all, "detail"] as const,
  detail: (id: string) => [...foodDrinkKeys.details(), id] as const,
};

export function useFoodDrinks(
  params: GetFoodDrinksParams = { page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: foodDrinkKeys.list(params),
    queryFn: () => getAllFoodDrinks(params),
    staleTime: 30 * 1000,
  });
}

export function useToggleFoodDrinkAvailability() {
  const { t } = useI18n();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFoodDrinkAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success(t("foodDrinks.archiveFoodDrink.archiveFoodDrinkSuccess"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t("foodDrinks.archiveFoodDrink.archiveFoodDrinkError")
      );
    },
  });
}

export function useCreateFoodDrink() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFoodDrink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success(t("foodDrinks.createFoodDrink.createFoodDrinkSuccess"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t("foodDrinks.createFoodDrink.createFoodDrinkError")
      );
    },
  });
}

export function useUpdateFoodDrink() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateFoodDrink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success(t("foodDrinks.updateFoodDrink.updateFoodDrinkSuccess"));
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t("foodDrinks.updateFoodDrink.updateFoodDrinkError")
      );
    },
  });
}
