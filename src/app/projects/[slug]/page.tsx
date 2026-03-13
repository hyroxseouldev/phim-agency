import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    .select("id, slug, title, category, summary, description, impact, thumbnail_image_path, client_name, year, services")
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
    <main className="project-detail-page">
      <section className="project-detail-hero">
        <div className="container project-detail-stack">
          <Link href="/#projects" className="project-back-link">
            프로젝트 목록으로
          </Link>

          <div className="project-detail-heading">
            <span className="eyebrow">{project.category}</span>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>

          <div className="project-detail-meta-grid">
            <div className="project-detail-meta-card project-detail-impact-card">
              <span className="card-label">Impact</span>
              <strong>{project.impact}</strong>
            </div>
            <div className="project-detail-meta-card">
              <span className="card-label">Client</span>
              <strong>{project.clientName ?? "Confidential"}</strong>
            </div>
            <div className="project-detail-meta-card">
              <span className="card-label">Year</span>
              <strong>{project.year ?? "Ongoing"}</strong>
            </div>
          </div>

          <ProjectImageFrame
            src={project.thumbnailImageUrl}
            alt={`${project.title} 대표 이미지`}
            sizes="100vw"
            className="project-hero-visual"
            imageClassName="project-detail-image"
            fallbackClassName="project-detail-fallback"
            eyebrow={project.category}
            title={project.title}
          />
        </div>
      </section>

      <section className="project-detail-content">
        <div className="container project-detail-body">
          <div className="project-detail-overview">
            <div className="section-heading project-detail-section-heading">
              <span className="eyebrow">Overview</span>
              <h2>브랜드의 인상을 결과로 연결한 구조</h2>
            </div>
            <p>{project.description}</p>
            <p>{project.summary}</p>
          </div>

          <aside className="project-detail-sidebar">
            <div className="project-detail-sidebar-card">
              <span className="card-label">Services</span>
              <div className="project-service-list">
                {project.services.map((service) => (
                  <span key={service}>{service}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="project-gallery-section">
        <div className="container">
          <div className="section-heading project-detail-section-heading">
            <span className="eyebrow">Gallery</span>
            <h2>이미지 중심으로 보는 프로젝트 장면</h2>
            <p>실제 이미지가 업로드되면 이 섹션이 포트폴리오형 갤러리로 바로 채워집니다.</p>
          </div>

          <div className="project-gallery-grid">
            {project.images.map((image, index) => (
              <ProjectImageFrame
                key={image.id}
                src={image.imageUrl}
                alt={image.altText}
                sizes="(max-width: 980px) 100vw, 50vw"
                className={index === 0 ? "project-gallery-item project-gallery-item-large" : "project-gallery-item"}
                imageClassName="project-detail-image"
                fallbackClassName="project-detail-fallback"
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
