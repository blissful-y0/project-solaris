"use client";

import { useCallback, useMemo } from "react";

import { Modal } from "@/components/ui";

import { ClearanceBadge } from "./ClearanceBadge";
import { LoreContent } from "./LoreContent";
import type { LoreCategory, LoreCategoryContent, LoreCategoryId } from "./types";
import { LORE_CATEGORIES } from "./types";

type LoreDetailModalProps = {
  open: boolean;
  categoryId: LoreCategoryId | null;
  contents: LoreCategoryContent[];
  onClose: () => void;
  onNavigate: (id: LoreCategoryId) => void;
};

/** HELIOS 아카이브 상세 모달 — 선택한 카테고리 콘텐츠 + 이전/다음 네비게이션 */
export function LoreDetailModal({
  open,
  categoryId,
  contents,
  onClose,
  onNavigate,
}: LoreDetailModalProps) {
  const currentIndex = useMemo(
    () => LORE_CATEGORIES.findIndex((c) => c.id === categoryId),
    [categoryId],
  );

  const category: LoreCategory | undefined = LORE_CATEGORIES[currentIndex];
  const content = contents.find((c) => c.id === categoryId);

  const prevCategory: LoreCategory | undefined =
    currentIndex > 0 ? LORE_CATEGORIES[currentIndex - 1] : undefined;
  const nextCategory: LoreCategory | undefined =
    currentIndex < LORE_CATEGORIES.length - 1
      ? LORE_CATEGORIES[currentIndex + 1]
      : undefined;

  const handlePrev = useCallback(() => {
    if (prevCategory) onNavigate(prevCategory.id);
  }, [prevCategory, onNavigate]);

  const handleNext = useCallback(() => {
    if (nextCategory) onNavigate(nextCategory.id);
  }, [nextCategory, onNavigate]);

  if (!category) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={`${category.label} 아카이브`}
      className="max-w-2xl md:max-w-4xl"
    >
      {/* 헤더 */}
      <div className="border-b border-border px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-2 pr-6">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
            FILE_{String(currentIndex + 1).padStart(3, "0")} // ACCESSING
          </span>
          <ClearanceBadge level={category.clearanceLevel} className="ml-auto" />
        </div>
        <p className="font-mono text-[0.6875rem] text-primary tracking-wider mb-0.5">
          SECTION::{category.codeName}
        </p>
        <h2 className="text-base font-bold text-text">{category.label}</h2>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 pt-2 pb-4 max-h-[60dvh] overflow-y-auto">
        <LoreContent html={content?.html ?? ""} className="first-heading-no-mt" />
      </div>

      {/* 하단 네비게이션 */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        {prevCategory ? (
          <button
            type="button"
            onClick={handlePrev}
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            ← {prevCategory.label}
          </button>
        ) : (
          <span />
        )}
        {nextCategory ? (
          <button
            type="button"
            onClick={handleNext}
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            {nextCategory.label} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </Modal>
  );
}
