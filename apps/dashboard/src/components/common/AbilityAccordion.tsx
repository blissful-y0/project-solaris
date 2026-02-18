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
  costHp?: number;
  costWill?: number;
  costAmount?: number;
  costType?: "will" | "hp";
};

type Faction = "bureau" | "static" | "defector";

type AbilityAccordionProps = {
  abilities: Ability[];
  faction?: Faction;
  className?: string;
};

/* ─── tier 한글 매핑 + 정렬 순서 ─── */
function getTierLabel(tier: Ability["tier"], faction?: Faction): string {
  if (tier === "basic") return "기본 스킬";
  if (tier === "mid") return "중급 스킬";
  /* 상급 스킬: 진영별 명칭 */
  if (faction === "bureau") return "하모닉스 프로토콜";
  if (faction === "static" || faction === "defector") return "오버드라이브";
  return "상급 스킬";
}

const tierOrder: Record<Ability["tier"], number> = {
  basic: 0,
  mid: 1,
  advanced: 2,
};

/* ─── cost 표시 포맷 ─── */
function formatCost(ability: Ability): string {
  const hp =
    typeof ability.costHp === "number"
      ? ability.costHp
      : ability.costType === "hp"
        ? (ability.costAmount ?? 0)
        : 0;
  const will =
    typeof ability.costWill === "number"
      ? ability.costWill
      : ability.costType === "will"
        ? (ability.costAmount ?? 0)
        : 0;

  if (hp > 0 && will > 0) return `HP ${hp} + WILL ${will}`;
  if (hp > 0) return `HP ${hp}`;
  if (will > 0) return `WILL ${will}`;
  return "—";
}

/** 능력 접힘/펼침 아코디언 */
export function AbilityAccordion({
  abilities,
  faction,
  className,
}: AbilityAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /** 기본기 → 중급기 → 상급기 순서로 정렬 */
  const sorted = [...abilities].sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
  );

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
      {sorted.map((ability, index) => {
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
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={ability.tier === "advanced" ? "info" : "default"}
                  size="sm"
                >
                  {getTierLabel(ability.tier, faction)}
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
                    variant={
                      (ability.costWill ?? 0) > 0 && (ability.costHp ?? 0) === 0
                        ? "info"
                        : "danger"
                    }
                    size="sm"
                  >
                    {formatCost(ability)}
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
