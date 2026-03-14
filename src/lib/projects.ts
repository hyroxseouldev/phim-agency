import { supabaseUrl } from "@/lib/supabase/config";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  impact: string;
  thumbnail_image_path: string;
  hover_video_path?: string | null;
  client_name?: string | null;
  year?: string | null;
  services?: string[] | null;
};

type ProjectImageRow = {
  id: string;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  impact: string;
  thumbnailImagePath: string;
  thumbnailImageUrl: string;
  hoverVideoPath: string | null;
  hoverVideoUrl: string | null;
};

export type ProjectImage = {
  id: string;
  imagePath: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

export type ProjectDetail = ProjectSummary & {
  clientName: string | null;
  year: string | null;
  services: string[];
  images: ProjectImage[];
};

export function getStoragePublicUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function mapProjectSummary(row: ProjectRow): ProjectSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    impact: row.impact,
    thumbnailImagePath: row.thumbnail_image_path,
    thumbnailImageUrl: getStoragePublicUrl("project-media", row.thumbnail_image_path),
    hoverVideoPath: row.hover_video_path ?? null,
    hoverVideoUrl: row.hover_video_path ? getStoragePublicUrl("project-media", row.hover_video_path) : null,
  };
}

export function mapProjectDetail(row: ProjectRow, images: ProjectImageRow[]): ProjectDetail {
  return {
    ...mapProjectSummary(row),
    clientName: row.client_name ?? null,
    year: row.year ?? null,
    services: row.services ?? [],
    images: images.map((image) => ({
      id: image.id,
      imagePath: image.image_path,
      imageUrl: getStoragePublicUrl("project-media", image.image_path),
      altText: image.alt_text ?? `${row.title} 프로젝트 이미지`,
      sortOrder: image.sort_order,
    })),
  };
}
