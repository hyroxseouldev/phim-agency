"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { CroppedVideo } from "@/components/shared/cropped-video";
import type { ProjectSummary } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  shouldReduceMotion,
  variants,
}: {
  project: ProjectSummary;
  shouldReduceMotion: boolean;
  variants?: Variants;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <motion.article variants={variants} whileHover={shouldReduceMotion ? undefined : { y: -4 }}>
      <Link href={`/projects/${project.slug}`} className="group block" aria-label={`${project.title} 프로젝트 보기`}>
        <div className="relative aspect-square overflow-hidden bg-[linear-gradient(135deg,rgba(20,58,70,0.12),rgba(199,143,98,0.18))]">
          {project.thumbnailImageUrl && !hasImageError ? (
            <>
              <Image
                src={project.thumbnailImageUrl}
                alt={`${project.title} 썸네일 이미지`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className={cn(
                  "object-cover transition duration-500",
                  shouldReduceMotion ? undefined : "group-hover:scale-[1.02] group-hover:opacity-0",
                  project.hoverVideoUrl && !hasVideoError ? "opacity-100" : undefined,
                )}
                onError={() => setHasImageError(true)}
              />
              {project.hoverVideoUrl && !hasVideoError ? (
                <CroppedVideo
                  src={project.hoverVideoUrl}
                  crop={project.hoverVideoCrop}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 transition duration-500",
                    shouldReduceMotion ? "hidden" : "opacity-0 group-hover:opacity-100",
                  )}
                  videoClassName="aspect-square"
                  onError={() => setHasVideoError(true)}
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,rgba(8,25,31,0.96),rgba(199,143,98,0.72))] p-5 text-[#f8f4ee]">
              <strong className="font-serif text-[clamp(1.4rem,3vw,2.2rem)] leading-[0.95]">{project.title}</strong>
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-1">
          <h3 className="text-sm font-semibold text-[#10232b] sm:text-[0.95rem]">{project.title}</h3>
          <p className="text-[0.72rem] font-medium tracking-[0.12em] text-[#5f7278] uppercase sm:text-xs">{project.category}</p>
        </div>
      </Link>
    </motion.article>
  );
}
