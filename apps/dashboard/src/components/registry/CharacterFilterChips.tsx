"use client";

import { FilterChips } from "@/components/ui";
import { FACTION_OPTIONS, ABILITY_OPTIONS } from "./registry-data";

interface CharacterFilterChipsProps {
  factionFilter: string;
  abilityFilter: string;
  onFactionChange: (value: string) => void;
  onAbilityChange: (value: string) => void;
  className?: string;
}

/** 소속 필터 + 능력 계열 서브필터 */
export function CharacterFilterChips({
  factionFilter,
  abilityFilter,
  onFactionChange,
  onAbilityChange,
  className,
}: CharacterFilterChipsProps) {
  const showAbilityFilter = factionFilter !== "all";

  return (
    <div className={className}>
      {/* 소속 필터 */}
      <FilterChips
        options={[...FACTION_OPTIONS]}
        selected={factionFilter}
        onChange={onFactionChange}
      />

      {/* 능력 계열 서브필터 */}
      {showAbilityFilter && (
        <FilterChips
          options={[...ABILITY_OPTIONS]}
          selected={abilityFilter}
          onChange={onAbilityChange}
          className="mt-2"
        />
      )}
    </div>
  );
}
