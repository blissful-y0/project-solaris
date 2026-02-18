"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui";
import {
  CharacterSearchBar,
  CharacterFilterChips,
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

  const [searchQuery, setSearchQuery] = useState("");
  const [factionFilter, setFactionFilter] = useState("all");
  const [abilityFilter, setAbilityFilter] = useState("all");

  /* 상세 모달 상태 */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RegistryCharacter | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  /* 목록 fetch */
  useEffect(() => {
    async function fetchCharacters() {
      try {
        const res = await fetch("/api/characters");
        if (!res.ok) {
          throw new Error("캐릭터 데이터를 불러오는 데 실패했습니다.");
        }
        const json = await res.json();
        const mapped = (json.data ?? []).map(toCharacterSummary);
        setCharacters(mapped);
      } catch (err) {
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
  }, []);

  /* 상세 fetch */
  const handleSelect = useCallback(async (character: RegistryCharacterSummary) => {
    setSelectedId(character.id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/characters/${character.id}`);
      if (!res.ok) {
        throw new Error("캐릭터 상세 정보를 불러올 수 없습니다.");
      }
      const json = await res.json();
      setDetail({ ...toRegistryCharacter(json.data), isMine: character.isMine });
    } catch (err) {
      setDetail(null);
      setDetailError(
        err instanceof Error
          ? err.message
          : "상세 정보를 불러올 수 없습니다.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  }, []);

  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (factionFilter !== "all") {
      result = result.filter((c) => c.faction === factionFilter);
    }

    if (abilityFilter !== "all") {
      result = result.filter((c) => c.abilityClass === abilityFilter);
    }

    return result;
  }, [characters, searchQuery, factionFilter, abilityFilter]);

  function handleFactionChange(value: string) {
    setFactionFilter(value);
    setAbilityFilter("all");
  }

  return (
    <section className="py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="hud-label text-lg">REGISTRY // CITIZEN DATABASE</h1>
      </div>

      {/* 검색 + 필터 */}
      <CharacterSearchBar value={searchQuery} onChange={setSearchQuery} className="mb-4" />
      <CharacterFilterChips
        factionFilter={factionFilter}
        abilityFilter={abilityFilter}
        onFactionChange={handleFactionChange}
        onAbilityChange={setAbilityFilter}
        className="mb-6"
      />

      {/* 로딩 */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {error && (
        <p className="text-center text-sm text-accent py-12">{error}</p>
      )}

      {/* 카드 그리드 */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && !error && filteredCharacters.length === 0 && (
        <p className="text-center text-sm text-text-secondary py-12">
          {characters.length === 0
            ? "등록된 시민이 없습니다"
            : "검색 결과가 없습니다"}
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
