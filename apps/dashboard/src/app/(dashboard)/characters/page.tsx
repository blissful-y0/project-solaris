"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { Badge, Card, Modal } from "@/components/ui";

type Faction = "Bureau" | "Static";
type FactionFilter = "전체" | Faction;

type RegistryCharacter = {
  id: string;
  name: string;
  faction: Faction;
  ability: string;
  rank: string;
  avatarUrl: string;
  bio: string;
};

const MOCK_CHARACTERS: RegistryCharacter[] = [
  {
    id: "ch-1",
    name: "리온 하르트",
    faction: "Bureau",
    ability: "광자 지휘",
    rank: "A-3",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    bio: "헬리오스 코어 경계 구역 순찰대를 이끄는 현장 지휘관.",
  },
  {
    id: "ch-2",
    name: "세나 벨",
    faction: "Bureau",
    ability: "신경 공명 분석",
    rank: "B-1",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    bio: "공명율 변동 패턴을 추적해 전투 개시 신호를 예측한다.",
  },
  {
    id: "ch-3",
    name: "이안 레이",
    faction: "Bureau",
    ability: "전장 가시화",
    rank: "C-4",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    bio: "전투 로그를 기반으로 아군 동선을 시각화하는 오퍼레이터.",
  },
  {
    id: "ch-4",
    name: "크로우 제로",
    faction: "Static",
    ability: "노이즈 침투",
    rank: "S-1",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    bio: "도시 경계 밖에서 침투해 감시망을 무력화하는 레이더.",
  },
  {
    id: "ch-5",
    name: "마야 스트록",
    faction: "Static",
    ability: "중력 왜곡",
    rank: "A-2",
    avatarUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=80",
    bio: "헬리오스 코어 수송선 습격 작전을 지휘하는 핵심 인물.",
  },
  {
    id: "ch-6",
    name: "도미닉 펄",
    faction: "Static",
    ability: "금속 공명",
    rank: "B-7",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80",
    bio: "폐허지대에서 장비를 재구성해 전선을 유지하는 정비 담당.",
  },
];

const FILTERS: readonly FactionFilter[] = ["전체", "Bureau", "Static"];

export default function CharactersPage() {
  const [filter, setFilter] = useState<FactionFilter>("전체");
  const [selected, setSelected] = useState<RegistryCharacter | null>(null);

  const filteredCharacters = useMemo(() => {
    if (filter === "전체") return MOCK_CHARACTERS;
    return MOCK_CHARACTERS.filter((character) => character.faction === filter);
  }, [filter]);

  return (
    <section className="py-6">
      <div className="mb-6">
        <p className="hud-label mb-1">REGISTRY</p>
        <h1 className="text-xl font-bold text-text">인물 도감</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const isActive = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isActive
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border bg-bg-secondary text-text-secondary hover:border-primary/40"
              }`}
              aria-pressed={isActive}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCharacters.map((character) => {
          const isBureau = character.faction === "Bureau";

          return (
            <Card key={character.id} hud className="flex flex-col gap-3">
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
                  <p className="text-xs text-text-secondary">능력 계열: {character.ability}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  variant={isBureau ? "info" : "danger"}
                  className={isBureau ? "text-primary" : "text-red-400"}
                >
                  {character.faction}
                </Badge>
                <span className="text-xs text-text-secondary">등급 {character.rank}</span>
              </div>

              <button
                type="button"
                className="mt-1 rounded-md border border-border px-3 py-2 text-sm text-text hover:border-primary hover:text-primary"
                onClick={() => setSelected(character)}
                aria-label={`${character.name} 상세 보기`}
              >
                상세 보기
              </button>
            </Card>
          );
        })}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.name} 프로필` : undefined}
      >
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-text">능력 계열: {selected.ability}</p>
            <p className="text-sm text-text-secondary">{selected.bio}</p>
            <div className="flex items-center gap-2">
              <Badge variant={selected.faction === "Bureau" ? "info" : "danger"}>
                {selected.faction}
              </Badge>
              <span className="text-xs text-text-secondary">등급 {selected.rank}</span>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
