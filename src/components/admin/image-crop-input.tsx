"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crop, ImagePlus, Move, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AspectOption = {
  label: string;
  value: number;
};

type ImageCropInputProps = {
  id: string;
  name: string;
  accept?: string;
  required?: boolean;
  className?: string;
  buttonLabel?: string;
  emptyLabel?: string;
  description?: string;
  defaultAspect?: number;
  aspectOptions?: AspectOption[];
};

type LoadedImage = {
  url: string;
  width: number;
  height: number;
  file: File;
};

type DragState = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const DEFAULT_ASPECT_OPTIONS: AspectOption[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sanitizeFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;
  return baseName.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "image";
}

function getOutputMimeType(file: File) {
  if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpeg") {
    return file.type;
  }

  return "image/jpeg";
}

function getOutputExtension(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function readLoadedImage(file: File): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);

  try {
    const image = new window.Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      image.src = url;
    });

    return {
      url,
      width: image.naturalWidth,
      height: image.naturalHeight,
      file,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function createCroppedFile({
  loadedImage,
  viewportWidth,
  viewportHeight,
  offsetX,
  offsetY,
  zoom,
}: {
  loadedImage: LoadedImage;
  viewportWidth: number;
  viewportHeight: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
}) {
  const image = new window.Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("이미지를 자르지 못했습니다."));
    image.src = loadedImage.url;
  });

  const baseScale = Math.max(viewportWidth / loadedImage.width, viewportHeight / loadedImage.height);
  const scaledWidth = loadedImage.width * baseScale * zoom;
  const scaledHeight = loadedImage.height * baseScale * zoom;
  const left = (viewportWidth - scaledWidth) / 2 + offsetX;
  const top = (viewportHeight - scaledHeight) / 2 + offsetY;
  const cropX = clamp((0 - left) / (baseScale * zoom), 0, loadedImage.width);
  const cropY = clamp((0 - top) / (baseScale * zoom), 0, loadedImage.height);
  const cropWidth = clamp(viewportWidth / (baseScale * zoom), 1, loadedImage.width - cropX);
  const cropHeight = clamp(viewportHeight / (baseScale * zoom), 1, loadedImage.height - cropY);
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(cropWidth));
  canvas.height = Math.max(1, Math.round(cropHeight));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 편집 캔버스를 초기화하지 못했습니다.");
  }

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

  const mimeType = getOutputMimeType(loadedImage.file);
  const extension = getOutputExtension(mimeType);
  const outputName = `${sanitizeFileName(loadedImage.file.name)}-cropped.${extension}`;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
          return;
        }

        reject(new Error("크롭된 이미지를 생성하지 못했습니다."));
      },
      mimeType,
      mimeType === "image/png" ? undefined : 0.92,
    );
  });

  return new File([blob], outputName, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export function ImageCropInput({
  id,
  name,
  accept = "image/*",
  required,
  className,
  buttonLabel = "이미지 선택",
  emptyLabel = "선택된 이미지가 없습니다.",
  description = "드래그해서 위치를 조정하고 확대해서 잘라낼 수 있습니다.",
  defaultAspect = 1,
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
}: ImageCropInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const loadedImageRef = useRef<LoadedImage | null>(null);
  const draftImageRef = useRef<LoadedImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [draftImage, setDraftImage] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewAspect, setPreviewAspect] = useState(defaultAspect);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [aspect, setAspect] = useState(defaultAspect);
  const [viewportWidth, setViewportWidth] = useState(320);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const aspectRatio = Number.isFinite(aspect) && aspect > 0 ? aspect : defaultAspect;
  const viewportHeight = viewportWidth / aspectRatio;

  const scaledBounds = useMemo(() => {
    if (!draftImage) {
      return { maxOffsetX: 0, maxOffsetY: 0 };
    }

    const baseScale = Math.max(viewportWidth / draftImage.width, viewportHeight / draftImage.height);
    const scaledWidth = draftImage.width * baseScale * zoom;
    const scaledHeight = draftImage.height * baseScale * zoom;

    return {
      maxOffsetX: Math.max(0, (scaledWidth - viewportWidth) / 2),
      maxOffsetY: Math.max(0, (scaledHeight - viewportHeight) / 2),
    };
  }, [draftImage, viewportHeight, viewportWidth, zoom]);

  const clampOffsets = useCallback(
    (nextOffsetX: number, nextOffsetY: number) => ({
      x: clamp(nextOffsetX, -scaledBounds.maxOffsetX, scaledBounds.maxOffsetX),
      y: clamp(nextOffsetY, -scaledBounds.maxOffsetY, scaledBounds.maxOffsetY),
    }),
    [scaledBounds.maxOffsetX, scaledBounds.maxOffsetY],
  );

  useEffect(() => {
    loadedImageRef.current = loadedImage;
  }, [loadedImage]);

  useEffect(() => {
    draftImageRef.current = draftImage;
  }, [draftImage]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      if (loadedImageRef.current) {
        URL.revokeObjectURL(loadedImageRef.current.url);
      }

      if (draftImageRef.current && draftImageRef.current !== loadedImageRef.current) {
        URL.revokeObjectURL(draftImageRef.current.url);
      }
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setViewportWidth(Math.max(220, Math.round(entry.contentRect.width)));
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isOpen]);

  useEffect(() => {
    const clamped = clampOffsets(offsetX, offsetY);

    if (clamped.x !== offsetX) {
      setOffsetX(clamped.x);
    }

    if (clamped.y !== offsetY) {
      setOffsetY(clamped.y);
    }
  }, [clampOffsets, offsetX, offsetY]);

  const resetDraft = useCallback(
    (image: LoadedImage) => {
      setDraftImage(image);
      setAspect(defaultAspect);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setErrorMessage("");
    },
    [defaultAspect],
  );

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearSelection = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (loadedImage) {
      URL.revokeObjectURL(loadedImage.url);
    }

    if (draftImage && draftImage !== loadedImage) {
      URL.revokeObjectURL(draftImage.url);
    }

    setLoadedImage(null);
    setDraftImage(null);
    setPreviewUrl("");
    setSelectedFileName("");
    setPreviewAspect(defaultAspect);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setErrorMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [defaultAspect, draftImage, loadedImage]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const nextImage = await readLoadedImage(file);

      if (draftImage && draftImage !== loadedImage) {
        URL.revokeObjectURL(draftImage.url);
      }

      setErrorMessage("");
      resetDraft(nextImage);
      setIsOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "이미지를 불러오지 못했습니다.");
      event.target.value = "";
    }
  }, [draftImage, loadedImage, resetDraft]);

  const handleApply = useCallback(async () => {
    if (!draftImage || !inputRef.current) {
      return;
    }

    setIsApplying(true);
    setErrorMessage("");

    try {
      const croppedFile = await createCroppedFile({
        loadedImage: draftImage,
        viewportWidth,
        viewportHeight,
        offsetX,
        offsetY,
        zoom,
      });
      const dataTransfer = new DataTransfer();
      const nextPreviewUrl = URL.createObjectURL(croppedFile);

      dataTransfer.items.add(croppedFile);
      inputRef.current.files = dataTransfer.files;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);
      setPreviewAspect(aspectRatio);
      setSelectedFileName(croppedFile.name);

      if (loadedImage && loadedImage !== draftImage) {
        URL.revokeObjectURL(loadedImage.url);
      }

      setLoadedImage(draftImage);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "이미지를 자르지 못했습니다.");
    } finally {
      setIsApplying(false);
    }
  }, [aspectRatio, draftImage, loadedImage, offsetX, offsetY, viewportHeight, viewportWidth, zoom]);

  const handleCancel = useCallback(() => {
    if (draftImage && draftImage !== loadedImage) {
      URL.revokeObjectURL(draftImage.url);
    }

    setDraftImage(loadedImage);
    setIsOpen(false);
    setErrorMessage("");

    if (!loadedImage && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [draftImage, loadedImage]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draftImage) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      originX: offsetX,
      originY: offsetY,
    });
  }, [draftImage, offsetX, offsetY]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) {
      return;
    }

    const nextOffsetX = dragState.originX + (event.clientX - dragState.startX);
    const nextOffsetY = dragState.originY + (event.clientY - dragState.startY);
    const clamped = clampOffsets(nextOffsetX, nextOffsetY);

    setOffsetX(clamped.x);
    setOffsetY(clamped.y);
  }, [clampOffsets, dragState]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDragState(null);
    }
  }, [dragState]);

  return (
    <>
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} required={required} className="sr-only" onChange={handleFileChange} />

      <div className={cn("grid gap-3", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="h-11 rounded-2xl border-[#10232b]/12 bg-white/80 px-4" onClick={openPicker}>
            <ImagePlus className="size-4" />
            {buttonLabel}
          </Button>
          {previewUrl ? (
            <Button type="button" variant="ghost" className="h-11 rounded-2xl px-4 text-[#5f7278]" onClick={clearSelection}>
              <RotateCcw className="size-4" />
              초기화
            </Button>
          ) : null}
        </div>

        {previewUrl ? (
          <div className="grid gap-3">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#10232b]/10 bg-[#f7f2eb]" style={{ aspectRatio: String(previewAspect) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="선택한 이미지 미리보기" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#5f7278]">
              <span className="font-medium text-[#10232b]">{selectedFileName}</span>
              <Button type="button" variant="ghost" size="sm" className="rounded-full px-3 text-[#143a46]" onClick={() => draftImage && setIsOpen(true)}>
                <Crop className="size-3.5" />
                다시 크롭
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#10232b]/14 bg-white/60 px-4 py-5 text-sm leading-7 text-[#5f7278]">
            {emptyLabel}
          </div>
        )}

        <p className="text-xs leading-6 text-[#5f7278]">{description}</p>
        {errorMessage ? <p className="text-sm text-[#8f3c2f]">{errorMessage}</p> : null}
      </div>

      <Dialog open={isOpen} onOpenChange={(nextOpen) => (!nextOpen ? handleCancel() : setIsOpen(nextOpen))}>
        <DialogContent className="max-w-3xl rounded-[1.75rem] border-white/60 bg-[#f8f4ee] p-0 sm:max-w-3xl" showCloseButton={false}>
          <DialogHeader className="gap-2 border-b border-[#10232b]/8 px-6 py-5">
            <DialogTitle className="text-lg text-[#10232b]">이미지 크롭</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#5f7278]">
              이미지를 드래그해 위치를 맞추고 확대해서 원하는 구도로 저장하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-3">
                <div
                  ref={viewportRef}
                  className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[1.75rem] border border-[#10232b]/10 bg-[#10232b] shadow-[0_18px_50px_rgba(10,29,35,0.18)]"
                  style={{ aspectRatio: String(aspectRatio) }}
                >
                  <div
                    className={cn("absolute inset-0 touch-none", dragState ? "cursor-grabbing" : "cursor-grab")}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {draftImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={draftImage.url}
                        alt="크롭 편집 이미지"
                        draggable={false}
                        className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
                        style={{
                          width: draftImage.width >= draftImage.height * aspectRatio ? "auto" : "100%",
                          height: draftImage.width >= draftImage.height * aspectRatio ? "100%" : "auto",
                          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${zoom})`,
                          transformOrigin: "center",
                        }}
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/15" />
                    <div className="pointer-events-none absolute inset-5 rounded-[1.25rem] border border-white/45" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#5f7278] uppercase">
                  <Move className="size-3.5" />
                  Drag to position
                </div>
              </div>

              <div className="grid gap-5 rounded-[1.5rem] border border-[#10232b]/8 bg-white/70 p-4">
                <div className="grid gap-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-[#5f7278] uppercase">비율</span>
                  <div className="flex flex-wrap gap-2">
                    {aspectOptions.map((option) => (
                      <Button
                        key={option.label}
                        type="button"
                        variant={Math.abs(option.value - aspectRatio) < 0.001 ? "default" : "outline"}
                        size="sm"
                        className="rounded-full px-3"
                        onClick={() => {
                          setAspect(option.value);
                          setZoom(1);
                          setOffsetX(0);
                          setOffsetY(0);
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-[#5f7278] uppercase">확대</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="accent-[#143a46]"
                  />
                  <span className="flex items-center gap-2 text-sm text-[#5f7278]">
                    <Search className="size-4" />
                    {zoom.toFixed(2)}x
                  </span>
                </label>

                <div className="rounded-[1.25rem] border border-[#10232b]/8 bg-[#f7f2eb]/80 px-3 py-3 text-sm leading-6 text-[#5f7278]">
                  기본 썸네일 비율은 {aspectOptions.find((option) => Math.abs(option.value - defaultAspect) < 0.001)?.label ?? "1:1"} 입니다.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="rounded-b-[1.75rem] border-t border-[#10232b]/8 bg-white/70">
            <Button type="button" variant="outline" className="rounded-2xl" onClick={handleCancel}>
              취소
            </Button>
            <Button type="button" className="rounded-2xl" onClick={handleApply} disabled={isApplying || !draftImage}>
              {isApplying ? "저장 중..." : "크롭 적용"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
