import Image from "next/image";

import { Badge, Card } from "@/components/ui";
import type { RegistryCharacter } from "./mock-registry-data";
import { ABILITY_CLASS_LABEL } from "./mock-registry-data";

const factionBadge = {
  bureau: { label: "BUREAU", variant: "info" as const },
  static: { label: "STATIC", variant: "danger" as const },
  civilian: { label: "비능력자", variant: "default" as const },
} as const;

interface CharacterCardProps {
  character: RegistryCharacter;
  onSelect: (character: RegistryCharacter) => void;
}

/** 캐릭터 카드 — 그리드 아이템 */
export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const badge = factionBadge[character.faction];

  return (
    <Card hud className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Image
          src={character.avatarUrl}
          alt={`${character.name} 아바타`}
          width={56}
          height={56}
          className="h-14 w-14 rounded-md border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text">{character.name}</p>
          {character.abilityClass && (
            <p className="text-xs text-text-secondary">
              {ABILITY_CLASS_LABEL[character.abilityClass]}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {character.isLeader && (
          <Badge variant="warning">LEADER</Badge>
        )}
      </div>

      <button
        type="button"
        className="mt-1 rounded-md border border-border px-3 py-2 text-sm text-text hover:border-primary hover:text-primary transition-colors"
        onClick={() => onSelect(character)}
        aria-label={`${character.name} 상세 보기`}
      >
        상세 보기
      </button>
    </Card>
  );
}
