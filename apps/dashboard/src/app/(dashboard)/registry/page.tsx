"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingSpinner } from "@/components/ui";
import {
  CharacterCard,
  CharacterProfileModal,
  toCharacterSummary,
  toRegistryCharacter,
} from "@/components/registry";
import type {
  RegistryCharacterSummary,
  RegistryCharacter,
} from "@/components/registry";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<RegistryCharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 상세 모달 상태 */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RegistryCharacter | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  /* 상세 fetch race condition 방어 */
  const latestRequestRef = useRef(0);

  /* 목록 fetch — AbortController로 언마운트 시 취소 */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCharacters() {
      try {
        const res = await fetch("/api/characters", { signal: controller.signal });
        if (!res.ok) {
          throw new Error("캐릭터 데이터를 불러오는 데 실패했습니다.");
        }
        const json = await res.json();
        const mapped = (json.data ?? []).map(toCharacterSummary);
        setCharacters(mapped);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
    return () => controller.abort();
  }, []);

  /* 상세 fetch — stale 요청 방어 */
  const handleSelect = useCallback(async (character: RegistryCharacterSummary) => {
    const requestId = ++latestRequestRef.current;
    setSelectedId(character.id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/characters/${character.id}`);
      if (!res.ok) {
        throw new Error("캐릭터 상세 정보를 불러올 수 없습니다.");
      }
      if (requestId !== latestRequestRef.current) return;
      const json = await res.json();
      setDetail({ ...toRegistryCharacter(json.data), isMine: character.isMine });
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;
      setDetail(null);
      setDetailError(
        err instanceof Error
          ? err.message
          : "상세 정보를 불러올 수 없습니다.",
      );
    } finally {
      if (requestId === latestRequestRef.current) {
        setDetailLoading(false);
      }
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    latestRequestRef.current++; // 기존 요청 무효화
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  }, []);

  return (
    <section className="pb-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="hud-label text-lg">REGISTRY // CITIZEN DATABASE</h1>
        {!loading && !error && (
          <p className="mt-1 hud-label text-text-secondary">
            TOTAL OPERATIVES: {characters.length}
          </p>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="py-16">
          <LoadingSpinner label="시민 데이터를 불러오는 중..." />
        </div>
      )}

      {/* 에러 */}
      {error && (
        <p className="text-center text-sm text-accent py-12">{error}</p>
      )}

      {/* 카드 그리드 */}
      {!loading && !error && (
        <div className="grid gap-4 lg:grid-cols-2">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && !error && characters.length === 0 && (
        <p className="text-center text-sm text-text-secondary py-12">
          등록된 시민이 없습니다
        </p>
      )}

      {/* 상세 모달 */}
      {selectedId && (
        <CharacterProfileModal
          character={detail}
          loading={detailLoading}
          error={detailError}
          open
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
