"use client";

import { cn } from "@/lib/utils";

import { ClearanceBadge } from "./ClearanceBadge";
import type { LoreCategory } from "./types";
import { CLEARANCE_CONFIG } from "./types";

type LoreArchiveCardProps = {
  category: LoreCategory;
  index: number;
  onClick: () => void;
  className?: string;
};

/** HELIOS 아카이브 파일 엔트리 카드 */
export function LoreArchiveCard({
  category,
  index,
  onClick,
  className,
}: LoreArchiveCardProps) {
  const config = CLEARANCE_CONFIG[category.clearanceLevel];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col text-left rounded-lg border border-border bg-bg-secondary/80",
        "hover:border-primary/40 hover:glow-cyan cursor-pointer transition-all group overflow-hidden hud-corners",
        className,
      )}
      aria-label={`${category.label} 열람`}
    >
      {/* 좌측 클리어런스 스트라이프 */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", config.bgColor)} />

      <div className="pl-4 pr-3 pt-3 pb-3 flex flex-col gap-2">
        {/* 상단: 인덱스 + 기밀 등급 */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.625rem] text-text-secondary">
            FILE_{String(index + 1).padStart(3, "0")}
          </span>
          <ClearanceBadge level={category.clearanceLevel} />
        </div>

        {/* 코드네임 */}
        <p className={cn("font-mono text-[0.6875rem] tracking-wider", config.textColor)}>
          {category.codeName}
        </p>

        {/* 카테고리명 */}
        <h3 className="text-sm font-bold text-text">{category.label}</h3>

        {/* 설명 */}
        <p className="text-xs text-text-secondary leading-relaxed">
          {category.description}
        </p>

        {/* 하단 CTA */}
        <div className="mt-auto pt-2 border-t border-border/60">
          <span className="font-mono text-[0.625rem] text-primary group-hover:tracking-wider transition-all">
            OPEN FILE →
          </span>
        </div>
      </div>
    </button>
  );
}
