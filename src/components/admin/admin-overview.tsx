import Link from "next/link";
import { ArrowRight, FolderKanban, ImageIcon, Layers3 } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/admin-form-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectAdmin, WorkItemAdmin } from "@/lib/admin";

function SummaryCard({
  title,
  value,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
  icon: typeof Layers3;
}) {
  return (
    <Card className="rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
      <CardContent className="grid gap-6 px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-[#5f7278]">{title}</p>
            <strong className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#10232b]">{value}</strong>
          </div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#143a46] text-white">
            <Icon className="size-5" />
          </div>
        </div>

        <p className="text-sm leading-7 text-[#5f7278]">{description}</p>

        <Button asChild variant="outline" className="h-11 w-fit rounded-full border-[#10232b]/12 bg-white/80 px-5">
          <Link href={href}>
            관리 페이지 이동
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentList({
  title,
  items,
  hrefPrefix,
  emptyLabel,
}: {
  title: string;
  items: Array<WorkItemAdmin | ProjectAdmin>;
  hrefPrefix: string;
  emptyLabel: string;
}) {
  return (
    <Card className="rounded-[2rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.08)] backdrop-blur">
      <CardHeader className="gap-2 border-b border-[#10232b]/8 px-6 py-6">
        <CardTitle className="text-xl text-[#10232b]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 px-6 py-6">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={`${hrefPrefix}/${item.id}`}
              className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 px-4 py-4 transition hover:border-[#143a46]/18 hover:bg-white/85"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#10232b]">{item.title}</p>
                <p className="truncate text-sm text-[#5f7278]">{item.slug}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-[#143a46]/12 bg-white/70 px-3 py-1 text-[#143a46]">
                {item.category}
              </Badge>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#10232b]/14 bg-white/60 px-5 py-6 text-sm leading-7 text-[#5f7278]">{emptyLabel}</div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminOverview({
  workCount,
  projectCount,
  imageCount,
  recentWorkItems,
  recentProjects,
}: {
  workCount: number;
  projectCount: number;
  imageCount: number;
  recentWorkItems: WorkItemAdmin[];
  recentProjects: ProjectAdmin[];
}) {
  return (
    <div className="grid gap-8">
      <AdminSectionHeader
        title="콘텐츠 운영 대시보드"
        description="리스트 페이지에서 새 항목을 만들고, 디테일 페이지에서 상세 수정과 삭제를 진행하는 구조로 어드민을 재정리했습니다."
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <SummaryCard title="Work Items" value={String(workCount)} description="홈 Work 섹션 카드와 대표 이미지를 관리합니다." href="/admin/work" icon={Layers3} />
        <SummaryCard title="Projects" value={String(projectCount)} description="프로젝트 본문, 썸네일, 공개 상태를 관리합니다." href="/admin/projects" icon={FolderKanban} />
        <SummaryCard title="Project Images" value={String(imageCount)} description="프로젝트 디테일에 연결된 갤러리 이미지 수입니다." href="/admin/projects" icon={ImageIcon} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RecentList title="최근 Work" items={recentWorkItems} hrefPrefix="/admin/work" emptyLabel="등록된 Work 항목이 없습니다." />
        <RecentList title="최근 Projects" items={recentProjects} hrefPrefix="/admin/projects" emptyLabel="등록된 프로젝트가 없습니다." />
      </section>
    </div>
  );
}
