"use client";

import Image from "next/image";

import { Modal } from "@/components/ui";
import { AbilityAccordion, StatBar } from "@/components/common";
import { cn } from "@/lib/utils";
import type { RegistryCharacter } from "./registry-data";
import { ABILITY_CLASS_LABEL, FACTION_FULL_NAME } from "./registry-data";

const factionStyle = {
  bureau: {
    stripe: "bg-primary",
    labelClass: "text-primary",
    tag: "SOLARIS CITIZEN DOSSIER",
  },
  static: {
    stripe: "bg-accent",
    labelClass: "text-accent",
    tag: "UNREGISTERED ENTITY FILE",
  },
} as const;

/** defector는 static으로 표시 */
function getFactionStyle(faction: RegistryCharacter["faction"]) {
  if (faction === "defector") return factionStyle.static;
  return factionStyle[faction];
}

interface CharacterProfileModalProps {
  character: RegistryCharacter | null;
  loading?: boolean;
  error?: string | null;
  open: boolean;
  onClose: () => void;
}

/** 캐릭터 상세 프로필 모달 — 도시어 스타일 */
export function CharacterProfileModal({
  character,
  loading = false,
  error = null,
  open,
  onClose,
}: CharacterProfileModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel="캐릭터 프로필"
      className="max-w-2xl"
    >
      {error ? (
        <p className="text-center text-sm text-accent py-8">{error}</p>
      ) : loading || !character ? (
        /* 전역 스피너(ApiActivityProvider)가 표시하므로 빈 영역만 확보 */
        <div className="py-12" />
      ) : (
        <CharacterDetail character={character} />
      )}
    </Modal>
  );
}

function CharacterDetail({ character }: { character: RegistryCharacter }) {
  const style = getFactionStyle(character.faction);

  return (
    <div className="space-y-5">
      {/* 도시어 태그 */}
      <div className="flex items-center gap-3">
        <div className={cn("h-px flex-1", style.stripe, "opacity-30")} />
        <span className={cn("hud-label", style.labelClass)}>{style.tag}</span>
        <div className={cn("h-px flex-1", style.stripe, "opacity-30")} />
      </div>

      {/* 상단: 아바타 + 신상정보 */}
      <div className="flex gap-5">
        {/* 아바타 — 더 크게 */}
        <div className="shrink-0">
          <div
            className={cn(
              "overflow-hidden rounded-md border border-border p-0.5",
              style.stripe === "bg-primary"
                ? "border-primary/20"
                : "border-accent/20",
            )}
          >
            <Image
              src={character.avatarUrl}
              alt={`${character.name} 프로필`}
              width={160}
              height={200}
              className="h-[200px] w-[160px] rounded-sm object-cover"
            />
          </div>
        </div>

        {/* 신상정보 */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* 이름 + 리더 */}
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-text">{character.name}</h3>
            {character.isLeader && (
              <span
                className="shrink-0 rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider text-warning"
                aria-label="리더"
              >
                LEADER
              </span>
            )}
          </div>

          {/* 팩션 풀네임 */}
          <p
            className={cn(
              "text-xs font-medium tracking-wide",
              style.labelClass,
            )}
          >
            {FACTION_FULL_NAME[character.faction]}
          </p>

          <div className="h-px bg-border" />

          {/* 데이터 필드 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {character.abilityClass && (
              <DataField
                label="CLASS"
                value={ABILITY_CLASS_LABEL[character.abilityClass]}
              />
            )}
            {typeof character.age === "number" && (
              <DataField label="AGE" value={`${character.age}세`} />
            )}
            {character.gender && (
              <DataField label="GENDER" value={character.gender} />
            )}
            <DataField
              label="RESONANCE"
              value={`${character.resonanceRate}%`}
              valueClass="text-primary"
            />
            <DataField
              label="STATUS"
              value={character.hpCurrent > 0 ? "ACTIVE" : "INACTIVE"}
              valueClass={
                character.hpCurrent > 0 ? "text-success" : "text-accent"
              }
            />
          </div>

          {/* HP + WILL 게이지 */}
          <div className="space-y-2 pt-1">
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
        </div>
      </div>

      {/* 능력 개요 */}
      {(character.abilityName || character.abilities.length > 0) && (
        <div className="space-y-3">
          <h4 className="hud-label text-text-secondary mb-2 [font-size:1rem] font-bold">
            {character.abilityName
              ? `ABILITY — ${character.abilityName}`
              : "ABILITIES"}
          </h4>
          {character.abilityDescription && (
            <p className="text-sm text-text-secondary">
              {character.abilityDescription}
            </p>
          )}
          {character.abilityWeakness && (
            <div>
              <span className="text-xs text-text-secondary/60 uppercase tracking-wider">
                제약/약점
              </span>
              <p className="text-sm text-text-secondary mt-0.5">
                {character.abilityWeakness}
              </p>
            </div>
          )}
          {character.abilities.length > 0 && (
            <AbilityAccordion
              abilities={character.abilities}
              faction={character.faction}
            />
          )}
        </div>
      )}

      {/* 성격 */}
      {character.personality && (
        <div>
          <h4 className="hud-label text-xs font-semibold mb-1.5 [color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
            성격
          </h4>
          <PreLines text={character.personality} />
        </div>
      )}

      {/* 외형 */}
      {character.appearance && (
        <div>
          <h4 className="hud-label text-xs font-semibold mb-1.5 [color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
            외형
          </h4>
          <PreLines text={character.appearance} />
        </div>
      )}

      {/* 배경 서사 */}
      {character.backstory && (
        <div>
          <h4 className="hud-label text-xs font-semibold mb-1.5 [color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
            배경
          </h4>
          <PreLines text={character.backstory} />
        </div>
      )}

      {/* 기타 */}
      {character.notes && (
        <div>
          <h4 className="hud-label text-xs font-semibold mb-1.5 [color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
            기타
          </h4>
          <PreLines text={character.notes} />
        </div>
      )}
    </div>
  );
}

/** 줄바꿈 보존 텍스트 — \n\n 문단 간격을 본문 행간보다 좁게 */
function PreLines({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="flex flex-col gap-2 text-sm text-text-secondary leading-relaxed">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-line">
          {para}
        </p>
      ))}
    </div>
  );
}

/** 키-값 데이터 필드 */
function DataField({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <span className="hud-label text-text-secondary/60 text-[0.6rem]">
        {label}
      </span>
      <p className={cn("text-sm font-semibold", valueClass ?? "text-text")}>
        {value}
      </p>
    </div>
  );
}
