import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/components/admin/project-admin";
import { getAdminProjectById, getAdminProjectImages } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProjectDetailPage({ params }: PageProps) {
  await requireAdminUser();
  const { id } = await params;
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  const images = await getAdminProjectImages(project.id);

  return <ProjectDetailPage project={project} images={images} />;
}
