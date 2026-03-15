import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectImageFrame } from "@/components/project-image-frame";
import { mapProjectDetail, type ProjectDetail } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug, title, category, summary, description, impact, thumbnail_image_path, hover_video_path, hover_video_crop, client_name, year, services")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (projectError || !project) {
    return null;
  }

  const { data: images, error: imageError } = await supabase
    .from("project_images")
    .select("id, image_path, alt_text, sort_order")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  if (imageError) {
    return null;
  }

  return mapProjectDetail(
    project,
    (images ?? []).map((image) => ({
      id: image.id,
      image_path: image.image_path,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "프로젝트를 찾을 수 없습니다 | PHIM Agency",
    };
  }

  return {
    title: `${project.title} | PHIM Agency`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] text-[#10232b]">
      <section className="px-4 pb-8 pt-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-7">
          <Link
            href="/#projects"
            className="inline-flex min-h-11 w-fit items-center rounded-full border border-black/8 bg-white/88 px-5 text-sm font-semibold text-[#10232b] backdrop-blur"
          >
            프로젝트 목록으로
          </Link>

          <div className="grid gap-4">
            <Badge variant="outline" className="w-fit rounded-full border-[#143a46]/15 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
              {project.category}
            </Badge>
            <div className="max-w-4xl">
              <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.94] tracking-[-0.04em] text-balance">{project.title}</h1>
              <p className="mt-5 text-sm leading-8 text-[#5f7278] sm:text-base">{project.description}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-[1.7rem] border-black/8 bg-[#111111] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <CardContent className="p-6">
                <span className="inline-flex text-[0.76rem] font-extrabold uppercase tracking-[0.16em] text-[#f8f4ee]/80">Impact</span>
                <strong className="mt-3 block text-lg leading-7 text-[#f8f4ee]">{project.impact}</strong>
              </CardContent>
            </Card>
            <Card className="rounded-[1.7rem] border-black/8 bg-white/88 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur">
              <CardContent className="p-6">
                <span className="inline-flex text-[0.76rem] font-extrabold uppercase tracking-[0.16em] text-[#143a46]">Client</span>
                <strong className="mt-3 block text-lg leading-7 text-[#10232b]">{project.clientName ?? "Confidential"}</strong>
              </CardContent>
            </Card>
            <Card className="rounded-[1.7rem] border-black/8 bg-white/88 py-0 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur">
              <CardContent className="p-6">
                <span className="inline-flex text-[0.76rem] font-extrabold uppercase tracking-[0.16em] text-[#143a46]">Year</span>
                <strong className="mt-3 block text-lg leading-7 text-[#10232b]">{project.year ?? "Ongoing"}</strong>
              </CardContent>
            </Card>
          </div>

          <ProjectImageFrame
            src={project.thumbnailImageUrl}
            alt={`${project.title} 대표 이미지`}
            sizes="100vw"
            className="relative min-h-[300px] overflow-hidden rounded-[2.25rem] shadow-[0_24px_80px_rgba(10,29,35,0.12)] sm:min-h-[420px] lg:min-h-[560px]"
            fallbackClassName="p-8 sm:p-10 [&>span]:text-[0.78rem] [&>span]:font-extrabold [&>span]:uppercase [&>span]:tracking-[0.16em] [&>span]:opacity-80 [&>strong]:max-w-[10ch] [&>strong]:font-serif [&>strong]:text-[clamp(2rem,5vw,4rem)] [&>strong]:leading-[0.95]"
            eyebrow={project.category}
            title={project.title}
          />
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <div className="grid gap-5">
            <div>
              <Badge variant="outline" className="w-fit rounded-full border-[#143a46]/15 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
                Overview
              </Badge>
              <h2 className="mt-4 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-[1.02] tracking-[-0.04em] text-balance">브랜드의 인상을 결과로 연결한 구조</h2>
            </div>
            <div className="grid gap-5 text-sm leading-8 text-[#5f7278] sm:text-base">
              <p>{project.description}</p>
              <p>{project.summary}</p>
            </div>
          </div>

          <aside>
            <Card className="rounded-[1.7rem] border-white/60 bg-white/75 py-0 shadow-[0_24px_70px_rgba(10,29,35,0.1)] backdrop-blur">
              <CardContent className="p-6">
                <span className="inline-flex text-[0.76rem] font-extrabold uppercase tracking-[0.16em] text-[#143a46]">Services</span>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {project.services.map((service) => (
                    <Badge key={service} variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <section className="px-4 pb-20 pt-8 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <Badge variant="outline" className="w-fit rounded-full border-[#143a46]/15 bg-white/70 px-3 py-1 uppercase tracking-[0.18em] text-[#143a46]">
              Gallery
            </Badge>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-[1.02] tracking-[-0.04em] text-balance">이미지 중심으로 보는 프로젝트 장면</h2>
            <p className="mt-4 text-sm leading-8 text-[#5f7278] sm:text-base">실제 이미지가 업로드되면 이 섹션이 포트폴리오형 갤러리로 바로 채워집니다.</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {project.images.map((image, index) => (
              <ProjectImageFrame
                key={image.id}
                src={image.imageUrl}
                alt={image.altText}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={index === 0 ? "relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-[0_24px_80px_rgba(10,29,35,0.12)] lg:min-h-[520px]" : "relative min-h-[320px] overflow-hidden rounded-[2rem] shadow-[0_24px_80px_rgba(10,29,35,0.1)] lg:min-h-[380px]"}
                fallbackClassName="p-7 [&>span]:text-[0.78rem] [&>span]:font-extrabold [&>span]:uppercase [&>span]:tracking-[0.16em] [&>span]:opacity-80 [&>strong]:max-w-[10ch] [&>strong]:font-serif [&>strong]:text-[clamp(2rem,4vw,3rem)] [&>strong]:leading-[0.95]"
                eyebrow={`Scene ${index + 1}`}
                title={project.title}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
