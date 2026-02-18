import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RedactedBlockProps = {
  children: ReactNode;
  className?: string;
};

/** ████ 스타일 검열 블록 — 텍스트를 시각적으로 숨기고 복사 방지 */
export function RedactedBlock({ children, className }: RedactedBlockProps) {
  return (
    <span
      className={cn(
        "bg-current text-transparent select-none rounded-sm px-1",
        className,
      )}
      aria-label="검열된 정보"
      title="CLASSIFIED"
    >
      {children}
    </span>
  );
}
