import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getAllBookings, getBookingById } from "@/services/booking";
import { MyBookingParams } from "@/types/booking";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: MyBookingParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export function useBookings(params: MyBookingParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => getAllBookings(params),
    staleTime: 30 * 1000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
    retry: 1,
  });
}
