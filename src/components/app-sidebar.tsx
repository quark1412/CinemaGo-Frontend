"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Film,
  LayoutDashboard,
  PieChart,
  SwatchBook,
  Theater,
  UtensilsCrossed,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { PROJECT_NAME } from "@/lib/constants";
import { NavMain } from "@/components/nav-main";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { usePathname } from "next/navigation";

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser();
  const { t } = useI18n();
  const pathname = usePathname();

  const userData = user
    ? {
        name: user.fullname,
        email: user.email,
        avatar: user.avatarUrl || "/avatars/default.jpg",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      };

  const navMain = [
    {
      title: t("sidebar.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("sidebar.movies"),
      url: "/movies",
      icon: Film,
    },
    {
      title: t("sidebar.genres"),
      url: "/genres",
      icon: SwatchBook,
    },
    {
      title: t("sidebar.cinemas"),
      url: "/cinemas",
      icon: Theater,
    },
    {
      title: t("sidebar.reviews"),
      url: "/reviews",
      icon: BookOpen,
    },
    {
      title: t("sidebar.users"),
      url: "/users",
      icon: Bot,
    },
    {
      title: t("sidebar.foodDrinks"),
      url: "/food-drinks",
      icon: UtensilsCrossed,
    },
    {
      title: t("sidebar.report"),
      url: "/report",
      icon: PieChart,
    },
  ].map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(`${item.url}/`),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:cursor-pointer"
            >
              <Link href="/" className="h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center shrink-0 justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm transform rotate-45 shrink-0"></div>
                </div>
                <p className="font-extrabold text-xl">{PROJECT_NAME}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 mb-2">
          <LanguageSwitcher />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});
