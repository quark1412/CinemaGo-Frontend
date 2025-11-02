"use client";

import { useNavigationLoading } from "@/hooks/use-navigation-loading";
import { MainContentLoader } from "./main-content-loader";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const isLoading = useNavigationLoading();

  if (isLoading) {
    return <MainContentLoader />;
  }

  return <>{children}</>;
}
