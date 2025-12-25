import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { movieKeys } from "@/hooks/use-movies";
import { getAllMovies } from "@/services/movies";
import AllMovies from "@/app/(main)/movies/all-movies";

export const metadata = {
  title: "All movies",
  description: "Movie management",
};

export default async function MoviePage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: movieKeys.list(initialParams),
    queryFn: () => getAllMovies(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllMovies />
    </HydrationBoundary>
  );
}
