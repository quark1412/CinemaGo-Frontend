import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { cinemaKeys } from "@/hooks/use-cinemas";
import { getAllCinemas } from "@/services/cinemas";
import AllCinemas from "@/app/(main)/cinemas/all-cinemas";

export const metadata = {
  title: "All cinemas",
  description: "Cinema management",
};

export default async function CinemasPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: cinemaKeys.list(initialParams),
    queryFn: () => getAllCinemas(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllCinemas />
    </HydrationBoundary>
  );
}
