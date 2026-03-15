import "server-only";

import { type MediaCrop, isMediaCrop } from "@/lib/media-crop";
import { getStoragePublicUrl } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

export type WorkItemAdmin = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  cover_image_path: string;
  sort_order: number;
  is_active: boolean;
};

type ProjectAdminRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  impact: string;
  thumbnail_image_path: string;
  hover_video_path: string | null;
  hover_video_crop: MediaCrop | null;
  client_name: string | null;
  year: string | null;
  services: string[];
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

type ProjectImageAdminRow = {
  id: string;
  project_id: string;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProjectAdmin = ProjectAdminRow & {
  thumbnailImageUrl: string;
  hoverVideoUrl: string | null;
  hoverVideoCrop: MediaCrop | null;
};

export type ProjectImageAdmin = ProjectImageAdminRow & {
  imageUrl: string;
};

function normalizeProject(project: ProjectAdminRow): ProjectAdmin {
  return {
    ...project,
    services: project.services ?? [],
    thumbnailImageUrl: getStoragePublicUrl("project-media", project.thumbnail_image_path),
    hoverVideoUrl: project.hover_video_path ? getStoragePublicUrl("project-video", project.hover_video_path) : null,
    hoverVideoCrop: isMediaCrop(project.hover_video_crop) ? project.hover_video_crop : null,
  };
}

function normalizeProjectImage(image: ProjectImageAdminRow): ProjectImageAdmin {
  return {
    ...image,
    imageUrl: getStoragePublicUrl("project-media", image.image_path),
  };
}

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [{ data: workItems, error: workError }, { data: projects, error: projectError }, { data: projectImages, error: imageError }] =
    await Promise.all([
      supabase.from("work_items").select("*").order("sort_order", { ascending: true }),
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
      supabase.from("project_images").select("*").order("sort_order", { ascending: true }),
    ]);

  if (workError) {
    throw new Error(workError.message);
  }

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (imageError) {
    throw new Error(imageError.message);
  }

  return {
    workItems: (workItems ?? []) as WorkItemAdmin[],
    projects: (projects ?? []).map((project) => normalizeProject(project as ProjectAdminRow)),
    projectImages: (projectImages ?? []).map((image) => normalizeProjectImage(image as ProjectImageAdminRow)),
  };
}

export async function getAdminDashboardSummary() {
  const data = await getAdminDashboardData();

  return {
    workCount: data.workItems.length,
    projectCount: data.projects.length,
    imageCount: data.projectImages.length,
    recentWorkItems: data.workItems.slice(0, 5),
    recentProjects: data.projects.slice(0, 5),
  };
}

export async function getAdminWorkItems() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("work_items").select("*").order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WorkItemAdmin[];
}

export async function getAdminWorkItemById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("work_items").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkItemAdmin | null;
}

export async function getAdminProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((project) => normalizeProject(project as ProjectAdminRow));
}

export async function getAdminProjectById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeProject(data as ProjectAdminRow) : null;
}

export async function getAdminProjectImages(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((image) => normalizeProjectImage(image as ProjectImageAdminRow));
}
