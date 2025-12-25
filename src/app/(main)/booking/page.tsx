import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/server-query-client";
import { bookingKeys } from "@/hooks/use-bookings";
import { getAllBookings } from "@/services/booking";
import AllBookings from "./all-booking";

export const metadata = {
  title: "All bookings",
  description: "Booking management",
};

export default async function BookingPage() {
  const queryClient = getQueryClient();
  const initialParams = { page: 1, limit: 10 };

  await queryClient.prefetchQuery({
    queryKey: bookingKeys.list(initialParams),
    queryFn: () => getAllBookings(initialParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllBookings />
    </HydrationBoundary>
  );
}
