import { ProjectsListPage } from "@/components/admin/project-admin";
import { getAdminDashboardData } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminProjectsPage() {
  await requireAdminUser();
  const data = await getAdminDashboardData();

  return <ProjectsListPage projects={data.projects} projectImages={data.projectImages} />;
}
