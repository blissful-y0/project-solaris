import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeMap: Record<AvatarSize, { css: string; px: number }> = {
  sm: { css: "w-8 h-8", px: 32 },
  md: { css: "w-12 h-12", px: 48 },
  lg: { css: "w-14 h-14", px: 56 },
};

type AvatarProps = {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
};

/** 원형 아바타 — 이미지 없으면 이니셜 폴백 */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name?.charAt(0) ?? "?";
  const { css, px } = sizeMap[size];

  return (
    <div
      className={cn(
        css,
        "relative isolate rounded-full shrink-0 overflow-hidden bg-bg-tertiary border border-border",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ""}
          width={px * 2}
          height={px * 2}
          sizes={`${px}px`}
          quality={90}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center w-full h-full font-medium text-text-secondary",
            size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm",
          )}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
