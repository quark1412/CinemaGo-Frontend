import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { reviewKeys } from "@/hooks/use-reviews";
import { getAllReviews } from "@/services/reviews";
import AllReviews from "@/app/(main)/reviews/all-reviews";

export const metadata = {
  title: "All Reviews",
  description: "Review management",
};

export default async function ReviewsPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: reviewKeys.list(initialParams),
    queryFn: () => getAllReviews(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllReviews />
    </HydrationBoundary>
  );
}
