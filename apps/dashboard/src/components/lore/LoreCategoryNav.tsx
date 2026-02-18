"use client";

import { cn } from "@/lib/utils";

import { LORE_CATEGORIES } from "./types";
import type { LoreCategoryId } from "./types";

type LoreCategoryNavProps = {
  activeId: LoreCategoryId;
  onSelect: (id: LoreCategoryId) => void;
  className?: string;
};

/** 가로 스크롤 카테고리 필터 칩 */
export function LoreCategoryNav({
  activeId,
  onSelect,
  className,
}: LoreCategoryNavProps) {
  return (
    <nav
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-hide pb-2",
        className,
      )}
      aria-label="세계관 카테고리"
    >
      {LORE_CATEGORIES.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-bg"
                : "bg-bg-secondary/60 text-text-secondary border border-border hover:border-primary/40 hover:text-text",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </nav>
  );
}
