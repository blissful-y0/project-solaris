"use client";

import { useCallback, useMemo } from "react";

import { Modal } from "@/components/ui";

import { ClearanceBadge } from "./ClearanceBadge";
import { LoreContent } from "./LoreContent";
import type { LoreDocumentHtml } from "./types";

type LoreDetailModalProps = {
  open: boolean;
  slug: string | null;
  contents: LoreDocumentHtml[];
  onClose: () => void;
  onNavigate: (slug: string) => void;
};

/** HELIOS 아카이브 상세 모달 — 선택한 문서 콘텐츠 + 이전/다음 네비게이션 */
export function LoreDetailModal({
  open,
  slug,
  contents,
  onClose,
  onNavigate,
}: LoreDetailModalProps) {
  const currentIndex = useMemo(
    () => contents.findIndex((c) => c.slug === slug),
    [contents, slug],
  );

  const doc: LoreDocumentHtml | undefined = contents[currentIndex];

  const prevDoc: LoreDocumentHtml | undefined =
    currentIndex > 0 ? contents[currentIndex - 1] : undefined;
  const nextDoc: LoreDocumentHtml | undefined =
    currentIndex < contents.length - 1 ? contents[currentIndex + 1] : undefined;

  const handlePrev = useCallback(() => {
    if (prevDoc) onNavigate(prevDoc.slug);
  }, [prevDoc, onNavigate]);

  const handleNext = useCallback(() => {
    if (nextDoc) onNavigate(nextDoc.slug);
  }, [nextDoc, onNavigate]);

  if (!open || !doc) return null;

  const codeDisplay = doc.slug.toUpperCase().replace(/-/g, "-");

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={`${doc.title} 아카이브`}
      className="max-w-2xl md:max-w-4xl"
    >
      {/* 헤더 */}
      <div className="border-b border-border px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-2 pr-6">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
            FILE_{String(currentIndex + 1).padStart(3, "0")} // ACCESSING
          </span>
          <ClearanceBadge level={doc.clearanceLevel} className="ml-auto" />
        </div>
        <p className="font-mono text-[0.6875rem] text-primary tracking-wider mb-0.5">
          SECTION::{codeDisplay}
        </p>
        <h2 className="text-base font-bold text-text">{doc.title}</h2>
      </div>

      {/* 콘텐츠 */}
      <div className="px-4 pt-2 pb-4 max-h-[60dvh] overflow-y-auto">
        <LoreContent html={doc.html} className="first-heading-no-mt" />
      </div>

      {/* 하단 네비게이션 */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        {prevDoc ? (
          <button
            type="button"
            onClick={handlePrev}
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            ← {prevDoc.title}
          </button>
        ) : (
          <span />
        )}
        {nextDoc ? (
          <button
            type="button"
            onClick={handleNext}
            className="text-xs text-text-secondary hover:text-primary transition-colors"
          >
            {nextDoc.title} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </Modal>
  );
}
