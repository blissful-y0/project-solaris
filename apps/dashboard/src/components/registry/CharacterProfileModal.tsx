"use client";

import Image from "next/image";

import { Badge, Modal, Skeleton } from "@/components/ui";
import { AbilityAccordion, StatBar } from "@/components/common";
import type { RegistryCharacter } from "./registry-data";
import { FACTION_FULL_NAME, ABILITY_CLASS_LABEL } from "./registry-data";

const factionBadgeVariant = {
  bureau: "info",
  static: "danger",
  defector: "warning",
} as const;

interface CharacterProfileModalProps {
  character: RegistryCharacter | null;
  loading?: boolean;
  error?: string | null;
  open: boolean;
  onClose: () => void;
}

/** 캐릭터 상세 프로필 모달 */
export function CharacterProfileModal({
  character,
  loading = false,
  error = null,
  open,
  onClose,
}: CharacterProfileModalProps) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="캐릭터 프로필">
      {error ? (
        <p className="text-center text-sm text-accent py-8">{error}</p>
      ) : loading || !character ? (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : (
        <CharacterDetail character={character} />
      )}
    </Modal>
  );
}

function CharacterDetail({ character }: { character: RegistryCharacter }) {
  const factionLabel = FACTION_FULL_NAME[character.faction];

  return (
    <>
      {/* 상단: 아바타 + 이름 + 소속 + 능력 계열 */}
      <div className="flex items-start gap-4">
        <Image
          src={character.avatarUrl}
          alt={`${character.name} 프로필`}
          width={96}
          height={96}
          className="h-24 w-24 rounded-lg border border-border object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-text">{character.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={factionBadgeVariant[character.faction]}>
              {factionLabel}
            </Badge>
            {character.abilityClass && (
              <Badge variant="default">
                {ABILITY_CLASS_LABEL[character.abilityClass]}
              </Badge>
            )}
            {character.isLeader && (
              <Badge variant="warning">LEADER</Badge>
            )}
          </div>
          {/* 공명율 */}
          <p className="mt-2 text-sm text-text-secondary">
            공명율: <span className="text-primary font-semibold">{character.resonanceRate}%</span>
          </p>
        </div>
      </div>

      {/* HP + WILL 게이지 */}
      <div className="mt-4 space-y-2">
        <StatBar
          current={character.hpCurrent}
          max={character.hpMax}
          variant="hp"
          label="HP"
        />
        <StatBar
          current={character.willCurrent}
          max={character.willMax}
          variant="will"
          label="WILL"
        />
      </div>

      {/* 능력 아코디언 */}
      <div className="mt-4">
        <AbilityAccordion abilities={character.abilities} />
      </div>

      {/* 외형 설명 */}
      <div className="mt-4">
        <h4 className="hud-label mb-1">외형</h4>
        <p className="text-sm text-text-secondary">{character.appearance}</p>
      </div>

      {/* 배경 서사 */}
      <div className="mt-4">
        <h4 className="hud-label mb-1">배경</h4>
        <p className="text-sm text-text-secondary">{character.backstory}</p>
      </div>
    </>
  );
}
