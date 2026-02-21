"use client";

import { useCallback, useMemo } from "react";

import { Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

import { LoreContent } from "./LoreContent";
import { CLEARANCE_CONFIG } from "./types";
import type { LoreDocumentHtml } from "./types";

type LoreDetailModalProps = {
  open: boolean;
  slug: string | null;
  contents: LoreDocumentHtml[];
  onClose: () => void;
  onNavigate: (slug: string) => void;
};

/** HELIOS 기밀문서 뷰어 — 클리어런스 등급별 분류 배너 + 문서 전문 */
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

  const cfg = CLEARANCE_CONFIG[doc.clearanceLevel];
  const codeDisplay = doc.slug.toUpperCase();

  /* 클리어런스별 배너 스타일 */
  const bannerClass: Record<1 | 2 | 3, string> = {
    1: "bg-emerald-400/10 border-b border-emerald-400/30 text-emerald-400",
    2: "bg-yellow-400/10 border-b border-yellow-400/30 text-yellow-400",
    3: "bg-accent/10 border-b border-accent/30 text-accent",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={`${doc.title} 기밀문서`}
      className="max-w-3xl"
    >
      {/* ── 클리어런스 배너 (sticky) ── */}
      <div
        className={cn(
          "sticky top-0 z-10 px-5 py-2.5 flex items-center gap-2",
          bannerClass[doc.clearanceLevel],
        )}
      >
        <span className="font-mono text-[0.625rem] tracking-widest select-none">
          ██████
        </span>
        <span className="font-mono text-[0.6875rem] tracking-widest font-semibold flex-1 text-center">
          CLEARANCE LEVEL {doc.clearanceLevel} — {cfg.label}
        </span>
        <span className="font-mono text-[0.625rem] tracking-widest select-none">
          ██████
        </span>
      </div>

      {/* ── 문서 식별 행 ── */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-border bg-bg-secondary/60">
        <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
        <span className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
          FILE_{String(currentIndex + 1).padStart(3, "0")}
        </span>
        <span className="text-border mx-0.5">·</span>
        <span className={cn("font-mono text-[0.625rem] tracking-wider", cfg.textColor)}>
          SECTION::{codeDisplay}
        </span>
        <span className="ml-auto font-mono text-[0.625rem] text-text-secondary tracking-wider">
          ACCESSED
        </span>
      </div>

      {/* ── 문서 본문 ── */}
      <div className="px-6 pt-6 pb-8">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-text mb-1">{doc.title}</h2>
        <div className={cn("h-px mb-5", cfg.bgColor, "opacity-30")} />

        {/* 콘텐츠 */}
        <LoreContent html={doc.html} className="first-heading-no-mt" />
      </div>

      {/* ── 하단 네비게이션 (sticky) ── */}
      <div className="sticky bottom-0 z-10 border-t border-border px-5 py-3 flex items-center bg-bg-secondary">
        <div className="flex-1 flex justify-start">
          {prevDoc ? (
            <button
              type="button"
              onClick={handlePrev}
              className="text-xs text-text-secondary hover:text-primary transition-colors text-left"
            >
              ← {prevDoc.title}
            </button>
          ) : (
            <span />
          )}
        </div>

        <span className="font-mono text-[0.6rem] text-border shrink-0 px-3">
          {currentIndex + 1} / {contents.length}
        </span>

        <div className="flex-1 flex justify-end">
          {nextDoc ? (
            <button
              type="button"
              onClick={handleNext}
              className="text-xs text-text-secondary hover:text-primary transition-colors text-right"
            >
              {nextDoc.title} →
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </Modal>
  );
}
