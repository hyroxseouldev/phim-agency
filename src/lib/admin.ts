import "server-only";

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

export type ProjectAdmin = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  impact: string;
  thumbnail_image_path: string;
  hover_video_path: string | null;
  client_name: string | null;
  year: string | null;
  services: string[];
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
};

export type ProjectImageAdmin = {
  id: string;
  project_id: string;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
};

function normalizeProject(project: ProjectAdmin): ProjectAdmin {
  return {
    ...project,
    services: project.services ?? [],
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
    projects: (projects ?? []).map((project) => normalizeProject(project as ProjectAdmin)),
    projectImages: (projectImages ?? []) as ProjectImageAdmin[],
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

  return (data ?? []).map((project) => normalizeProject(project as ProjectAdmin));
}

export async function getAdminProjectById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeProject(data as ProjectAdmin) : null;
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

  return (data ?? []) as ProjectImageAdmin[];
}
