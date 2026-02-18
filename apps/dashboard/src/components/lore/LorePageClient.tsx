"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { RedactedBlock } from "@/components/common";

import { LoreCategoryNav } from "./LoreCategoryNav";
import { LoreContent } from "./LoreContent";
import { LoreCTA } from "./LoreCTA";
import type { LoreCategoryContent, LoreCategoryId } from "./types";
import { LORE_CATEGORIES } from "./types";

type LorePageClientProps = {
  contents: LoreCategoryContent[];
  initialCategory?: LoreCategoryId;
};

/** 유효한 카테고리 ID인지 검증 */
function isValidCategory(id: string): id is LoreCategoryId {
  return LORE_CATEGORIES.some((c) => c.id === id);
}

/** Lore 페이지 클라이언트 — searchParams 동기화 + 카테고리 전환 */
export function LorePageClient({
  contents,
  initialCategory = "overview",
}: LorePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* URL에서 초기 카테고리 결정 */
  const paramCategory = searchParams.get("category");
  const resolvedInitial =
    paramCategory && isValidCategory(paramCategory)
      ? paramCategory
      : initialCategory;

  const [activeId, setActiveId] = useState<LoreCategoryId>(resolvedInitial);

  const handleSelect = useCallback(
    (id: LoreCategoryId) => {
      setActiveId(id);
      /* URL searchParams 업데이트 (shallow navigation) */
      const params = new URLSearchParams(searchParams.toString());
      if (id === "overview") {
        params.delete("category");
      } else {
        params.set("category", id);
      }
      const query = params.toString();
      router.replace(query ? `/world?${query}` : "/world", { scroll: false });
    },
    [router, searchParams],
  );

  const activeContent = contents.find((c) => c.id === activeId);

  return (
    <section className="py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <p className="hud-label mb-1">LORE // CLASSIFIED ARCHIVE</p>
        <h1 className="text-xl font-bold text-text">
          솔라리스 세계관 아카이브
        </h1>
      </div>

      {/* 카테고리 네비게이션 */}
      <LoreCategoryNav activeId={activeId} onSelect={handleSelect} />

      {/* 검열 안내 */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <RedactedBlock>기밀 데이터</RedactedBlock>
        <span>
          — 일부 정보는{" "}
          <span className="text-accent font-medium">CLASSIFIED</span> 처리되어
          열람이 제한됩니다.
        </span>
      </div>

      {/* 콘텐츠 영역 */}
      <LoreContent html={activeContent?.html ?? ""} />

      {/* 하단 CTA */}
      <LoreCTA className="mt-8" />
    </section>
  );
}
