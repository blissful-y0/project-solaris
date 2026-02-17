import Link from "next/link";

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
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-6">HP</span>
      <div className="flex gap-0.5" role="meter" aria-label={`HP ${current}/${max}`} aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-5 h-2.5 rounded-[1px]",
              i < filled ? color : "bg-bg-tertiary",
            )}
          />
        ))}
      </div>
      <span className="text-[0.65rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── WILL 파형 SVG ─── */
function WillWaveform({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  const amplitude = ratio * 8;
  const points: string[] = [];

  for (let x = 0; x <= 100; x += 2) {
    const y = 10 - amplitude * Math.sin((x / 100) * Math.PI * 4);
    points.push(`${x},${y.toFixed(1)}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-6">WILL</span>
      <svg
        viewBox="0 0 100 20"
        className="w-20 h-5"
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
      <span className="text-[0.65rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── 프로필 행 ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-text-secondary flex-shrink-0">{label}</span>
      <span className="text-text font-medium truncate">{value}</span>
    </div>
  );
}

/* ─── 등록된 시민 카드 ─── */
function RegisteredCard({ citizen }: { citizen: CitizenData }) {
  const rrHighlight =
    citizen.resonanceRate >= 70
      ? "text-primary text-glow-cyan"
      : citizen.resonanceRate < 40
        ? "text-accent text-glow-red"
        : "text-text";

  return (
    <div className="rounded-lg border border-border bg-bg-secondary/80 p-4 hud-corners">
      {/* 헤더: 라벨 + 카드번호 */}
      <div className="flex items-center justify-between mb-3">
        <div className="hud-label">SOLARIS CITIZEN ID</div>
        <div className="hud-label tracking-[0.2em]">{citizen.citizenId}</div>
      </div>

      {/* 본문: 아바타 + 정보 */}
      <div className="flex gap-4">
        {/* 아바타 — 크게 */}
        <div className="w-24 h-28 rounded-md overflow-hidden bg-bg-tertiary border border-border flex-shrink-0">
          {citizen.avatarUrl ? (
            <img
              src={citizen.avatarUrl}
              alt={`${citizen.name} 아바타`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
              {citizen.name.charAt(0)}
            </div>
          )}
        </div>

        {/* 우측 정보 */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* 이름 + 소속 */}
          <div className="mb-2">
            <span className="text-lg font-bold text-text truncate leading-tight block">
              {citizen.name}
            </span>
            <p className="text-[0.65rem] text-text-secondary mt-0.5">
              {citizen.faction === "Bureau"
                ? "Solaris Bureau of Civic Security"
                : "Static Resistance"}
            </p>
          </div>

          {/* 공명율 — 크게 */}
          <div className="mb-3">
            <span className="hud-label">RESONANCE RATE</span>
            <div className={cn("text-2xl font-bold tabular-nums leading-tight", rrHighlight)}>
              {citizen.resonanceRate}%
            </div>
          </div>

          {/* HP 배터리 */}
          <div className="mb-1.5">
            <HpBattery current={citizen.hp.current} max={citizen.hp.max} />
          </div>

          {/* WILL 파형 */}
          <WillWaveform
            current={citizen.will.current}
            max={citizen.will.max}
          />
        </div>
      </div>

      {/* 하단: 프로필 정보 */}
      <div className="mt-3 pt-3 border-t border-border space-y-1">
        <InfoRow label="계열" value={citizen.abilityClass} />
        <InfoRow label="등록" value={citizen.joinDate} />
      </div>
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
      <div className="rounded-lg border border-border bg-bg-secondary/80 p-4 w-full cursor-pointer transition-all hover:border-primary/40 hover:glow-cyan hud-corners">
        {/* 상단 라벨 */}
        <div>
          <div className="hud-label mb-1">SOLARIS CITIZEN ID</div>
          <div className="hud-label text-accent/60">UNREGISTERED</div>
        </div>

        {/* 중앙: ? 아바타 + 미등록 정보 */}
        <div className="flex gap-4 mt-3">
          {/* ? 아바타 — 등록 카드와 동일 사이즈 */}
          <div className="w-24 h-28 rounded-md bg-bg-tertiary border border-border flex-shrink-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary/40 group-hover:text-primary/70 transition-colors">
              ?
            </span>
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
                  <div className="h-full w-0 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-label w-8">HP</span>
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full w-0 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-label w-8">WILL</span>
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full w-0 rounded-full" />
                </div>
                <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary">
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
  if (!citizen) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyCard />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <RegisteredCard citizen={citizen} />
    </div>
  );
}
