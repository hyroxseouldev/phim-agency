import { LogOut } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboardSummary } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";
import { signOutAction } from "@/app/login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminUser();
  const sidebarSummary = await getAdminDashboardSummary();

  return (
    <AdminShell
      userEmail={user.email ?? "admin@phim.agency"}
      sidebarSummary={sidebarSummary}
      logoutForm={
        <form key="logout-form" action={signOutAction}>
          <Button
            type="submit"
            variant="secondary"
            className="h-10 w-full justify-start rounded-2xl border-0 bg-white/10 text-sidebar-foreground hover:bg-white/16 hover:text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0"
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">로그아웃</span>
          </Button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
