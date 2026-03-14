import { supabaseUrl } from "@/lib/supabase/config";

type WorkItemRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  cover_image_path: string;
};

export type WorkItemSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImagePath: string;
  coverImageUrl: string;
};

function getStoragePublicUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/work-media/${path}`;
}

export function mapWorkItemSummary(row: WorkItemRow): WorkItemSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    coverImagePath: row.cover_image_path,
    coverImageUrl: row.cover_image_path ? getStoragePublicUrl(row.cover_image_path) : "",
  };
}
