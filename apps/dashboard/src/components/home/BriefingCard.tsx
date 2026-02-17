import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { Briefing } from "./mock-briefings";
import { categoryVariant } from "./mock-briefings";

/** 카테고리별 좌측 보더 컬러 */
const borderColorMap: Record<Briefing["category"], string> = {
  전투: "border-l-accent",
  정보: "border-l-primary",
  세력: "border-l-secondary",
  사건: "border-l-warning",
  시스템: "border-l-success",
};

/** 카테고리별 호버 글로우 */
const hoverGlowMap: Record<Briefing["category"], string> = {
  전투: "hover:shadow-[0_0_8px_rgba(220,38,38,0.3)]",
  정보: "hover:shadow-[0_0_8px_rgba(0,212,255,0.3)]",
  세력: "hover:shadow-[0_0_8px_rgba(147,197,253,0.3)]",
  사건: "hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]",
  시스템: "hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]",
};

type BriefingCardProps = {
  briefing: Briefing;
};

export function BriefingCard({ briefing }: BriefingCardProps) {
  const relativeTime = formatDistanceToNow(new Date(briefing.timestamp), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <article
      className={cn(
        "border-l-2 pl-4 py-3 transition-all",
        borderColorMap[briefing.category],
        hoverGlowMap[briefing.category],
      )}
    >
      {/* 상단: 카테고리 + 상대시간 */}
      <div className="flex items-center gap-2 mb-1">
        <Badge variant={categoryVariant[briefing.category]} size="sm">
          {briefing.category}
        </Badge>
        <span className="text-[0.625rem] text-text-secondary">
          {relativeTime}
        </span>
      </div>

      {/* BULLETIN 번호 */}
      <p className="hud-label mb-1">{briefing.bulletinNumber}</p>

      {/* 타이틀 */}
      <h3 className="font-semibold text-text text-sm mb-1">
        {briefing.title}
      </h3>

      {/* 본문 */}
      <p className="text-sm text-text-secondary leading-relaxed">
        {briefing.content}
      </p>

      {/* 소스 */}
      <p className="hud-label mt-2">{briefing.source}</p>
    </article>
  );
}
