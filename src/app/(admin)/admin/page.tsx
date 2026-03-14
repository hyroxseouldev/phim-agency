import { AdminOverview } from "@/components/admin/admin-overview";
import { getAdminDashboardSummary } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminPage() {
  await requireAdminUser();
  const summary = await getAdminDashboardSummary();

  return <AdminOverview {...summary} />;
}
