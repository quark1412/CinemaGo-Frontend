import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { roomsKeys } from "@/hooks/use-rooms";
import { getAllRooms } from "@/services/cinemas";
import { AllRooms } from "./all-rooms";

export const metadata = {
  title: "All rooms",
  description: "Room management",
};

export default async function RoomsPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: roomsKeys.list(initialParams),
    queryFn: () => getAllRooms(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllRooms />
    </HydrationBoundary>
  );
}
