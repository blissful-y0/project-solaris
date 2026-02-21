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

/** HELIOS 터미널 stdout 스타일 문서 뷰어 */
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

  /* 클리어런스별 터미널 accent */
  const accent: Record<1 | 2 | 3, { text: string; bg: string }> = {
    1: { text: "text-emerald-400", bg: "bg-emerald-400" },
    2: { text: "text-yellow-400",  bg: "bg-yellow-400"  },
    3: { text: "text-accent",      bg: "bg-accent"      },
  };
  const { text: accentText, bg: accentBg } = accent[doc.clearanceLevel];

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={`${doc.title} 기밀문서`}
      className="max-w-3xl"
      closeButtonClassName="font-mono text-sm hover:text-primary"
    >
      {/* ── 상단 컬러 밴드 ── */}
      <div className={cn("-mx-4 -mt-4 h-1.5", accentBg)} />

      {/* ── cat 커맨드 라인 ── */}
      <div className="font-mono flex items-center gap-1.5 py-2.5 px-1 border-b border-border/40">
        <span className="text-primary text-xs">$</span>
        <span className="text-text-secondary text-xs">cat</span>
        <span className={cn("text-xs", accentText)}>
          /helios/archive/{doc.slug}.doc
        </span>
        <span className={cn("ml-auto text-xs animate-pulse leading-none", accentText)}>
          ▋
        </span>
      </div>

      {/* ── 파일 메타데이터 ── */}
      <div className="font-mono mt-4 space-y-0.5">
        <div className="flex gap-3 text-[0.6875rem]">
          <span className="text-text-secondary w-16 shrink-0">[FILE]</span>
          <span className={accentText}>
            FILE_{String(currentIndex + 1).padStart(3, "0")} / {doc.slug}
          </span>
        </div>
        <div className="flex gap-3 text-[0.6875rem]">
          <span className="text-text-secondary w-16 shrink-0">[CLASS]</span>
          <span className={accentText}>
            CLEARANCE LEVEL {doc.clearanceLevel} — {cfg.label}
          </span>
        </div>
        <div className="flex gap-3 text-[0.6875rem]">
          <span className="text-text-secondary w-16 shrink-0">[STATUS]</span>
          <span className="text-text-secondary">ACCESSED</span>
        </div>
      </div>

      {/* ── 구분선 ── */}
      <div className="font-mono text-[0.625rem] text-border mt-4 mb-5 select-none overflow-hidden whitespace-nowrap">
        {"─".repeat(80)}
      </div>

      {/* ── 문서 제목 ── */}
      <h2 className={cn("font-mono font-bold text-sm mb-4", accentText)}>
        # {doc.title}
      </h2>

      {/* ── 문서 본문 ── */}
      <LoreContent html={doc.html} />

      {/* ── 하단 구분선 + 네비게이션 ── */}
      <div className="font-mono text-[0.625rem] text-border mt-6 mb-3 select-none overflow-hidden whitespace-nowrap">
        {"─".repeat(80)}
      </div>

      <div className="font-mono flex items-center text-[0.6875rem]">
        <span className={cn("shrink-0 mr-3", accentText)}>
          [{currentIndex + 1}/{contents.length}]
        </span>
        <div className="flex-1 flex justify-start">
          {prevDoc ? (
            <button
              type="button"
              onClick={handlePrev}
              className="text-text-secondary hover:text-primary transition-colors"
            >
              ← {prevDoc.title}
            </button>
          ) : (
            <span className="text-border">← —</span>
          )}
        </div>
        <div className="flex-1 flex justify-end">
          {nextDoc ? (
            <button
              type="button"
              onClick={handleNext}
              className="text-text-secondary hover:text-primary transition-colors text-right"
            >
              {nextDoc.title} →
            </button>
          ) : (
            <span className="text-border text-right">— →</span>
          )}
        </div>
      </div>
    </Modal>
  );
}
