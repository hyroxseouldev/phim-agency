"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, Layers3, Plus, Sparkles } from "lucide-react";
import type { ProjectAdmin, WorkItemAdmin } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function getPageLabel(pathname: string) {
  if (pathname.startsWith("/admin/projects")) {
    return "Projects";
  }

  if (pathname.startsWith("/admin/work")) {
    return "Work";
  }

  if (pathname === "/admin") {
    return "Dashboard";
  }

  return "Admin";
}

export function AdminShell({
  userEmail,
  sidebarSummary,
  children,
  logoutForm,
}: {
  userEmail: string;
  sidebarSummary: {
    workCount: number;
    projectCount: number;
    recentWorkItems: WorkItemAdmin[];
    recentProjects: ProjectAdmin[];
  };
  children: React.ReactNode;
  logoutForm: React.ReactNode;
}) {
  const pathname = usePathname();
  const navigationItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      matcher: (currentPathname: string) => currentPathname === "/admin",
    },
    {
      href: "/admin/work",
      label: "Work",
      icon: Layers3,
      count: sidebarSummary.workCount,
      matcher: (currentPathname: string) => currentPathname.startsWith("/admin/work"),
    },
    {
      href: "/admin/projects",
      label: "Projects",
      icon: FolderKanban,
      count: sidebarSummary.projectCount,
      matcher: (currentPathname: string) => currentPathname.startsWith("/admin/projects"),
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(199,143,98,0.18),transparent_24%),linear-gradient(180deg,#f6f0e8_0%,#f3eee7_44%,#f8f5f1_100%)]">
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarHeader className="gap-4 px-4 py-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3 text-sidebar-foreground">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/14">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/70">PHIM Admin</p>
                <p className="truncate text-sm font-medium text-sidebar-foreground">{userEmail}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.matcher(pathname);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn(isActive ? "bg-white/12 text-sidebar-foreground" : undefined)}>
                          <Link href={item.href}>
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                        {typeof item.count === "number" ? <SidebarMenuBadge>{item.count}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Create</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="새 Work 생성" className="bg-white/6">
                      <Link href="/admin/work/new">
                        <Plus className="size-4" />
                        <span>새 Work</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="새 프로젝트 생성" className="bg-white/6">
                      <Link href="/admin/projects/new">
                        <Plus className="size-4" />
                        <span>새 Project</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="pointer-events-none bg-transparent hover:bg-transparent">
                      <Layers3 className="size-4" />
                      <span>최근 Work</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {sidebarSummary.recentWorkItems.length > 0 ? (
                        sidebarSummary.recentWorkItems.slice(0, 3).map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton asChild isActive={pathname === `/admin/work/${item.id}`}>
                              <Link href={`/admin/work/${item.id}`}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      ) : (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <span>항목 없음</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="pointer-events-none bg-transparent hover:bg-transparent">
                      <FolderKanban className="size-4" />
                      <span>최근 Projects</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {sidebarSummary.recentProjects.length > 0 ? (
                        sidebarSummary.recentProjects.slice(0, 3).map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton asChild isActive={pathname === `/admin/projects/${item.id}`}>
                              <Link href={`/admin/projects/${item.id}`}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      ) : (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <span>항목 없음</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="gap-3 px-4 py-4">
            <Button asChild variant="secondary" className="w-full justify-start rounded-2xl border-0 bg-white/10 text-sidebar-foreground hover:bg-white/16 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              <Link href="/">사이트 보기</Link>
            </Button>
            {logoutForm}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <div className="flex min-h-screen flex-col px-4 py-5 pb-10 lg:px-6">
            <header className="sticky top-4 z-20 mb-6 flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_20px_50px_rgba(10,29,35,0.08)] backdrop-blur">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="rounded-full border border-[#10232b]/10 bg-white/80" />
                <div className="min-w-0">
                  <Badge variant="outline" className="mb-1 w-fit rounded-full border-[#143a46]/10 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
                    Admin
                  </Badge>
                  <p className="truncate text-sm font-semibold text-[#10232b] sm:text-base">{getPageLabel(pathname)}</p>
                </div>
              </div>
            </header>

            <div className="mx-auto w-full max-w-7xl flex-1">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
