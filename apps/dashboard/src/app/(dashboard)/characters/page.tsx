"use client";

import { useMemo, useState } from "react";

import {
  CharacterSearchBar,
  CharacterFilterChips,
  CharacterCard,
  CharacterProfileModal,
  REGISTRY_CHARACTERS,
} from "@/components/registry";
import type { RegistryCharacter } from "@/components/registry";

export default function CharactersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [factionFilter, setFactionFilter] = useState("all");
  const [abilityFilter, setAbilityFilter] = useState("all");
  const [selected, setSelected] = useState<RegistryCharacter | null>(null);

  const filteredCharacters = useMemo(() => {
    let result = [...REGISTRY_CHARACTERS];

    /* 이름 검색 */
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    /* 소속 필터 */
    if (factionFilter !== "all") {
      result = result.filter((c) => c.faction === factionFilter);
    }

    /* 능력 계열 필터 */
    if (abilityFilter !== "all") {
      result = result.filter((c) => c.abilityClass === abilityFilter);
    }

    return result;
  }, [searchQuery, factionFilter, abilityFilter]);

  /* 소속 변경 시 능력 필터 초기화 */
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

      {/* 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* 빈 결과 */}
      {filteredCharacters.length === 0 && (
        <p className="text-center text-sm text-text-secondary py-12">
          검색 결과가 없습니다
        </p>
      )}

      {/* 상세 모달 */}
      {selected && (
        <CharacterProfileModal
          character={selected}
          open
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
