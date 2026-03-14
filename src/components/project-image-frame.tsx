"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ProjectImageFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  eyebrow: string;
  title: string;
};

export function ProjectImageFrame({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  fallbackClassName,
  eyebrow,
  title,
}: ProjectImageFrameProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className={className}>
      {src && !hasImageError ? (
        <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", imageClassName)} onError={() => setHasImageError(true)} />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col justify-end gap-3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,rgba(8,25,31,0.98),rgba(199,143,98,0.8))] p-6 text-[#f8f4ee]",
            fallbackClassName,
          )}
          aria-hidden="true"
        >
          <span>{eyebrow}</span>
          <strong>{title}</strong>
        </div>
      )}
    </div>
  );
}
