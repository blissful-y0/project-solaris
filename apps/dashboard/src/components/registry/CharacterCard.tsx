import Image from "next/image";

import { cn } from "@/lib/utils";
import type { RegistryCharacterSummary } from "./registry-data";
import { ABILITY_CLASS_LABEL } from "./registry-data";

const factionDossier = {
  bureau: { stripe: "bg-primary", label: "BUREAU", labelClass: "text-primary" },
  static: { stripe: "bg-accent", label: "STATIC", labelClass: "text-accent" },
  defector: { stripe: "bg-warning", label: "DEFECTOR", labelClass: "text-warning" },
} as const;

interface CharacterCardProps {
  character: RegistryCharacterSummary;
  onSelect: (character: RegistryCharacterSummary) => void;
}

/** 도시어 스타일 캐릭터 카드 */
export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  const dossier = factionDossier[character.faction];

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-lg",
        "bg-bg-secondary/80 border backdrop-blur-sm",
        "transition-colors duration-200",
        character.isMine ? "border-primary/20" : "border-border",
        "hover:border-primary/30",
        "hud-corners",
      )}
    >
      {/* 팩션 stripe */}
      <div className={cn("w-1 shrink-0", dossier.stripe)} />

      {/* 인물사진 */}
      <div className="shrink-0 p-3">
        <Image
          src={character.avatarUrl}
          alt={`${character.name} 아바타`}
          width={120}
          height={150}
          className="h-[150px] w-[120px] rounded-sm border border-border object-cover"
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pr-4">
        <div>
          {/* 이름 + LEADER */}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-text">
              {character.name}
            </h3>
            {character.isLeader && (
              <span className="shrink-0 text-xs text-warning" aria-label="리더">★</span>
            )}
          </div>

          {/* 팩션 + 능력 계열 */}
          <p className="mt-1 hud-label">
            <span className={dossier.labelClass}>{dossier.label}</span>
            {character.abilityClass && (
              <>
                <span className="mx-1.5 text-text-secondary/40">·</span>
                <span className="text-text-secondary">
                  {ABILITY_CLASS_LABEL[character.abilityClass]}
                </span>
              </>
            )}
          </p>

          {/* 구분선 */}
          <div className="my-2 h-px bg-border" />

          {/* 상태 필드 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="hud-label text-text-secondary">STATUS</span>
              <span className="hud-label text-success">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 상세 보기 버튼 */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="hud-label text-primary transition-colors hover:text-primary/80"
            onClick={() => onSelect(character)}
            aria-label={`${character.name} 상세 보기`}
          >
            상세 ▸
          </button>
        </div>
      </div>
    </article>
  );
}
