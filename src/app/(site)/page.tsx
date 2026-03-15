import { HomePage } from "@/components/site/home-page";
import { mapProjectSummary } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { mapWorkItemSummary } from "@/lib/work-items";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: workItems, error: workError }, { data: projects, error: projectError }] = await Promise.all([
    supabase
      .from("work_items")
      .select("id, slug, title, category, summary, cover_image_path")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("projects")
      .select("id, slug, title, category, summary, description, impact, thumbnail_image_path, hover_video_path, hover_video_crop")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (workError) {
    throw new Error(workError.message);
  }

  if (projectError) {
    throw new Error(projectError.message);
  }

  return <HomePage workItems={(workItems ?? []).map(mapWorkItemSummary)} projects={(projects ?? []).map(mapProjectSummary)} />;
}
