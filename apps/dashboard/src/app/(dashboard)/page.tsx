"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import {
  BriefingFeed,
  mockBriefings,
  CitizenIDCard,
} from "@/components/home";
import type { CitizenData, CitizenStatus } from "@/components/home/mock-citizen";
import type { User } from "@supabase/supabase-js";

/** Discord 표시 이름 추출 */
function getDisplayName(user: User): string {
  const meta = user.user_metadata;
  const rawName =
    meta?.full_name ?? meta?.name ?? meta?.user_name ?? meta?.preferred_username;
  if (typeof rawName !== "string") return "Operator";
  const sanitized = rawName.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return sanitized.slice(0, 32) || "Operator";
}

/** 능력 계열 한글 매핑 */
const ABILITY_CLASS_LABELS: Record<string, string> = {
  field: "역장 (Field)",
  empathy: "감응 (Empathy)",
  shift: "변환 (Shift)",
  compute: "연산 (Compute)",
};

/** 팩션 매핑 */
const FACTION_MAP: Record<string, "Enforcer" | "Static"> = {
  bureau: "Enforcer",
  static: "Static",
  civilian: "Static",
  defector: "Static",
};

/** 시민 ID 포맷 */
function formatCitizenId(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `SCC-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [citizenData, setCitizenData] = useState<CitizenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async (isCancelled?: () => boolean) => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (isCancelled?.()) return;
      setUser(user);

      if (!user) {
        setCitizenData(null);
        return;
      }

      /* 내 캐릭터 조회 — 카드 표시용 필드만 */
      const { data: character, error } = await supabase
        .from("characters")
        .select("id, name, faction, ability_class, hp_max, hp_current, will_max, will_current, profile_image_url, resonance_rate, status, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (isCancelled?.()) return;

      if (error || !character) {
        setCitizenData(null);
        return;
      }

      /* DB 데이터 → CitizenData 변환 */
      const mapped: CitizenData = {
        characterId: character.id,
        name: character.name,
        faction: FACTION_MAP[character.faction] ?? "Bureau",
        resonanceRate: character.resonance_rate ?? 0,
        hp: { current: character.hp_current, max: character.hp_max },
        will: { current: character.will_current, max: character.will_max },
        citizenId: formatCitizenId(character.id),
        avatarUrl: character.profile_image_url ?? null,
        abilityClass: character.ability_class
          ? (ABILITY_CLASS_LABELS[character.ability_class] ?? character.ability_class)
          : "비능력자",
        joinDate: character.created_at?.slice(0, 10) as `${number}-${number}-${number}`,
        status: character.status as CitizenStatus,
      };

      setCitizenData(mapped);
    } catch {
      if (isCancelled?.()) return;
      setUser(null);
      setCitizenData(null);
      setLoadError(true);
    } finally {
      if (isCancelled?.()) return;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchData(() => cancelled);
    return () => { cancelled = true; };
  }, [fetchData]);

  const displayName =
    citizenData?.status === "approved" && citizenData.name
      ? citizenData.name
      : user
        ? getDisplayName(user)
        : "...";

  return (
    <div className="py-6 space-y-8">
      {/* 환영 메시지 */}
      <div>
        <p className="hud-label mb-2">OPERATOR STATUS</p>
        <h1 className="text-xl font-bold text-text">
          환영합니다, <span className="text-primary">{displayName}</span>님
        </h1>
        {isLoading && (
          <p className="mt-2 text-sm text-text-secondary">
            사용자 정보를 불러오는 중...
          </p>
        )}
      </div>

      {/* 접속자 정보 에러 */}
      {loadError && (
        <Card hud className="max-w-md border border-red-500/40 mb-6">
          <p className="text-sm text-text">사용자 정보를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => { void fetchData(); }}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm text-text hover:border-primary hover:text-primary"
          >
            다시 시도
          </button>
        </Card>
      )}

      {/* 1단 연속 레이아웃: ID 카드 헤더 -> 인텔리전스 피드 스트림 연결 */}
      <div className="w-full flex flex-col relative">
        <CitizenIDCard
          citizen={citizenData}
          onAvatarChange={(url) => {
            setCitizenData((prev) => prev ? { ...prev, avatarUrl: url } : prev);
          }}
          className="relative z-10"
        />

        {/* 장식용 연결 요소: ID 카드에서 타임라인으로 이어지는 데이터 라인 */}
        <div className="flex items-center ml-8 sm:ml-12 h-8 relative z-0">
          <div className="w-px h-full bg-border border-r border-primary/20 shadow-[1px_0_5px_rgba(0,212,255,0.3)]" />
          <div className="ml-3 font-mono text-[0.6rem] text-primary/60 tracking-widest uppercase">
            ESTABLISHING SECURE CONNECTION_
          </div>
        </div>

        <BriefingFeed briefings={mockBriefings} />
      </div>
    </div>
  );
}
