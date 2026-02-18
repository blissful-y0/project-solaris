import { Suspense } from "react";
import { loadAllLoreContents, LorePageClient } from "@/components/lore";
import type { LoreCategoryId } from "@/components/lore";

type WorldPageProps = {
  searchParams: Promise<{ category?: string }>;
};

/** 세계관 탭 — 서버 컴포넌트에서 마크다운 로드 후 클라이언트로 전달 */
export default async function WorldPage({ searchParams }: WorldPageProps) {
  const params = await searchParams;
  const contents = await loadAllLoreContents();
  const initialCategory = (params?.category as LoreCategoryId) || "overview";

  return (
    <Suspense>
      <LorePageClient contents={contents} initialCategory={initialCategory} />
    </Suspense>
  );
}
