import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/components/admin/work-admin";
import { getAdminWorkItemById } from "@/lib/admin";
import { requireAdminUser } from "@/lib/admin-auth";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminWorkDetailPage({ params }: PageProps) {
  await requireAdminUser();
  const { id } = await params;
  const item = await getAdminWorkItemById(id);

  if (!item) {
    notFound();
  }

  return <WorkDetailPage item={item} />;
}
