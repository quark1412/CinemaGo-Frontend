import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAllFoodDrinks,
  toggleFoodDrinkAvailability,
  createFoodDrink,
  updateFoodDrink,
  GetFoodDrinksParams,
} from "@/services/fooddrinks";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFoodDrinkAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success("Availability toggled successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to toggle availability"
      );
    },
  });
}

export function useCreateFoodDrink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFoodDrink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success("Food/Drink created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create food/drink"
      );
    },
  });
}

export function useUpdateFoodDrink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateFoodDrink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodDrinkKeys.lists() });
      toast.success("Food/Drink updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update food/drink"
      );
    },
  });
}
