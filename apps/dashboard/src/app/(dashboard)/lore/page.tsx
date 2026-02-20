import { Suspense } from "react";
import { loadAllLoreContents, LorePageClient } from "@/components/lore";

/** 세계관 탭 — 서버 컴포넌트에서 마크다운 로드 후 클라이언트로 전달 */
export default async function WorldPage() {
  const contents = await loadAllLoreContents();

  return (
    <Suspense>
      <LorePageClient contents={contents} />
    </Suspense>
  );
}
