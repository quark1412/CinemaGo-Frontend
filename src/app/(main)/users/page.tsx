import AllUsers from "@/app/(main)/users/all-users";
import {
  getQueryClient,
  dehydrate,
  HydrationBoundary,
} from "@/lib/server-query-client";
import { getAllUsers } from "@/services/users/users";
import { userKeys } from "@/hooks/use-users";

export const metadata = {
  title: "All users",
  description: "User management",
};

export default async function UsersPage() {
  const queryClient = getQueryClient();

  // Prefetch users data on the server
  await queryClient.prefetchQuery({
    queryKey: userKeys.list({ page: 1, limit: 10 }),
    queryFn: () => getAllUsers({ page: 1, limit: 10 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllUsers />
    </HydrationBoundary>
  );
}
