"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import {
  CharacterCard,
  CharacterProfileModal,
  toCharacterSummary,
  toRegistryCharacter,
} from "@/components/registry";
import { swrFetcher } from "@/lib/swr/fetcher";
import { useOffsetInfinite } from "@/lib/swr/use-offset-infinite";
import type {
  RegistryCharacterSummary,
  RegistryCharacter,
} from "@/components/registry";

type SummaryRow = Parameters<typeof toCharacterSummary>[0];
type DetailRow = Parameters<typeof toRegistryCharacter>[0];

const PAGE_LIMIT = 20;

export default function CharactersPage() {
  const {
    items: characters,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  } = useOffsetInfinite<SummaryRow>({
    baseUrl: "/api/characters",
    limit: PAGE_LIMIT,
    getItemId: (item) => item.id,
  });
  const mappedCharacters = useMemo(
    () => characters.map(toCharacterSummary),
    [characters],
  );

  /* 상세 모달 상태 */
  const [selected, setSelected] = useState<RegistryCharacterSummary | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { data: detailResult, error: detailError, isLoading: detailLoading } = useSWR<{ data: DetailRow }>(
    selected ? `/api/characters/${selected.id}` : null,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 1500 },
  );

  const detail = useMemo<RegistryCharacter | null>(() => {
    if (!selected || !detailResult?.data) return null;
    return {
      ...toRegistryCharacter(detailResult.data),
      isMine: selected.isMine,
    };
  }, [selected, detailResult]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const handleSelect = useCallback((character: RegistryCharacterSummary) => {
    setSelected(character);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <section className="pb-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="hud-label text-lg">REGISTRY // CITIZEN DATABASE</h1>
        {!loading && !error && (
          <p className="mt-1 hud-label text-text-secondary">
            TOTAL OPERATIVES: {mappedCharacters.length}
          </p>
        )}
      </div>

      {/* 로딩 — 전역 스피너(ApiActivityProvider)가 표시하므로 빈 영역만 확보 */}
      {loading && <div className="py-16" />}

      {/* 에러 */}
      {error && (
        <p className="text-center text-sm text-accent py-12">
          캐릭터 데이터를 불러오는 데 실패했습니다.
        </p>
      )}

      {/* 카드 그리드 */}
      {!loading && !error && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {mappedCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={handleSelect}
              />
            ))}
          </div>
          {hasMore && (
            <div
              ref={loadMoreRef}
              aria-hidden="true"
              className="mt-6 h-1 w-full"
            />
          )}
        </>
      )}

      {/* 빈 결과 */}
      {!loading && !error && mappedCharacters.length === 0 && (
        <p className="text-center text-sm text-text-secondary py-12">
          등록된 시민이 없습니다
        </p>
      )}

      {/* 상세 모달 */}
      {selected && (
        <CharacterProfileModal
          character={detail}
          loading={detailLoading}
          error={detailError instanceof Error ? detailError.message : null}
          open
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
