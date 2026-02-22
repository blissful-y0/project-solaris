"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { BattleParticipant } from "./types";

/* ── 팩션별 HP 바 색상 ── */
const factionBarColor = {
  bureau: "bg-primary",
  static: "bg-accent",
  defector: "bg-amber-500",
} as const;

const factionTextColor = {
  bureau: "text-primary",
  static: "text-accent",
  defector: "text-amber-500",
} as const;

/* ── 참가자 1명의 HP 미니 바 ── */
function ParticipantBar({
  participant,
  expanded,
}: {
  participant: BattleParticipant;
  expanded: boolean;
}) {
  const { name, faction, hp, will } = participant;
  const hpPct = hp.max > 0 ? Math.min((hp.current / hp.max) * 100, 100) : 0;
  const willPct = will.max > 0 ? Math.min((will.current / will.max) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      {/* HP 바 */}
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium w-24 truncate", factionTextColor[faction])}>
          {name}
        </span>
        <div
          role="progressbar"
          aria-valuenow={hp.current}
          aria-valuemin={0}
          aria-valuemax={hp.max}
          aria-label={`${name} HP ${hp.current}/${hp.max}`}
          className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden"
        >
          <div
            className={cn("h-full rounded-full transition-all", factionBarColor[faction])}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="text-[0.6rem] text-text-secondary tabular-nums w-16 text-right">
          HP {hp.current}/{hp.max}
        </span>
      </div>

      {/* WILL 바 (확장 시에만 표시) */}
      {expanded && (
        <div className="flex items-center gap-2">
          <span className="text-xs w-24" />
          <div
            role="progressbar"
            aria-valuenow={will.current}
            aria-valuemin={0}
            aria-valuemax={will.max}
            aria-label={`${name} WILL ${will.current}/${will.max}`}
            className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all"
              style={{ width: `${willPct}%` }}
            />
          </div>
          <span className="text-[0.6rem] text-text-secondary tabular-nums w-16 text-right">
            WL {will.current}/{will.max}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── 전투 세션 상단 스탯 바 ── */
type SessionStatBarProps = {
  participants: BattleParticipant[];
  className?: string;
};

export function SessionStatBar({ participants, className }: SessionStatBarProps) {
  const [expanded, setExpanded] = useState(false);

  const allies = participants.filter((p) => p.team === "ally");
  const enemies = participants.filter((p) => p.team === "enemy");

  const is2v2 = allies.length >= 2 || enemies.length >= 2;

  return (
    <button
      type="button"
      onClick={() => setExpanded((prev) => !prev)}
      aria-label={expanded ? "스탯 상세 접기" : "스탯 상세 펼치기"}
      className={cn(
        "w-full text-left px-4 py-2 bg-bg-secondary/60 border-b border-border",
        "hover:bg-bg-secondary/80 transition-colors cursor-pointer",
        className,
      )}
    >
      {/* 2v2: 팀별 그룹핑 */}
      {is2v2 ? (
        <div className="space-y-2">
          <div>
            <span className="hud-label text-[0.5rem] block mb-1">아군</span>
            <div className="space-y-1">
              {allies.map((p) => (
                <ParticipantBar key={p.id} participant={p} expanded={expanded} />
              ))}
            </div>
          </div>
          <div>
            <span className="hud-label text-[0.5rem] block mb-1">적군</span>
            <div className="space-y-1">
              {enemies.map((p) => (
                <ParticipantBar key={p.id} participant={p} expanded={expanded} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 1v1: 간단 나열 */
        <div className="space-y-1">
          {participants.map((p) => (
            <ParticipantBar key={p.id} participant={p} expanded={expanded} />
          ))}
        </div>
      )}

      {/* 확장/접기 힌트 */}
      <div className="text-center mt-1">
        <span className="text-[0.5rem] text-text-secondary">
          {expanded ? "▲ 접기" : "▼ WILL 상세"}
        </span>
      </div>
    </button>
  );
}
