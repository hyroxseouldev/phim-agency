"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Crop, Film, RotateCcw, Search } from "lucide-react";
import "react-easy-crop/react-easy-crop.css";
import { CroppedVideo } from "@/components/shared/cropped-video";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type MediaCrop, normalizeMediaCrop } from "@/lib/media-crop";
import { cn } from "@/lib/utils";

type AspectOption = {
  label: string;
  value: number;
};

type VideoCropInputProps = {
  id: string;
  name: string;
  cropName: string;
  accept?: string;
  className?: string;
  buttonLabel?: string;
  emptyLabel?: string;
  description?: string;
  existingVideoUrl?: string | null;
  existingCrop?: MediaCrop | null;
  defaultAspect?: number;
  aspectOptions?: AspectOption[];
};

type DraftVideo = {
  url: string;
  fileName: string;
  isLocal: boolean;
};

type MediaSize = {
  naturalWidth: number;
  naturalHeight: number;
};

const DEFAULT_ASPECT_OPTIONS: AspectOption[] = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

function serializeCrop(crop: MediaCrop | null) {
  return crop ? JSON.stringify(crop) : "";
}

export function VideoCropInput({
  id,
  name,
  cropName,
  accept = "video/mp4,.mp4",
  className,
  buttonLabel = "호버 영상 선택",
  emptyLabel = "호버 영상을 선택하고 카드에 맞는 구도를 저장하세요.",
  description = "영상은 원본 mp4로 업로드하고, 카드에 보일 구도만 저장합니다.",
  existingVideoUrl,
  existingCrop = null,
  defaultAspect = 1,
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
}: VideoCropInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const localVideoUrlsRef = useRef<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedLocalVideo, setAppliedLocalVideo] = useState<DraftVideo | null>(null);
  const [draftVideo, setDraftVideo] = useState<DraftVideo | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [currentCrop, setCurrentCrop] = useState<MediaCrop | null>(existingCrop);
  const [draftCropPercentages, setDraftCropPercentages] = useState<Area | null>(null);
  const [draftMediaSize, setDraftMediaSize] = useState<MediaSize | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(existingCrop?.aspectRatio ?? defaultAspect);
  const [errorMessage, setErrorMessage] = useState("");
  const aspectRatio = Number.isFinite(aspect) && aspect > 0 ? aspect : defaultAspect;
  const previewUrl = appliedLocalVideo?.url ?? existingVideoUrl ?? "";
  const previewCrop = appliedLocalVideo ? currentCrop : currentCrop ?? existingCrop;

  useEffect(() => {
    const localVideoUrls = localVideoUrlsRef;

    return () => {
      for (const url of localVideoUrls.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const openEditor = useCallback(
    (video: DraftVideo, nextCrop: MediaCrop | null) => {
      setDraftVideo(video);
      setDraftCropPercentages(nextCrop ? { x: nextCrop.x, y: nextCrop.y, width: nextCrop.width, height: nextCrop.height } : null);
      setDraftMediaSize(
        nextCrop
          ? {
              naturalWidth: nextCrop.mediaWidth,
              naturalHeight: nextCrop.mediaHeight,
            }
          : null,
      );
      setAspect(nextCrop?.aspectRatio ?? defaultAspect);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setErrorMessage("");
      setIsOpen(true);
    },
    [defaultAspect],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("video/")) {
        setErrorMessage("영상 파일만 선택할 수 있습니다.");
        event.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);
      localVideoUrlsRef.current.push(url);
      openEditor(
        {
          url,
          fileName: file.name,
          isLocal: true,
        },
        null,
      );
    },
    [openEditor],
  );

  const handleReset = useCallback(() => {
    setErrorMessage("");

    if (appliedLocalVideo) {
      setAppliedLocalVideo(null);
      setSelectedFileName("");
      setCurrentCrop(existingCrop);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    setCurrentCrop(null);
  }, [appliedLocalVideo, existingCrop]);

  const handleCancel = useCallback(() => {
    const shouldClearPendingLocalSelection = Boolean(draftVideo?.isLocal && draftVideo.url !== appliedLocalVideo?.url);

    setDraftVideo(null);
    setDraftCropPercentages(null);
    setDraftMediaSize(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsOpen(false);
    setErrorMessage("");

    if (shouldClearPendingLocalSelection && inputRef.current) {
      inputRef.current.value = "";
    } else if (!appliedLocalVideo && !existingVideoUrl && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [appliedLocalVideo, draftVideo, existingVideoUrl]);

  const handleApply = useCallback(() => {
    if (!draftVideo || !draftCropPercentages || !draftMediaSize) {
      return;
    }

    const nextCrop = normalizeMediaCrop({
      x: draftCropPercentages.x,
      y: draftCropPercentages.y,
      width: draftCropPercentages.width,
      height: draftCropPercentages.height,
      aspectRatio,
      mediaWidth: draftMediaSize.naturalWidth,
      mediaHeight: draftMediaSize.naturalHeight,
    });

    setCurrentCrop(nextCrop);
    setSelectedFileName(draftVideo.fileName);

    if (draftVideo.isLocal) {
      setAppliedLocalVideo(draftVideo);
    }

    setDraftVideo(null);
    setDraftCropPercentages(null);
    setDraftMediaSize(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsOpen(false);
    setErrorMessage("");
  }, [aspectRatio, draftCropPercentages, draftMediaSize, draftVideo]);

  const canEditExisting = useMemo(() => Boolean(previewUrl), [previewUrl]);
  const cropperKey = `${draftVideo?.url ?? "empty"}-${aspectRatio}-${draftCropPercentages ? "saved" : "fresh"}`;

  return (
    <>
      <input ref={inputRef} id={id} name={name} type="file" accept={accept} className="sr-only" onChange={handleFileChange} />
      <input type="hidden" name={cropName} value={serializeCrop(currentCrop)} />

      <div className={cn("grid gap-3", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" className="h-11 rounded-2xl bg-white/80 px-4 text-[#10232b] shadow-[0_12px_30px_rgba(10,29,35,0.08)] hover:bg-white" onClick={openPicker}>
            <Film className="size-4" />
            {buttonLabel}
          </Button>
          {canEditExisting ? (
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-2xl px-4 text-[#143a46]"
              onClick={() =>
                openEditor(
                  {
                    url: previewUrl,
                    fileName: selectedFileName || "현재 호버 영상",
                    isLocal: Boolean(appliedLocalVideo),
                  },
                  currentCrop,
                )
              }
            >
              <Crop className="size-4" />
              크롭 조정
            </Button>
          ) : null}
          {(appliedLocalVideo || currentCrop) ? (
            <Button type="button" variant="ghost" className="h-11 rounded-2xl px-4 text-[#5f7278]" onClick={handleReset}>
              <RotateCcw className="size-4" />
              초기화
            </Button>
          ) : null}
        </div>

        {previewUrl ? (
          <div className="grid gap-3">
            <CroppedVideo
              src={previewUrl}
              crop={previewCrop}
              muted
              loop
              playsInline
              autoPlay
              controls
              preload="metadata"
              className="aspect-square rounded-[1.5rem] bg-[#10232b] shadow-[0_18px_45px_rgba(10,29,35,0.12)]"
            />
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#5f7278]">
              <span className="font-medium text-[#10232b]">{selectedFileName || (appliedLocalVideo ? "선택한 영상" : "현재 호버 영상")}</span>
              {previewCrop ? <span>크롭 저장됨</span> : <span>기본 구도</span>}
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
            <DialogTitle className="text-lg text-[#10232b]">영상 크롭</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#5f7278]">
              카드에 보일 장면만 저장합니다. 원본 mp4 파일은 그대로 업로드됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-3">
                <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[1.75rem] bg-[#10232b] shadow-[0_18px_50px_rgba(10,29,35,0.18)]" style={{ aspectRatio: String(aspectRatio) }}>
                  {draftVideo ? (
                    <Cropper
                      key={cropperKey}
                      video={draftVideo.url}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspectRatio}
                      minZoom={1}
                      maxZoom={3}
                      showGrid
                      objectFit="contain"
                      cropShape="rect"
                      zoomWithScroll
                      initialCroppedAreaPercentages={draftCropPercentages ?? undefined}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(croppedArea) => setDraftCropPercentages(croppedArea)}
                      onMediaLoaded={(mediaSize) =>
                        setDraftMediaSize({
                          naturalWidth: mediaSize.naturalWidth,
                          naturalHeight: mediaSize.naturalHeight,
                        })
                      }
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
                  Hover card preview
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
                          setDraftCropPercentages(null);
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
                  프로젝트 카드 기준 기본 비율은 {aspectOptions.find((option) => Math.abs(option.value - defaultAspect) < 0.001)?.label ?? "1:1"} 입니다.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="rounded-b-[1.75rem] bg-white/70">
            <Button type="button" variant="ghost" className="rounded-2xl text-[#5f7278] hover:bg-white/80" onClick={handleCancel}>
              취소
            </Button>
            <Button type="button" className="rounded-2xl" onClick={handleApply} disabled={!draftVideo || !draftCropPercentages || !draftMediaSize}>
              크롭 적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
