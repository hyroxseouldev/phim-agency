import { WorkListPage } from "@/components/admin/work-admin";
import { getAdminWorkItems } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminWorkPage() {
  await requireAdminUser();
  const workItems = await getAdminWorkItems();

  return <WorkListPage workItems={workItems} />;
}
