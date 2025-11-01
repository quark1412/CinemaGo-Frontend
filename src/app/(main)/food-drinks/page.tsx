import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { foodDrinkKeys } from "@/hooks/use-fooddrinks";
import { getAllFoodDrinks } from "@/services/fooddrinks";
import AllFoodDrinks from "@/app/(main)/food-drinks/all-fooddrinks";

export const metadata = {
  title: "Food & Drinks",
  description: "Food and drink management",
};

export default async function FoodDrinksPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: foodDrinkKeys.list(initialParams),
    queryFn: () => getAllFoodDrinks(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllFoodDrinks />
    </HydrationBoundary>
  );
}
