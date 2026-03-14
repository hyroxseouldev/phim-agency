"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, Images, PencilLine, Plus } from "lucide-react";
import {
  createProjectAction,
  createProjectImageAction,
  deleteProjectAction,
  deleteProjectImageAction,
  updateProjectAction,
  updateProjectImageAction,
} from "@/app/admin/actions";
import {
  AdminDetailHeader,
  AdminSectionHeader,
  Field,
  FileInput,
  FormCard,
  TextAreaInput,
  TextInput,
  ToggleField,
  useActionFeedback,
} from "@/components/admin/admin-form-primitives";
import { ImageCropInput } from "@/components/admin/image-crop-input";
import { PendingSubmitButton } from "@/components/admin/pending-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initialActionState } from "@/lib/action-state";
import type { ProjectAdmin, ProjectImageAdmin } from "@/lib/admin";

export function CreateProjectForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(createProjectAction, initialActionState);
  useActionFeedback(state, redirectTo ? { redirectTo } : undefined);

  return (
    <FormCard title="새 프로젝트 생성" description="프로젝트 기본 정보를 등록한 뒤, 상세 페이지에서 갤러리 이미지까지 이어서 관리합니다.">
      <form action={formAction} className="grid gap-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <Field htmlFor="project-create-title" label="제목">
            <TextInput id="project-create-title" name="title" required />
          </Field>
          <Field htmlFor="project-create-slug" label="슬러그">
            <TextInput id="project-create-slug" name="slug" placeholder="aster-wellness" />
          </Field>
          <Field htmlFor="project-create-category" label="카테고리">
            <TextInput id="project-create-category" name="category" required />
          </Field>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Field htmlFor="project-create-client" label="클라이언트">
            <TextInput id="project-create-client" name="clientName" />
          </Field>
          <Field htmlFor="project-create-year" label="연도">
            <TextInput id="project-create-year" name="year" />
          </Field>
          <Field htmlFor="project-create-sort" label="정렬 순서">
            <TextInput id="project-create-sort" name="sortOrder" type="number" defaultValue={0} />
          </Field>
        </div>

        <Field htmlFor="project-create-summary" label="요약">
          <TextAreaInput id="project-create-summary" name="summary" required />
        </Field>

        <Field htmlFor="project-create-description" label="상세 설명">
          <TextAreaInput id="project-create-description" name="description" className="min-h-44" required />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="project-create-impact" label="성과 문구">
            <TextInput id="project-create-impact" name="impact" required />
          </Field>
          <Field htmlFor="project-create-services" label="서비스 목록">
            <TextInput id="project-create-services" name="services" placeholder="브랜드 전략, 랜딩 페이지, 촬영" />
          </Field>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Field htmlFor="project-create-thumb" label="썸네일 이미지">
            <ImageCropInput
              id="project-create-thumb"
              name="thumbnailImage"
              required
              buttonLabel="썸네일 선택"
              emptyLabel="썸네일 이미지를 선택하고 1:1 기준으로 크롭하세요."
              description="프로젝트 썸네일은 기본 1:1 비율로 자른 뒤 저장합니다."
              defaultAspect={1}
            />
          </Field>
          <Field htmlFor="project-create-hover-video" label="호버 mp4 (선택)">
            <div className="grid gap-2">
              <FileInput
                id="project-create-hover-video"
                name="hoverVideo"
                type="file"
                accept="video/mp4,.mp4"
                className="pt-2"
              />
              <p className="text-xs leading-6 text-[#5f7278]">브라우저 호환을 위해 H.264 코덱의 mp4 파일을 권장합니다.</p>
            </div>
          </Field>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-2">
            <span className="invisible h-5 text-sm">메인 노출</span>
            <ToggleField id="project-create-featured" name="isFeatured" label="메인 노출" defaultChecked />
          </div>
          <div className="grid gap-2">
            <span className="invisible h-5 text-sm">공개 상태</span>
            <ToggleField id="project-create-active" name="isActive" label="공개 상태" defaultChecked />
          </div>
        </div>

        <PendingSubmitButton label="프로젝트 생성" pendingLabel="생성 중..." className="h-11 w-full rounded-2xl md:w-fit" />
      </form>
    </FormCard>
  );
}

function ProjectStatusBadges({ project, imageCount }: { project: ProjectAdmin; imageCount: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={project.is_active ? "default" : "secondary"} className="w-fit rounded-full px-3 py-1">
        {project.is_active ? "공개" : "비공개"}
      </Badge>
      {project.is_featured ? <Badge className="rounded-full px-3 py-1">Featured</Badge> : null}
      <Badge variant="secondary" className="rounded-full px-3 py-1">
        이미지 {imageCount}장
      </Badge>
      <Badge variant="outline" className="rounded-full px-3 py-1">
        {project.hover_video_path ? "호버 영상 있음" : "호버 영상 없음"}
      </Badge>
    </div>
  );
}

export function ProjectsListPage({ projects, projectImages }: { projects: ProjectAdmin[]; projectImages: ProjectImageAdmin[] }) {
  const imageCountByProjectId = projectImages.reduce<Record<string, number>>((accumulator, image) => {
    accumulator[image.project_id] = (accumulator[image.project_id] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div className="grid gap-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <AdminSectionHeader
          title="Projects 관리"
          description="프로젝트 리스트를 표로 재구성해 공개 상태, 갤러리 수, 주요 메타데이터를 빠르게 훑을 수 있게 정리했습니다."
          count={`${projects.length} projects`}
        />
        <Button asChild className="h-11 rounded-full px-5">
          <Link href="/admin/projects/new">
            <Plus className="size-4" />
            새 프로젝트 생성
          </Link>
        </Button>
      </section>

      <section className="grid gap-5">
        {projects.length > 0 ? (
          <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
            <CardContent className="px-0 py-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#10232b]/8 bg-[#f7f2eb]/80 hover:bg-[#f7f2eb]/80">
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">Project</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">상태</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">클라이언트</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">정렬</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">미디어</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">바로가기</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const imageCount = imageCountByProjectId[project.id] ?? 0;

                    return (
                      <TableRow key={project.id} className="border-[#10232b]/8 hover:bg-white/40">
                        <TableCell className="px-6 py-5 align-top whitespace-normal">
                          <div className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link href={`/admin/projects/${project.id}`} className="font-semibold text-[#10232b] transition hover:text-[#143a46]">
                                {project.title}
                              </Link>
                              <Badge variant="outline" className="rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 text-[#143a46]">
                                {project.category}
                              </Badge>
                            </div>
                            <p className="text-xs font-medium tracking-[0.14em] text-[#5f7278] uppercase">{project.slug}</p>
                            <p className="max-w-2xl text-sm leading-7 text-[#5f7278]">{project.summary}</p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <ProjectStatusBadges project={project} imageCount={imageCount} />
                        </TableCell>
                        <TableCell className="align-top whitespace-normal text-sm leading-6 text-[#5f7278]">
                          <div className="grid gap-1">
                            <span className="font-medium text-[#10232b]">{project.client_name ?? "미지정"}</span>
                            <span>{project.year ?? "연도 없음"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm font-medium text-[#10232b]">{project.sort_order}</TableCell>
                        <TableCell className="max-w-[240px] align-top whitespace-normal text-sm leading-6 break-all text-[#5f7278]">
                          <div className="grid gap-2">
                            <div>
                              <span className="text-xs font-semibold tracking-[0.12em] text-[#10232b] uppercase">Thumb</span>
                              <p>{project.thumbnail_image_path}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold tracking-[0.12em] text-[#10232b] uppercase">Hover</span>
                              <p>{project.hover_video_path ?? "미설정"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5 align-top">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" className="h-10 rounded-full border-[#10232b]/12 bg-white/80 px-4">
                              <Link href={`/projects/${project.slug}`} target="_blank" rel="noreferrer">
                                <Eye className="size-4" />
                                공개
                              </Link>
                            </Button>
                            <Button asChild className="h-10 rounded-full px-4">
                              <Link href={`/admin/projects/${project.id}`}>
                                <PencilLine className="size-4" />
                                편집
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#10232b]/14 bg-white/60 px-6 py-8 text-sm leading-7 text-[#5f7278]">
            등록된 프로젝트가 없습니다. 새 생성 페이지에서 첫 프로젝트를 등록하세요.
          </div>
        )}
      </section>
    </div>
  );
}

export function ProjectCreatePage() {
  return (
    <div className="grid gap-8">
      <AdminDetailHeader
        backHref="/admin/projects"
        backLabel="Projects 목록으로"
        title="새 프로젝트 생성"
        description="썸네일과 기본 메타데이터를 먼저 만들고, 저장 후 상세 페이지에서 공개 상태와 갤러리 이미지를 이어서 관리합니다."
      />

      <CreateProjectForm redirectTo="/admin/projects" />
    </div>
  );
}

function ProjectImageEditor({ image, project }: { image: ProjectImageAdmin; project: ProjectAdmin }) {
  const updateBound = updateProjectImageAction.bind(null, project.id, image.id, project.slug);
  const deleteBound = deleteProjectImageAction.bind(null, project.id, image.id, image.image_path, project.slug);
  const [updateState, updateAction] = useActionState(updateBound, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteBound, initialActionState);

  useActionFeedback(updateState);
  useActionFeedback(deleteState);

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          <Images className="mr-1 size-3.5" />
          Gallery Item
        </Badge>
        <Badge variant="outline" className="max-w-full rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 font-medium break-all text-[#143a46]">
          {image.image_path}
        </Badge>
      </div>

      <form action={updateAction} className="grid gap-4 xl:grid-cols-[1fr_180px_auto] xl:items-end">
        <Field htmlFor={`project-image-alt-${image.id}`} label="대체 텍스트">
          <TextInput id={`project-image-alt-${image.id}`} name="altText" defaultValue={image.alt_text ?? ""} />
        </Field>
        <Field htmlFor={`project-image-sort-${image.id}`} label="정렬 순서">
          <TextInput id={`project-image-sort-${image.id}`} name="sortOrder" type="number" defaultValue={image.sort_order} />
        </Field>
        <PendingSubmitButton label="이미지 저장" pendingLabel="저장 중..." variant="secondary" className="h-11 rounded-2xl px-5 xl:self-end" />
      </form>

      <form action={deleteAction}>
        <PendingSubmitButton label="이미지 삭제" pendingLabel="삭제 중..." variant="danger" className="h-11 rounded-2xl px-5" />
      </form>
    </div>
  );
}

export function ProjectDetailPage({ project, images }: { project: ProjectAdmin; images: ProjectImageAdmin[] }) {
  const updateBound = updateProjectAction.bind(null, project.id, project.thumbnail_image_path, project.hover_video_path, project.slug);
  const deleteBound = deleteProjectAction.bind(
    null,
    project.id,
    project.slug,
    project.thumbnail_image_path,
    project.hover_video_path,
    images.map((image) => image.image_path),
  );
  const createImageBound = createProjectImageAction.bind(null, project.id, project.slug);
  const [updateState, updateAction] = useActionState(updateBound, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteBound, initialActionState);
  const [createImageState, createImageAction] = useActionState(createImageBound, initialActionState);

  useActionFeedback(updateState);
  useActionFeedback(deleteState, { redirectTo: "/admin/projects" });
  useActionFeedback(createImageState);

  return (
    <div className="grid gap-8">
      <AdminDetailHeader
        backHref="/admin/projects"
        backLabel="Projects 목록으로"
        title={project.title}
        description="이 페이지에서 프로젝트 기본 정보, 공개 상태, 갤러리 이미지를 한 번에 관리할 수 있습니다."
        previewHref={`/projects/${project.slug}`}
      />

      <Card className="rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
        <CardContent className="grid gap-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 text-[#143a46]">
              {project.category}
            </Badge>
            <Badge variant={project.is_active ? "default" : "secondary"} className="rounded-full px-3 py-1">
              {project.is_active ? "공개" : "비공개"}
            </Badge>
            {project.is_featured ? <Badge className="rounded-full px-3 py-1">Featured</Badge> : null}
          </div>

          <form action={updateAction} className="grid gap-5">
            <div className="grid gap-4 xl:grid-cols-3">
              <Field htmlFor={`project-title-${project.id}`} label="제목">
                <TextInput id={`project-title-${project.id}`} name="title" defaultValue={project.title} required />
              </Field>
              <Field htmlFor={`project-slug-${project.id}`} label="슬러그">
                <TextInput id={`project-slug-${project.id}`} name="slug" defaultValue={project.slug} required />
              </Field>
              <Field htmlFor={`project-category-${project.id}`} label="카테고리">
                <TextInput id={`project-category-${project.id}`} name="category" defaultValue={project.category} required />
              </Field>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Field htmlFor={`project-client-${project.id}`} label="클라이언트">
                <TextInput id={`project-client-${project.id}`} name="clientName" defaultValue={project.client_name ?? ""} />
              </Field>
              <Field htmlFor={`project-year-${project.id}`} label="연도">
                <TextInput id={`project-year-${project.id}`} name="year" defaultValue={project.year ?? ""} />
              </Field>
              <Field htmlFor={`project-sort-${project.id}`} label="정렬 순서">
                <TextInput id={`project-sort-${project.id}`} name="sortOrder" type="number" defaultValue={project.sort_order} />
              </Field>
            </div>

            <Field htmlFor={`project-summary-${project.id}`} label="요약">
              <TextAreaInput id={`project-summary-${project.id}`} name="summary" defaultValue={project.summary} required />
            </Field>

            <Field htmlFor={`project-description-${project.id}`} label="상세 설명">
              <TextAreaInput id={`project-description-${project.id}`} name="description" defaultValue={project.description} className="min-h-44" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor={`project-impact-${project.id}`} label="성과 문구">
                <TextInput id={`project-impact-${project.id}`} name="impact" defaultValue={project.impact} required />
              </Field>
              <Field htmlFor={`project-services-${project.id}`} label="서비스 목록">
                <TextInput id={`project-services-${project.id}`} name="services" defaultValue={project.services.join(", ")} placeholder="브랜드 전략, 촬영, 페이지 설계" />
              </Field>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Field htmlFor={`project-thumb-${project.id}`} label="썸네일 교체">
                <ImageCropInput
                  id={`project-thumb-${project.id}`}
                  name="thumbnailImage"
                  buttonLabel="새 썸네일 선택"
                  emptyLabel="새 썸네일 이미지를 선택하면 기존 이미지를 교체합니다."
                  description="기본 1:1 크롭으로 저장되며, 적용하지 않으면 기존 썸네일을 유지합니다."
                  defaultAspect={1}
                />
              </Field>
              <Field htmlFor={`project-hover-video-${project.id}`} label="호버 mp4 교체">
                <div className="grid gap-2">
                  <FileInput
                    id={`project-hover-video-${project.id}`}
                    name="hoverVideo"
                    type="file"
                    accept="video/mp4,.mp4"
                    className="pt-2"
                  />
                  <p className="text-xs leading-6 text-[#5f7278]">브라우저 호환을 위해 H.264 코덱의 mp4 파일을 권장합니다.</p>
                </div>
              </Field>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="grid gap-2">
                <span className="invisible h-5 text-sm">메인 노출</span>
                <ToggleField id={`project-featured-${project.id}`} name="isFeatured" label="메인 노출" defaultChecked={project.is_featured} />
              </div>
              <div className="grid gap-2">
                <span className="invisible h-5 text-sm">공개 상태</span>
                <ToggleField id={`project-active-${project.id}`} name="isActive" label="공개 상태" defaultChecked={project.is_active} />
              </div>
              <div className="grid gap-2">
                <span className="invisible h-5 text-sm">호버 영상 제거</span>
                <ToggleField id={`project-hover-video-remove-${project.id}`} name="removeHoverVideo" label="기존 호버 영상 제거" defaultChecked={false} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 px-4 py-4 text-sm leading-7 text-[#5f7278]">
              현재 썸네일 경로: <span className="font-medium text-[#10232b]">{project.thumbnail_image_path}</span>
            </div>

            <div className="rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 px-4 py-4 text-sm leading-7 text-[#5f7278]">
              현재 호버 영상 경로: <span className="font-medium text-[#10232b]">{project.hover_video_path ?? "미설정"}</span>
            </div>

            <PendingSubmitButton label="변경사항 저장" pendingLabel="저장 중..." className="h-11 w-fit rounded-2xl px-5" />
          </form>

          <Separator />

          <section className="grid gap-5">
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold text-[#10232b]">갤러리 관리</h2>
              <p className="text-sm leading-7 text-[#5f7278]">프로젝트 상세 페이지에 노출될 이미지를 생성, 수정, 삭제합니다.</p>
            </div>

            <FormCard title="새 갤러리 이미지 추가" description="이미지 파일, 대체 텍스트, 정렬 순서를 입력해 프로젝트 갤러리에 추가합니다.">
              <form action={createImageAction} className="grid gap-4 xl:grid-cols-3 xl:items-end">
                <Field htmlFor={`gallery-image-${project.id}`} label="새 이미지">
                  <ImageCropInput
                    id={`gallery-image-${project.id}`}
                    name="image"
                    required
                    buttonLabel="갤러리 이미지 선택"
                    emptyLabel="갤러리 이미지를 선택한 뒤 원하는 비율로 크롭하세요."
                    description="기본은 1:1이며, 필요하면 4:3 또는 16:9로 바꿔서 저장할 수 있습니다."
                    defaultAspect={1}
                  />
                </Field>
                <Field htmlFor={`gallery-alt-${project.id}`} label="대체 텍스트">
                  <TextInput id={`gallery-alt-${project.id}`} name="altText" />
                </Field>
                <Field htmlFor={`gallery-sort-${project.id}`} label="정렬 순서">
                  <TextInput id={`gallery-sort-${project.id}`} name="sortOrder" type="number" defaultValue={images.length + 1} />
                </Field>
                <PendingSubmitButton label="갤러리 추가" pendingLabel="업로드 중..." variant="secondary" className="h-11 rounded-2xl px-5 xl:col-span-3 xl:w-fit" />
              </form>
            </FormCard>

            <div className="grid gap-4">
              {images.length > 0 ? (
                images.map((image) => <ProjectImageEditor key={image.id} image={image} project={project} />)
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[#10232b]/14 bg-white/60 px-5 py-6 text-sm leading-7 text-[#5f7278]">
                  아직 등록된 갤러리 이미지가 없습니다.
                </div>
              )}
            </div>
          </section>

          <Separator />

          <form action={deleteAction} className="grid gap-3">
            <p className="text-sm leading-7 text-[#5f7278]">삭제하면 공개 프로젝트 페이지와 갤러리 이미지가 함께 제거됩니다.</p>
            <PendingSubmitButton label="프로젝트 삭제" pendingLabel="삭제 중..." variant="danger" className="h-11 w-fit rounded-2xl px-5" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
