"use client";

import { useState } from "react";
import Image from "next/image";

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
        <Image src={src} alt={alt} fill sizes={sizes} className={imageClassName} onError={() => setHasImageError(true)} />
      ) : (
        <div className={fallbackClassName} aria-hidden="true">
          <span>{eyebrow}</span>
          <strong>{title}</strong>
        </div>
      )}
    </div>
  );
}
