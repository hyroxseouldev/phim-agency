"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { type ActionState } from "@/lib/action-state";
import { parseMediaCropInput } from "@/lib/media-crop";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && extension.length < 8 ? extension : "jpg";
}

function splitServices(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateImageUpload(file: File | null, { required, fieldLabel }: { required: boolean; fieldLabel: string }) {
  if (!file || file.size === 0) {
    if (required) {
      return `${fieldLabel} 파일을 선택해주세요.`;
    }

    return null;
  }

  if (!file.type.startsWith("image/")) {
    return `${fieldLabel}는 이미지 파일만 업로드할 수 있습니다.`;
  }

  if (file.size > 10 * 1024 * 1024) {
    return `${fieldLabel}는 10MB 이하만 업로드할 수 있습니다.`;
  }

  return null;
}

function validateMp4Upload(file: File | null, { required, fieldLabel }: { required: boolean; fieldLabel: string }) {
  if (!file || file.size === 0) {
    if (required) {
      return `${fieldLabel} 파일을 선택해주세요.`;
    }

    return null;
  }

  const extension = getFileExtension(file);
  const isMp4Mime = file.type === "video/mp4" || file.type === "application/mp4" || file.type === "";

  if (!isMp4Mime || extension !== "mp4") {
    return `${fieldLabel}은 mp4 파일만 업로드할 수 있습니다.`;
  }

  if (file.size > 16 * 1024 * 1024) {
    return `${fieldLabel}은 16MB 이하만 업로드할 수 있습니다.`;
  }

  return null;
}

async function uploadFile(bucket: "work-media" | "project-media" | "project-video", pathPrefix: string, file: File) {
  const { supabase } = await requireAdminUser();
  const extension = getFileExtension(file);
  const filePath = `${pathPrefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

async function removeFiles(bucket: "work-media" | "project-media" | "project-video", paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const { supabase } = await requireAdminUser();
  await supabase.storage.from(bucket).remove(paths);
}

function success(message: string): ActionState {
  return { status: "success", message };
}

function failure(message: string): ActionState {
  return { status: "error", message };
}

export async function createWorkItemAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const title = String(formData.get("title") ?? "").trim();
    const slugValue = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugValue || title);
    const category = String(formData.get("category") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const file = formData.get("coverImage") as File | null;

    if (!title || !slug || !category || !summary || !file || file.size === 0) {
      return failure("워크 항목 생성에는 제목, 카테고리, 설명, 대표 이미지가 필요합니다.");
    }

    const coverImagePath = await uploadFile("work-media", `work-items/${slug}`, file);

    const { error } = await supabase.from("work_items").insert({
      slug,
      title,
      category,
      summary,
      cover_image_path: coverImagePath,
      sort_order: parseNumber(formData.get("sortOrder"), 0),
      is_active: parseCheckbox(formData.get("isActive")),
    });

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/work");
    return success("워크 항목을 생성했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "워크 항목 생성에 실패했습니다.");
  }
}

export async function updateWorkItemAction(
  workItemId: string,
  currentImagePath: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const title = String(formData.get("title") ?? "").trim();
    const slugValue = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugValue || title);
    const category = String(formData.get("category") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const file = formData.get("coverImage") as File | null;

    if (!title || !slug || !category || !summary) {
      return failure("워크 항목 필드를 모두 입력해주세요.");
    }

    let coverImagePath = currentImagePath;

    if (file && file.size > 0) {
      coverImagePath = await uploadFile("work-media", `work-items/${slug}`, file);
      if (currentImagePath) {
        await removeFiles("work-media", [currentImagePath]);
      }
    }

    const { error } = await supabase
      .from("work_items")
      .update({
        slug,
        title,
        category,
        summary,
        cover_image_path: coverImagePath,
        sort_order: parseNumber(formData.get("sortOrder"), 0),
        is_active: parseCheckbox(formData.get("isActive")),
      })
      .eq("id", workItemId);

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/work");
    revalidatePath(`/admin/work/${workItemId}`);
    return success("워크 항목을 수정했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "워크 항목 수정에 실패했습니다.");
  }
}

export async function deleteWorkItemAction(
  workItemId: string,
  currentImagePath: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    void _previousState;
    void _formData;
    const { supabase } = await requireAdminUser();
    const { error } = await supabase.from("work_items").delete().eq("id", workItemId);

    if (error) {
      return failure(error.message);
    }

    if (currentImagePath) {
      await removeFiles("work-media", [currentImagePath]);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/work");
    revalidatePath(`/admin/work/${workItemId}`);
    return success("워크 항목을 삭제했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "워크 항목 삭제에 실패했습니다.");
  }
}

export async function createProjectAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const title = String(formData.get("title") ?? "").trim();
    const slugValue = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugValue || title);
    const category = String(formData.get("category") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const impact = String(formData.get("impact") ?? "").trim();
    const file = formData.get("thumbnailImage") as File | null;
    const hoverVideo = formData.get("hoverVideo") as File | null;
    const hoverVideoCrop = parseMediaCropInput(formData.get("hoverVideoCrop"));

    if (!title || !slug || !category || !summary || !description || !impact || !file || file.size === 0) {
      return failure("프로젝트 생성에는 기본 정보와 썸네일 이미지가 필요합니다.");
    }

    const imageError = validateImageUpload(file, { required: true, fieldLabel: "썸네일 이미지" });

    if (imageError) {
      return failure(imageError);
    }

    const hoverVideoError = validateMp4Upload(hoverVideo, { required: false, fieldLabel: "호버 영상" });

    if (hoverVideoError) {
      return failure(hoverVideoError);
    }

    const thumbnailImagePath = await uploadFile("project-media", `projects/${slug}`, file);
    const hoverVideoPath = hoverVideo && hoverVideo.size > 0 ? await uploadFile("project-video", `projects/${slug}/hover`, hoverVideo) : null;

    const { error } = await supabase.from("projects").insert({
      slug,
      title,
      category,
      summary,
      description,
      impact,
      thumbnail_image_path: thumbnailImagePath,
      hover_video_path: hoverVideoPath,
      hover_video_crop: hoverVideoPath ? hoverVideoCrop : null,
      client_name: String(formData.get("clientName") ?? "").trim() || null,
      year: String(formData.get("year") ?? "").trim() || null,
      services: splitServices(String(formData.get("services") ?? "")),
      sort_order: parseNumber(formData.get("sortOrder"), 0),
      is_featured: parseCheckbox(formData.get("isFeatured")),
      is_active: parseCheckbox(formData.get("isActive")),
    });

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    return success("프로젝트를 생성했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "프로젝트 생성에 실패했습니다.");
  }
}

export async function updateProjectAction(
  projectId: string,
  currentImagePath: string,
  currentHoverVideoPath: string | null,
  currentSlug: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const title = String(formData.get("title") ?? "").trim();
    const slugValue = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugValue || title);
    const category = String(formData.get("category") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const impact = String(formData.get("impact") ?? "").trim();
    const file = formData.get("thumbnailImage") as File | null;
    const hoverVideo = formData.get("hoverVideo") as File | null;
    const hoverVideoCrop = parseMediaCropInput(formData.get("hoverVideoCrop"));
    const removeHoverVideo = String(formData.get("removeHoverVideo") ?? "") === "on";

    if (!title || !slug || !category || !summary || !description || !impact) {
      return failure("프로젝트 필수 항목을 모두 입력해주세요.");
    }

    const imageError = validateImageUpload(file, { required: false, fieldLabel: "썸네일 이미지" });

    if (imageError) {
      return failure(imageError);
    }

    const hoverVideoError = validateMp4Upload(hoverVideo, { required: false, fieldLabel: "호버 영상" });

    if (hoverVideoError) {
      return failure(hoverVideoError);
    }

    let thumbnailImagePath = currentImagePath;
    let hoverVideoPath = currentHoverVideoPath;
    let nextHoverVideoCrop = hoverVideoCrop;

    if (file && file.size > 0) {
      thumbnailImagePath = await uploadFile("project-media", `projects/${slug}`, file);
      if (currentImagePath) {
        await removeFiles("project-media", [currentImagePath]);
      }
    }

    if (hoverVideo && hoverVideo.size > 0) {
      hoverVideoPath = await uploadFile("project-video", `projects/${slug}/hover`, hoverVideo);
      if (currentHoverVideoPath) {
        await removeFiles("project-video", [currentHoverVideoPath]);
      }
    } else if (removeHoverVideo && currentHoverVideoPath) {
      await removeFiles("project-video", [currentHoverVideoPath]);
      hoverVideoPath = null;
      nextHoverVideoCrop = null;
    }

    if (!hoverVideoPath) {
      nextHoverVideoCrop = null;
    }

    const { error } = await supabase
      .from("projects")
      .update({
        slug,
        title,
        category,
        summary,
        description,
        impact,
        thumbnail_image_path: thumbnailImagePath,
        hover_video_path: hoverVideoPath,
        hover_video_crop: nextHoverVideoCrop,
        client_name: String(formData.get("clientName") ?? "").trim() || null,
        year: String(formData.get("year") ?? "").trim() || null,
        services: splitServices(String(formData.get("services") ?? "")),
        sort_order: parseNumber(formData.get("sortOrder"), 0),
        is_featured: parseCheckbox(formData.get("isFeatured")),
        is_active: parseCheckbox(formData.get("isActive")),
      })
      .eq("id", projectId);

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${currentSlug}`);
    revalidatePath(`/projects/${slug}`);
    return success("프로젝트를 수정했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "프로젝트 수정에 실패했습니다.");
  }
}

export async function deleteProjectAction(
  projectId: string,
  currentSlug: string,
  thumbnailImagePath: string,
  hoverVideoPath: string | null,
  galleryImagePaths: string[],
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    void _previousState;
    void _formData;
    const { supabase } = await requireAdminUser();
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      return failure(error.message);
    }

    await removeFiles("project-media", [thumbnailImagePath, ...galleryImagePaths].filter((path): path is string => Boolean(path)));

    if (hoverVideoPath) {
      await removeFiles("project-video", [hoverVideoPath]);
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${currentSlug}`);
    return success("프로젝트를 삭제했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.");
  }
}

export async function createProjectImageAction(
  projectId: string,
  projectSlug: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const file = formData.get("image") as File | null;

    if (!file || file.size === 0) {
      return failure("갤러리 이미지를 선택해주세요.");
    }

    const imagePath = await uploadFile("project-media", `projects/${projectSlug}/gallery`, file);

    const { error } = await supabase.from("project_images").insert({
      project_id: projectId,
      image_path: imagePath,
      alt_text: String(formData.get("altText") ?? "").trim() || null,
      sort_order: parseNumber(formData.get("sortOrder"), 0),
    });

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${projectSlug}`);
    return success("갤러리 이미지를 추가했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "갤러리 이미지 추가에 실패했습니다.");
  }
}

export async function updateProjectImageAction(
  projectId: string,
  imageId: string,
  projectSlug: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdminUser();
    const { error } = await supabase
      .from("project_images")
      .update({
        alt_text: String(formData.get("altText") ?? "").trim() || null,
        sort_order: parseNumber(formData.get("sortOrder"), 0),
      })
      .eq("id", imageId);

    if (error) {
      return failure(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${projectSlug}`);
    return success("갤러리 이미지 정보를 수정했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "갤러리 이미지 수정에 실패했습니다.");
  }
}

export async function deleteProjectImageAction(
  projectId: string,
  imageId: string,
  imagePath: string,
  projectSlug: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  try {
    void _previousState;
    void _formData;
    const { supabase } = await requireAdminUser();
    const { error } = await supabase.from("project_images").delete().eq("id", imageId);

    if (error) {
      return failure(error.message);
    }

    if (imagePath) {
      await removeFiles("project-media", [imagePath]);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/projects/${projectSlug}`);
    return success("갤러리 이미지를 삭제했습니다.");
  } catch (error) {
    return failure(error instanceof Error ? error.message : "갤러리 이미지 삭제에 실패했습니다.");
  }
}
