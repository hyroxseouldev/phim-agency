import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { type MediaCrop, getCroppedVideoStyles } from "@/lib/media-crop";

type CroppedVideoProps = Omit<ComponentProps<"video">, "src"> & {
  src: string;
  crop?: MediaCrop | null;
  className?: string;
  videoClassName?: string;
};

export function CroppedVideo({ src, crop = null, className, videoClassName, ...props }: CroppedVideoProps) {
  const { containerStyle, videoStyle } = getCroppedVideoStyles(crop);

  return (
    <div className={cn("relative overflow-hidden", className)} style={containerStyle}>
      <video
        {...props}
        src={src}
        className={cn("h-full w-full object-cover", crop ? undefined : "absolute inset-0", videoClassName)}
        style={crop ? { ...videoStyle, ...props.style } : props.style}
      />
    </div>
  );
}
