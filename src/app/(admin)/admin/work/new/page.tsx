import { WorkCreatePage } from "@/components/admin/work-admin";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminWorkCreatePage() {
  await requireAdminUser();

  return <WorkCreatePage />;
}
