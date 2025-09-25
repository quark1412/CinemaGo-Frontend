"use client";

import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner variant="pinwheel" size={40} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  return <>{children}</>;
}
