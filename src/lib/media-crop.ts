import type { CSSProperties } from "react";

export type MediaCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
  mediaWidth: number;
  mediaHeight: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeMediaCrop(value: MediaCrop): MediaCrop {
  return {
    x: clamp(value.x, 0, 100),
    y: clamp(value.y, 0, 100),
    width: clamp(value.width, 0.01, 100),
    height: clamp(value.height, 0.01, 100),
    aspectRatio: Math.max(0.01, value.aspectRatio),
    mediaWidth: Math.max(1, value.mediaWidth),
    mediaHeight: Math.max(1, value.mediaHeight),
  };
}

export function isMediaCrop(value: unknown): value is MediaCrop {
  if (!value || typeof value !== "object") {
    return false;
  }

  const crop = value as Partial<MediaCrop>;

  return [crop.x, crop.y, crop.width, crop.height, crop.aspectRatio, crop.mediaWidth, crop.mediaHeight].every(isFiniteNumber);
}

export function parseMediaCropInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmedValue);

    if (!isMediaCrop(parsed)) {
      return null;
    }

    return normalizeMediaCrop(parsed);
  } catch {
    return null;
  }
}

export function getCroppedVideoStyles(crop: MediaCrop | null): {
  containerStyle?: CSSProperties;
  videoStyle?: CSSProperties;
} {
  if (!crop) {
    return {};
  }

  const normalizedCrop = normalizeMediaCrop(crop);
  const mediaAspect = normalizedCrop.mediaWidth / normalizedCrop.mediaHeight;
  const cropAspect = normalizedCrop.aspectRatio;
  const fitByHeight = mediaAspect > cropAspect;

  const widthPercent = fitByHeight
    ? (10000 * mediaAspect) / (cropAspect * normalizedCrop.height)
    : 10000 / normalizedCrop.width;
  const heightPercent = fitByHeight
    ? 10000 / normalizedCrop.height
    : (10000 * cropAspect) / (mediaAspect * normalizedCrop.width);
  const leftPercent = -(normalizedCrop.x * widthPercent) / 100;
  const topPercent = -(normalizedCrop.y * heightPercent) / 100;

  return {
    containerStyle: {
      aspectRatio: String(cropAspect),
    },
    videoStyle: {
      position: "absolute",
      width: `${widthPercent}%`,
      height: `${heightPercent}%`,
      maxWidth: "none",
      maxHeight: "none",
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
    },
  };
}
