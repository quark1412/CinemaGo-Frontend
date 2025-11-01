"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  Command,
  Film,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  SwatchBook,
  Theater,
  Sofa,
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
import Image from "next/image";
import { PROJECT_NAME } from "@/lib/constants";
import { NavMain } from "@/components/nav-main";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Movies",
      url: "/movies",
      icon: Film,
    },
    {
      title: "Genres",
      url: "/genres",
      icon: SwatchBook,
    },
    {
      title: "Cinemas",
      url: "/cinemas",
      icon: Theater,
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: BookOpen,
    },
    {
      title: "Users",
      url: "/users",
      icon: Bot,
    },
    {
      title: "Food & Drinks",
      url: "/food-drinks",
      icon: UtensilsCrossed,
    },
  ],
};

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser();

  const userData = user
    ? {
        name: user.fullname,
        email: user.email,
        avatar: user.avatarUrl || "/avatars/default.jpg",
      }
    : data.user;

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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});
