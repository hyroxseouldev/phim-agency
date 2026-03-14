"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, PencilLine, Plus } from "lucide-react";
import { createWorkItemAction, deleteWorkItemAction, updateWorkItemAction } from "@/app/admin/actions";
import {
  AdminDetailHeader,
  AdminSectionHeader,
  Field,
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
import type { WorkItemAdmin } from "@/lib/admin";

export function CreateWorkItemForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(createWorkItemAction, initialActionState);
  useActionFeedback(state, redirectTo ? { redirectTo } : undefined);

  return (
    <FormCard title="새 Work 생성" description="대표 이미지와 기본 정보를 먼저 등록한 뒤, 리스트와 상세 페이지에서 이어서 관리합니다.">
      <form action={formAction} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="work-create-title" label="제목">
            <TextInput id="work-create-title" name="title" required />
          </Field>
          <Field htmlFor="work-create-slug" label="슬러그">
            <TextInput id="work-create-slug" name="slug" placeholder="brand-design" />
          </Field>
          <Field htmlFor="work-create-category" label="카테고리">
            <TextInput id="work-create-category" name="category" required />
          </Field>
          <Field htmlFor="work-create-sort" label="정렬 순서">
            <TextInput id="work-create-sort" name="sortOrder" type="number" defaultValue={0} />
          </Field>
        </div>

        <Field htmlFor="work-create-summary" label="설명">
          <TextAreaInput id="work-create-summary" name="summary" required />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="work-create-image" label="대표 이미지">
            <ImageCropInput
              id="work-create-image"
              name="coverImage"
              required
              buttonLabel="대표 이미지 선택"
              emptyLabel="대표 이미지를 선택하고 1:1 기준으로 크롭하세요."
              description="워크 카드에 맞게 1:1 썸네일을 기본으로 자르고 저장합니다."
              defaultAspect={1}
            />
          </Field>
          <div className="grid gap-2">
            <span className="invisible h-5 text-sm">공개 상태</span>
            <ToggleField id="work-create-active" name="isActive" label="공개 상태" defaultChecked />
          </div>
        </div>

        <PendingSubmitButton label="워크 생성" pendingLabel="생성 중..." className="h-11 w-full rounded-2xl md:w-fit" />
      </form>
    </FormCard>
  );
}

function WorkStatusBadge({ item }: { item: WorkItemAdmin }) {
  return (
    <Badge variant={item.is_active ? "default" : "secondary"} className="w-fit rounded-full px-3 py-1">
      {item.is_active ? "공개" : "비공개"}
    </Badge>
  );
}

export function WorkListPage({ workItems }: { workItems: WorkItemAdmin[] }) {
  return (
    <div className="grid gap-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <AdminSectionHeader
          title="Work 관리"
          description="리스트를 표 형태로 정리해 상태와 정렬, 미리보기 동선을 한 번에 확인할 수 있도록 바꿨습니다."
          count={`${workItems.length} items`}
        />
        <Button asChild className="h-11 rounded-full px-5">
          <Link href="/admin/work/new">
            <Plus className="size-4" />
            새 Work 생성
          </Link>
        </Button>
      </section>

      <section className="grid gap-5">
        {workItems.length > 0 ? (
          <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
            <CardContent className="px-0 py-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#10232b]/8 bg-[#f7f2eb]/80 hover:bg-[#f7f2eb]/80">
                    <TableHead className="px-6 py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">Work</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">상태</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">정렬</TableHead>
                    <TableHead className="py-4 text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">이미지</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-semibold tracking-[0.16em] text-[#5f7278] uppercase">바로가기</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workItems.map((item) => (
                    <TableRow key={item.id} className="border-[#10232b]/8 hover:bg-white/40">
                      <TableCell className="px-6 py-5 align-top whitespace-normal">
                        <div className="grid gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/work/${item.id}`} className="font-semibold text-[#10232b] transition hover:text-[#143a46]">
                              {item.title}
                            </Link>
                            <Badge variant="outline" className="rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 text-[#143a46]">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium tracking-[0.14em] text-[#5f7278] uppercase">{item.slug}</p>
                          <p className="max-w-2xl text-sm leading-7 text-[#5f7278]">{item.summary}</p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <WorkStatusBadge item={item} />
                      </TableCell>
                      <TableCell className="align-top text-sm font-medium text-[#10232b]">{item.sort_order}</TableCell>
                      <TableCell className="max-w-[240px] align-top whitespace-normal text-sm leading-6 break-all text-[#5f7278]">
                        {item.cover_image_path}
                      </TableCell>
                      <TableCell className="px-6 py-5 align-top">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" className="h-10 rounded-full border-[#10232b]/12 bg-white/80 px-4">
                            <Link href="/#work">
                              <Eye className="size-4" />
                              홈
                            </Link>
                          </Button>
                          <Button asChild className="h-10 rounded-full px-4">
                            <Link href={`/admin/work/${item.id}`}>
                              <PencilLine className="size-4" />
                              편집
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#10232b]/14 bg-white/60 px-6 py-8 text-sm leading-7 text-[#5f7278]">
            등록된 Work 항목이 없습니다. 새 생성 페이지에서 첫 항목을 등록하세요.
          </div>
        )}
      </section>
    </div>
  );
}

export function WorkCreatePage() {
  return (
    <div className="grid gap-8">
      <AdminDetailHeader
        backHref="/admin/work"
        backLabel="Work 목록으로"
        title="새 Work 생성"
        description="대표 이미지와 기본 정보를 먼저 등록한 뒤, 목록에서 상태를 확인하고 상세 페이지에서 수정 흐름을 이어갑니다."
      />

      <CreateWorkItemForm redirectTo="/admin/work" />
    </div>
  );
}

export function WorkDetailPage({ item }: { item: WorkItemAdmin }) {
  const updateBound = updateWorkItemAction.bind(null, item.id, item.cover_image_path);
  const deleteBound = deleteWorkItemAction.bind(null, item.id, item.cover_image_path);
  const [updateState, updateAction] = useActionState(updateBound, initialActionState);
  const [deleteState, deleteAction] = useActionState(deleteBound, initialActionState);

  useActionFeedback(updateState);
  useActionFeedback(deleteState, { redirectTo: "/admin/work" });

  return (
    <div className="grid gap-8">
      <AdminDetailHeader
        backHref="/admin/work"
        backLabel="Work 목록으로"
        title={item.title}
        description="이 페이지에서 Work 항목의 현재 정보를 확인하고 수정 또는 삭제할 수 있습니다."
      />

      <Card className="rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
        <CardContent className="grid gap-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 text-[#143a46]">
              {item.category}
            </Badge>
            <Badge variant={item.is_active ? "default" : "secondary"} className="rounded-full px-3 py-1">
              {item.is_active ? "공개" : "비공개"}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              정렬 {item.sort_order}
            </Badge>
          </div>

          <form action={updateAction} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor={`work-title-${item.id}`} label="제목">
                <TextInput id={`work-title-${item.id}`} name="title" defaultValue={item.title} required />
              </Field>
              <Field htmlFor={`work-slug-${item.id}`} label="슬러그">
                <TextInput id={`work-slug-${item.id}`} name="slug" defaultValue={item.slug} required />
              </Field>
              <Field htmlFor={`work-category-${item.id}`} label="카테고리">
                <TextInput id={`work-category-${item.id}`} name="category" defaultValue={item.category} required />
              </Field>
              <Field htmlFor={`work-sort-${item.id}`} label="정렬 순서">
                <TextInput id={`work-sort-${item.id}`} name="sortOrder" type="number" defaultValue={item.sort_order} />
              </Field>
            </div>

            <Field htmlFor={`work-summary-${item.id}`} label="설명">
              <TextAreaInput id={`work-summary-${item.id}`} name="summary" defaultValue={item.summary} required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor={`work-image-${item.id}`} label="대표 이미지 교체">
                <ImageCropInput
                  id={`work-image-${item.id}`}
                  name="coverImage"
                  buttonLabel="새 대표 이미지 선택"
                  emptyLabel="새 대표 이미지를 선택하면 기존 이미지를 교체합니다."
                  description="기본 1:1 크롭으로 저장되며, 적용하지 않으면 기존 이미지를 유지합니다."
                  defaultAspect={1}
                />
              </Field>
              <div className="grid gap-2">
                <span className="invisible h-5 text-sm">공개 상태</span>
                <ToggleField id={`work-active-${item.id}`} name="isActive" label="공개 상태" defaultChecked={item.is_active} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 px-4 py-4 text-sm leading-7 text-[#5f7278]">
              현재 이미지 경로: <span className="font-medium text-[#10232b]">{item.cover_image_path}</span>
            </div>

            <PendingSubmitButton label="변경사항 저장" pendingLabel="저장 중..." className="h-11 w-fit rounded-2xl px-5" />
          </form>

          <Separator />

          <form action={deleteAction} className="grid gap-3">
            <p className="text-sm leading-7 text-[#5f7278]">삭제하면 홈 Work 섹션에서 즉시 사라지며 연결된 대표 이미지도 스토리지에서 제거됩니다.</p>
            <PendingSubmitButton label="Work 삭제" pendingLabel="삭제 중..." variant="danger" className="h-11 w-fit rounded-2xl px-5" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
