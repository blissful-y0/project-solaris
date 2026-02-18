"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

/* ─── 타입 ─── */
export type Ability = {
  tier: "basic" | "mid" | "advanced";
  name: string;
  description: string;
  weakness: string;
  costAmount: number;
  costType: "will" | "hp";
};

type AbilityAccordionProps = {
  abilities: Ability[];
  className?: string;
};

/* ─── tier 한글 매핑 ─── */
const tierLabel: Record<Ability["tier"], string> = {
  basic: "기본기",
  mid: "중급기",
  advanced: "상급기",
};

/* ─── cost 표시 포맷 ─── */
function formatCost(costType: Ability["costType"], costAmount: number): string {
  return `${costType === "will" ? "WILL" : "HP"} ${costAmount}`;
}

/** 능력 접힘/펼침 아코디언 */
export function AbilityAccordion({
  abilities,
  className,
}: AbilityAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (abilities.length === 0) {
    return (
      <div className={cn("text-sm text-text-secondary text-center py-4", className)}>
        등록된 능력이 없습니다
      </div>
    );
  }

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {abilities.map((ability, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={`${ability.tier}-${ability.name}`}
            className="border border-border rounded-lg bg-bg-secondary/60 overflow-hidden"
          >
            {/* 헤더 — 클릭으로 토글 */}
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={ability.tier === "advanced" ? "info" : "default"}
                  size="sm"
                >
                  {tierLabel[ability.tier]}
                </Badge>
                <span className="text-sm font-medium text-text">
                  {ability.name}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-text-secondary transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {/* 상세 내용 — 펼침 상태만 표시 */}
            {isOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-border">
                {/* 설명 */}
                <p className="text-sm text-text-secondary pt-3">
                  {ability.description}
                </p>

                {/* 약점 */}
                <div className="text-xs text-accent">
                  {ability.weakness}
                </div>

                {/* 코스트 */}
                <div className="flex justify-end">
                  <Badge
                    variant={ability.costType === "will" ? "info" : "danger"}
                    size="sm"
                  >
                    {formatCost(ability.costType, ability.costAmount)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
