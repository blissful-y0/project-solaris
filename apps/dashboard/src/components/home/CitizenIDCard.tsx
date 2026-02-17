"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { CitizenData } from "./mock-citizen";

/* ─── HP 배터리 색상 결정 ─── */
function hpColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio >= 0.6) return "bg-success";
  if (ratio >= 0.3) return "bg-warning";
  return "bg-accent";
}

/* ─── HP 배터리 세그먼트 ─── */
function HpBattery({ current, max }: { current: number; max: number }) {
  const filled = Math.round((current / max) * 5);
  const color = hpColor(current, max);

  return (
    <div className="flex items-center gap-1">
      <span className="hud-label mr-1">HP</span>
      <div className="flex gap-0.5" role="meter" aria-label={`HP ${current}/${max}`} aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-2 rounded-[1px]",
              i < filled ? color : "bg-bg-tertiary",
            )}
          />
        ))}
      </div>
      <span className="text-[0.6rem] text-text-secondary ml-1">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── WILL 파형 SVG ─── */
function WillWaveform({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  const amplitude = ratio * 8; // 최대 진폭 8px
  const points: string[] = [];

  /* 사인파 포인트 생성 (0~100 x축, 중앙 10 y축) */
  for (let x = 0; x <= 100; x += 2) {
    const y = 10 - amplitude * Math.sin((x / 100) * Math.PI * 4);
    points.push(`${x},${y.toFixed(1)}`);
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hud-label mr-1">WILL</span>
      <svg
        viewBox="0 0 100 20"
        className="w-16 h-4"
        role="meter"
        aria-label={`WILL ${current}/${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[0.6rem] text-text-secondary ml-1">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── 글리치 아바타 ─── */
function GlitchAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  return (
    <div className="relative w-16 h-20 rounded overflow-hidden bg-bg-tertiary border border-border flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name} 아바타`}
          className="w-full h-full object-cover"
          style={{
            animation: "glitch-shift 3s infinite steps(2)",
            mixBlendMode: "screen",
          }}
        />
      ) : (
        /* 아바타 미등록 시 이니셜 표시 */
        <div
          className="w-full h-full flex items-center justify-center text-primary font-bold text-lg"
          style={{
            animation: "glitch-shift 3s infinite steps(2)",
            mixBlendMode: "screen",
          }}
        >
          {name.charAt(0)}
        </div>
      )}
      {/* 스캔라인 오버레이 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    </div>
  );
}

/* ─── 카드 앞면 ─── */
function CardFront({ citizen }: { citizen: CitizenData }) {
  const rrHighlight =
    citizen.resonanceRate >= 70
      ? "text-primary text-glow-cyan"
      : citizen.resonanceRate < 40
        ? "text-accent text-glow-red"
        : "text-text";

  /* RR < 40 시 pulse-glow 애니메이션 */
  const rrAnimation = citizen.resonanceRate < 40 ? "animate-[pulse-glow_2s_ease-in-out_infinite]" : "";

  return (
    <div className="absolute inset-0 backface-hidden p-3 flex flex-col">
      {/* 상단: HUD 라벨 */}
      <div className="hud-label mb-2">SOLARIS CITIZEN ID</div>

      {/* 본문: 아바타 + 정보 */}
      <div className="flex gap-3 flex-1 min-h-0">
        <GlitchAvatar avatarUrl={citizen.avatarUrl} name={citizen.name} />

        <div className="flex flex-col flex-1 min-w-0">
          {/* 이름 + 진영 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-text truncate">
              {citizen.name}
            </span>
            <Badge
              variant={citizen.faction === "Bureau" ? "info" : "danger"}
              size="sm"
            >
              {citizen.faction === "Bureau" ? "SBCS" : "STATIC"}
            </Badge>
          </div>

          {/* 공명율 */}
          <div className="mb-1.5">
            <span className="hud-label">RESONANCE RATE</span>
            <div className={cn("text-xl font-bold tabular-nums", rrHighlight, rrAnimation)}>
              {citizen.resonanceRate}%
            </div>
          </div>

          {/* HP 배터리 */}
          <div className="mb-1">
            <HpBattery current={citizen.hp.current} max={citizen.hp.max} />
          </div>

          {/* WILL 파형 */}
          <WillWaveform
            current={citizen.will.current}
            max={citizen.will.max}
          />
        </div>
      </div>

      {/* 하단: 카드 번호 */}
      <div className="hud-label mt-auto pt-1 text-right tracking-[0.25em]">
        {citizen.citizenId}
      </div>
    </div>
  );
}

/* ─── 카드 뒷면 ─── */
function CardBack({ citizen }: { citizen: CitizenData }) {
  return (
    <div className="absolute inset-0 backface-hidden rotate-y-180 p-3 flex flex-col">
      <div className="hud-label mb-3">CITIZEN PROFILE</div>

      <div className="space-y-2 flex-1">
        <ProfileRow label="이름" value={citizen.name} />
        <ProfileRow
          label="소속"
          value={
            citizen.faction === "Bureau"
              ? "Solaris Bureau of Civic Security"
              : "Static"
          }
        />
        <ProfileRow label="능력 계열" value={citizen.abilityClass} />
        <ProfileRow label="등록일" value={citizen.joinDate} />
        <ProfileRow label="ID" value={citizen.citizenId} />
      </div>

      <Link
        href="/my"
        className="mt-auto pt-2 text-xs text-primary hover:text-primary-dim transition-colors text-center"
      >
        내 프로필 보기 →
      </Link>
    </div>
  );
}

/* ─── 프로필 행 ─── */
function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-xs">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text font-medium truncate ml-2">{value}</span>
    </div>
  );
}

/* ─── 빈 카드 (캐릭터 미등록) — 캐릭터 생성 유도 CTA ─── */
function EmptyCard() {
  return (
    <Link
      href="/character/create"
      className="group block"
      aria-label="캐릭터 생성하기"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary/80 p-4 w-full cursor-pointer transition-all hover:border-primary/40 hover:glow-cyan">
        {/* HUD 코너 브래킷 */}
        <div className="hud-corners" />

        {/* 배경 장식: 스캔라인 */}
        <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity bg-[linear-gradient(transparent_50%,rgba(0,212,255,0.04)_50%)] bg-[length:100%_4px]" />

        {/* 배경 장식: 대각선 패턴 */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

        {/* 상단 라벨 */}
        <div className="relative">
          <div className="hud-label mb-1">SOLARIS CITIZEN ID</div>
          <div className="hud-label text-accent/60">
            UNREGISTERED
          </div>
        </div>

        {/* 중앙: ? 아바타 + 미등록 정보 */}
        <div className="relative flex gap-4 mt-3">
          {/* 글리치 ? 아바타 */}
          <div className="relative w-16 h-20 rounded bg-bg-tertiary/80 border border-primary/15 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <span className="text-3xl font-bold text-primary/40 group-hover:text-primary/70 transition-colors">
              ?
            </span>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-text/60 mb-2">
              미확인 시민
            </span>

            {/* 빈 스탯 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="hud-label w-8">RR</span>
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full w-0 bg-primary/30 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-label w-8">HP</span>
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full w-0 bg-success/30 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-label w-8">WILL</span>
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full w-0 bg-primary/30 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="relative mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary group-hover:text-glow-cyan transition-colors">
              NEW OPERATIVE REQUIRED
            </p>
            <p className="text-[0.625rem] text-text-secondary mt-0.5">
              시민 등록을 완료하여 HELIOS 시스템에 접속하세요
            </p>
          </div>
          <span className="text-primary text-lg group-hover:translate-x-1 transition-transform flex-shrink-0 ml-3">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── 메인 컴포넌트 ─── */
type CitizenIDCardProps = {
  citizen: CitizenData | null;
  className?: string;
};

export function CitizenIDCard({ citizen, className }: CitizenIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleFlip();
      }
    },
    [handleFlip],
  );

  /* 캐릭터 미등록 시 빈 카드 */
  if (!citizen) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyCard />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${citizen.name} 시민 ID 카드 (탭하여 뒤집기)`}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        className="perspective-1000 cursor-pointer aspect-[3/2] w-full"
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-500",
            "[transform-style:preserve-3d]",
            isFlipped && "rotate-y-180",
          )}
        >
          {/* 앞면 */}
          <div className="absolute inset-0 backface-hidden bg-bg-secondary/80 border border-border rounded-lg hud-corners">
            <CardFront citizen={citizen} />
          </div>

          {/* 뒷면 */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-bg-secondary/80 border border-border rounded-lg hud-corners">
            <CardBack citizen={citizen} />
          </div>
        </div>
      </div>
    </div>
  );
}
