import { ProjectCreatePage } from "@/components/admin/project-admin";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminProjectsCreatePage() {
  await requireAdminUser();

  return <ProjectCreatePage />;
}
