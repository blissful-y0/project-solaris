"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

import { LoreArchiveCard } from "./LoreArchiveCard";
import { LoreDetailModal } from "./LoreDetailModal";
import type { LoreCategoryContent, LoreCategoryId } from "./types";
import { LORE_CATEGORIES } from "./types";

type ArchiveTab = "database" | "incident-log";

type LorePageClientProps = {
  contents: LoreCategoryContent[];
};

/** Lore 페이지 — HELIOS 풀스크린 터미널 + 모달 상세 */
export function LorePageClient({ contents }: LorePageClientProps) {
  const [activeTab, setActiveTab] = useState<ArchiveTab>("database");
  const [selectedId, setSelectedId] = useState<LoreCategoryId | null>(null);

  const handleSelect = useCallback((id: LoreCategoryId) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col flex-1 z-10",
          "-mt-6 md:mt-0",
          "md:h-[calc(100dvh-8rem)] md:min-h-[600px] md:border md:border-border md:rounded-lg md:overflow-hidden md:bg-bg-secondary/20",
        )}
      >
        {/* 터미널 타이틀 바 — 데스크탑 전용 */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent/60" />
              <span className="size-2.5 rounded-full bg-yellow-400/60" />
              <span className="size-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="font-mono text-xs text-text-secondary tracking-wider">
              HELIOS ARCHIVE v2.1
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[0.625rem] text-primary tracking-wider">
              CONNECTED
            </span>
          </div>
        </div>

        {/* 탭 바 — 모바일: 전체 폭 헤더 / 데스크탑: 터미널 내부 */}
        <div className="-mx-4 md:mx-0 flex border-b border-border bg-bg-secondary/50 px-4 md:px-2">
          <button
            type="button"
            onClick={() => setActiveTab("database")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-wider transition-colors border-b-2 -mb-px",
              activeTab === "database"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text",
            )}
          >
            <span className="opacity-60">&gt;</span> DATABASE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("incident-log")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 font-mono text-xs tracking-wider transition-colors border-b-2 -mb-px",
              activeTab === "incident-log"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text",
            )}
          >
            <span className="opacity-60">&gt;</span> INCIDENT LOG
          </button>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 md:overflow-y-auto">
          {activeTab === "database" && (
            <div className="p-4 md:p-6 space-y-4">
              <p className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
                ACCESS GRANTED — 접근 권한에 따라 일부 정보가 제한됩니다
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {LORE_CATEGORIES.map((cat, i) => (
                  <LoreArchiveCard
                    key={cat.id}
                    category={cat}
                    index={i}
                    onClick={() => handleSelect(cat.id)}
                    className="h-full"
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "incident-log" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 px-4">
              <p className="font-mono text-xs text-text-secondary tracking-wider">
                INCIDENT LOG — NO RECORDS AVAILABLE
              </p>
              <p className="text-xs text-text-secondary">
                시즌 기록은 추후 공개됩니다
              </p>
            </div>
          )}
        </div>

        {/* 하단 상태 바 — 데스크탑 전용 */}
        <div className="hidden md:flex items-center justify-between px-4 py-1.5 bg-bg-secondary border-t border-border">
          <span className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
            {LORE_CATEGORIES.length} FILES INDEXED
          </span>
          <span className="font-mono text-[0.625rem] text-text-secondary tracking-wider">
            HELIOS INTELLIGENCE SYSTEM
          </span>
        </div>
      </div>

      {/* 상세 모달 — fixed 컨테이너 밖에서 렌더링 */}
      <LoreDetailModal
        open={selectedId !== null}
        categoryId={selectedId}
        contents={contents}
        onClose={handleClose}
        onNavigate={handleSelect}
      />
    </>
  );
}
