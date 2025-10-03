import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { cache } from "react";

// Create a cache function for the query client to ensure it's only created once per request
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000, // 1 minute
        },
      },
    })
);

export { dehydrate, HydrationBoundary };
