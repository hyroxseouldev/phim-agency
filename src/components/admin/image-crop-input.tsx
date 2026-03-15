"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Crop, ImagePlus, RotateCcw, Search } from "lucide-react";
import "react-easy-crop/react-easy-crop.css";
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
  outputWidth?: number;
};

type LoadedImage = {
  url: string;
  width: number;
  height: number;
  file: File;
};

const DEFAULT_ASPECT_OPTIONS: AspectOption[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

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
  croppedAreaPixels,
  outputWidth,
}: {
  loadedImage: LoadedImage;
  croppedAreaPixels: Area;
  outputWidth?: number;
}) {
  const image = new window.Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("이미지를 자르지 못했습니다."));
    image.src = loadedImage.url;
  });

  const targetAspect = croppedAreaPixels.width / croppedAreaPixels.height;
  const resolvedOutputWidth = Math.max(1, Math.round(outputWidth ?? croppedAreaPixels.width));
  const resolvedOutputHeight = Math.max(1, Math.round(resolvedOutputWidth / targetAspect));
  const canvas = document.createElement("canvas");

  canvas.width = resolvedOutputWidth;
  canvas.height = resolvedOutputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 편집 캔버스를 초기화하지 못했습니다.");
  }

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

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
  description = "크롭 영역을 조정하고 확대해서 저장할 수 있습니다.",
  defaultAspect = 1,
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
  outputWidth,
}: ImageCropInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
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
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [aspect, setAspect] = useState(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const aspectRatio = Number.isFinite(aspect) && aspect > 0 ? aspect : defaultAspect;

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

  const resetDraft = useCallback(
    (image: LoadedImage) => {
      setDraftImage(image);
      setAspect(defaultAspect);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
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
    setCrop({ x: 0, y: 0 });
    setAspect(defaultAspect);
    setCroppedAreaPixels(null);
    setErrorMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [defaultAspect, draftImage, loadedImage]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [draftImage, loadedImage, resetDraft],
  );

  const handleApply = useCallback(async () => {
    if (!draftImage || !inputRef.current || !croppedAreaPixels) {
      return;
    }

    setIsApplying(true);
    setErrorMessage("");

    try {
      const croppedFile = await createCroppedFile({
        loadedImage: draftImage,
        croppedAreaPixels,
        outputWidth,
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
  }, [aspectRatio, croppedAreaPixels, draftImage, loadedImage, outputWidth]);

  const handleCancel = useCallback(() => {
    if (draftImage && draftImage !== loadedImage) {
      URL.revokeObjectURL(draftImage.url);
    }

    setDraftImage(loadedImage);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsOpen(false);
    setErrorMessage("");

    if (!loadedImage && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [draftImage, loadedImage]);

  return (
    <>
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} required={required} className="sr-only" onChange={handleFileChange} />

      <div className={cn("grid gap-3", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" className="h-11 rounded-2xl bg-white/80 px-4 text-[#10232b] shadow-[0_12px_30px_rgba(10,29,35,0.08)] hover:bg-white" onClick={openPicker}>
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
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#f7f2eb] shadow-[0_18px_45px_rgba(10,29,35,0.08)]" style={{ aspectRatio: String(previewAspect) }}>
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
          <div className="rounded-[1.5rem] bg-white/60 px-4 py-5 text-sm leading-7 text-[#5f7278] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
            {emptyLabel}
          </div>
        )}

        <p className="text-xs leading-6 text-[#5f7278]">{description}</p>
        {errorMessage ? <p className="text-sm text-[#8f3c2f]">{errorMessage}</p> : null}
      </div>

      <Dialog open={isOpen} onOpenChange={(nextOpen) => (!nextOpen ? handleCancel() : setIsOpen(nextOpen))}>
        <DialogContent className="max-w-3xl rounded-[1.75rem] bg-[#f8f4ee] p-0 shadow-[0_30px_90px_rgba(10,29,35,0.18)] sm:max-w-3xl" showCloseButton={false}>
          <DialogHeader className="gap-2 px-6 py-5">
            <DialogTitle className="text-lg text-[#10232b]">이미지 크롭</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#5f7278]">
              크롭 박스를 기준으로 저장됩니다. 이미지를 움직이고 확대해서 잘라낼 구도를 맞추세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-3">
                <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[1.75rem] bg-[#10232b] shadow-[0_18px_50px_rgba(10,29,35,0.18)]" style={{ aspectRatio: String(aspectRatio) }}>
                  {draftImage ? (
                    <Cropper
                      image={draftImage.url}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspectRatio}
                      minZoom={1}
                      maxZoom={3}
                      showGrid
                      objectFit="contain"
                      cropShape="rect"
                      zoomWithScroll
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                      style={{
                        containerStyle: {
                          backgroundColor: "#10232b",
                        },
                        cropAreaStyle: {
                          border: "1px solid rgba(255,255,255,0.65)",
                          boxShadow: "0 0 0 9999px rgba(7,16,20,0.52)",
                        },
                      }}
                    />
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#5f7278] uppercase">
                  <Crop className="size-3.5" />
                  Crop area preview
                </div>
              </div>

              <div className="grid gap-5 rounded-[1.5rem] bg-white/70 p-4 shadow-[0_16px_40px_rgba(10,29,35,0.06)]">
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
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setCroppedAreaPixels(null);
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

                <div className="rounded-[1.25rem] bg-[#f7f2eb]/80 px-3 py-3 text-sm leading-6 text-[#5f7278] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]">
                  기본 썸네일 비율은 {aspectOptions.find((option) => Math.abs(option.value - defaultAspect) < 0.001)?.label ?? "1:1"} 입니다.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="rounded-b-[1.75rem] bg-white/70">
            <Button type="button" variant="ghost" className="rounded-2xl text-[#5f7278] hover:bg-white/80" onClick={handleCancel}>
              취소
            </Button>
            <Button type="button" className="rounded-2xl" onClick={handleApply} disabled={isApplying || !draftImage || !croppedAreaPixels}>
              {isApplying ? "저장 중..." : "크롭 적용"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
