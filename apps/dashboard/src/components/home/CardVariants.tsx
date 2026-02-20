"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { StatBar } from "@/components/common";
import type { CitizenData } from "./mock-citizen";
import { factionStyle, DataField } from "./StatDisplay";
import { AvatarWithEdit } from "./AvatarWithEdit";

/* ────────────────────────────────────────────────
   등록된 시민 카드 (RegisteredCard)
   ──────────────────────────────────────────────── */
export function RegisteredCard({
  citizen,
  onAvatarChange,
}: {
  citizen: CitizenData;
  onAvatarChange?: (url: string) => void;
}) {
  const style = factionStyle[citizen.faction];
  const rrHighlight =
    citizen.resonanceRate >= 70
      ? "text-primary"
      : citizen.resonanceRate < 40
        ? "text-accent"
        : "text-text";

  return (
    <div className="rounded-lg border border-border bg-bg-secondary/80 overflow-hidden flex">
      {/* 좌측 팩션 stripe */}
      <div className={cn("w-1 flex-shrink-0", style.stripe)} />

      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label">{style.cardTitle}</span>
          <span className={cn("hud-label", style.color)}>{style.label}</span>
        </div>

        {/* 본문: 사진 + 신상정보 */}
        <div className="flex gap-4 p-4">
          <AvatarWithEdit
            characterId={citizen.characterId}
            avatarUrl={citizen.avatarUrl}
            name={citizen.name}
            onAvatarChange={onAvatarChange}
          />

          {/* 신상정보 + 스탯 */}
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold text-text truncate leading-tight block">
              {citizen.name}
            </span>
            <p className="text-[0.6rem] text-text-secondary mt-0.5 truncate">
              {citizen.faction === "Enforcer"
                ? "Solaris Bureau of Civic Security"
                : "The Static"}
            </p>

            <div className="grid grid-cols-2 gap-x-3 mt-2">
              <DataField label="CLASS" value={citizen.abilityClass} />
              <div>
                <span className="hud-label block mb-0.5">RESONANCE RATE</span>
                <span className={cn("text-xl font-bold tabular-nums leading-tight block", rrHighlight)}>
                  {citizen.resonanceRate}%
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <StatBar current={citizen.hp.current} max={citizen.hp.max} variant="hp" label="HP" />
              <StatBar current={citizen.will.current} max={citizen.will.max} variant="will" label="WILL" />
            </div>
          </div>
        </div>

        {/* 하단 바 */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border text-[0.6rem] text-text-secondary">
          <span className="tabular-nums">{citizen.citizenId}</span>
          <span className="tabular-nums">REG {citizen.joinDate}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   빈 카드 (캐릭터 미등록) — 캐릭터 생성 유도 CTA
   ──────────────────────────────────────────────── */
export function EmptyCard() {
  return (
    <Link href="/character/create" className="group block" aria-label="캐릭터 생성하기">
      <div className="rounded-lg border border-border bg-bg-secondary/80 overflow-hidden flex cursor-pointer transition-all hover:border-primary/40">
        {/* 좌측 stripe — 비활성 */}
        <div className="w-1 flex-shrink-0 bg-border" />

        <div className="flex-1">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="hud-label">SOLARIS CITIZEN ID</span>
            <span className="hud-label text-accent/60">UNREGISTERED</span>
          </div>

          {/* 본문 */}
          <div className="flex gap-4 p-4">
            {/* ? 아바타 */}
            <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-border flex-shrink-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30 group-hover:text-primary/60 transition-colors">
                ?
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="text-sm font-semibold text-text/50">미확인 시민</span>
                <div className="mt-3 space-y-1.5">
                  {["RR", "HP", "WILL"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="hud-label w-8">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary" role="meter" aria-label={`${label} 0/0`} aria-valuenow={0} aria-valuemin={0} aria-valuemax={0} />
                      <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-primary">NEW OPERATIVE REQUIRED</p>
                <p className="text-[0.6rem] text-text-secondary mt-0.5">
                  시민 등록을 완료하여 HELIOS 시스템에 접속하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────
   승인 대기 카드
   ──────────────────────────────────────────────── */
export function PendingCard({
  citizen,
  onCancel,
}: {
  citizen: CitizenData;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-lg border border-warning/40 bg-bg-secondary/80 overflow-hidden flex">
      <div className="w-1 flex-shrink-0 bg-warning" />

      <div className="flex-1">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label text-warning">APPROVAL PENDING</span>
          <span className="hud-label tracking-[0.2em]">{citizen.citizenId}</span>
        </div>

        <div className="flex gap-4 p-4">
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-border flex-shrink-0 overflow-hidden">
            {citizen.avatarUrl ? (
              <Image
                src={citizen.avatarUrl}
                alt={`${citizen.name} 아바타`}
                width={256}
                height={320}
                sizes="(min-width: 640px) 128px, 112px"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warning font-bold text-2xl">
                {citizen.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <span className="text-lg font-bold text-text truncate leading-tight block">
                {citizen.name}
              </span>
              <p className="text-[0.6rem] text-text-secondary mt-0.5">
                {citizen.faction === "Enforcer"
                  ? "Solaris Bureau of Civic Security"
                  : "The Static"}
              </p>
            </div>

            <p className="text-xs text-text-secondary">
              HELIOS 시스템이 신원을 확인하고 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 py-2 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-text-secondary hover:text-accent transition-colors"
            aria-label="신청 취소"
          >
            신청 취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   반려 카드
   ──────────────────────────────────────────────── */
export function RejectedCard({ citizen }: { citizen: CitizenData }) {
  return (
    <div className="rounded-lg border border-accent/40 bg-bg-secondary/80 overflow-hidden flex">
      <div className="w-1 flex-shrink-0 bg-accent" />

      <div className="flex-1">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label text-accent">REGISTRATION DENIED</span>
          <span className="hud-label tracking-[0.2em]">{citizen.citizenId}</span>
        </div>

        <div className="flex gap-4 p-4">
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-accent/20 flex-shrink-0 overflow-hidden">
            {citizen.avatarUrl ? (
              <Image
                src={citizen.avatarUrl}
                alt={`${citizen.name} 아바타`}
                width={256}
                height={320}
                sizes="(min-width: 640px) 128px, 112px"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent/60 font-bold text-2xl">
                {citizen.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <span className="text-lg font-bold text-text truncate leading-tight block">
                {citizen.name}
              </span>
              <p className="text-[0.6rem] text-text-secondary mt-0.5">
                {citizen.faction === "Enforcer"
                  ? "Solaris Bureau of Civic Security"
                  : "The Static"}
              </p>
            </div>

            <div>
              <p className="text-xs text-accent">등록이 반려되었습니다.</p>
              <p className="text-[0.6rem] text-text-secondary mt-1">
                캐릭터 정보를 수정하여 다시 신청할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center px-4 py-2 border-t border-border">
          <Link
            href="/character/create"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
            aria-label="재신청하기"
          >
            재신청하기 &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
