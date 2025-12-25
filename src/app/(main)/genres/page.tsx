import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { genreKeys } from "@/hooks/use-genres";
import { getAllGenres } from "@/services/genres";
import AllGenres from "@/app/(main)/genres/all-genres";

export const metadata = {
  title: "All genres",
  description: "Genre management",
};

export default async function GenresPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: genreKeys.list(initialParams),
    queryFn: () => getAllGenres(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllGenres />
    </HydrationBoundary>
  );
}
