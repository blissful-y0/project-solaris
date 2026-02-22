"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Briefing, HistoricalRecord } from "./mock-briefings";
import { pomiAds, mockHistory, eraVariant } from "./mock-briefings";
import { BriefingCard } from "./BriefingCard";
import { BriefingDetailModal } from "./BriefingDetailModal";
import { PomiAd } from "./PomiAd";

type BriefingFeedProps = {
  briefings: Briefing[];
};

export function BriefingFeed({ briefings }: BriefingFeedProps) {
  const [selected, setSelected] = useState<Briefing | null>(null);

  const sorted = useMemo(
    () =>
      [...briefings].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [briefings],
  );

  /* 역사 기록: 오래된 것부터 (2087 → 2240) */
  const history = useMemo(
    () => [...mockHistory].sort((a, b) => a.year - b.year),
    [],
  );

  return (
    <section className="border border-border/50 bg-bg-secondary/20 rounded-xl overflow-hidden hud-corners">
      {/* 헤더 */}
      <div className="p-5 border-b border-white/[0.05] bg-bg-tertiary/30 backdrop-blur-sm relative z-10">
        <p className="hud-label mb-1 text-primary">HELIOS INTELLIGENCE FEED</p>
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          수신된 정보 목록{" "}
          <span className="animate-pulse w-2 h-2 rounded-full bg-success inline-block" />
        </h2>
      </div>

      <div className="p-5">
        {/* ────────── 현재 브리핑 ────────── */}
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <p className="text-sm text-text-secondary">수신된 브리핑이 없습니다</p>
          ) : (
            sorted.map((briefing, idx) => {
              const adIndex = Math.floor(idx / 3);
              const showAd = (idx + 1) % 3 === 0 && adIndex < pomiAds.length;
              const ad = showAd ? pomiAds[adIndex] : null;
              return (
                <div key={briefing.id} className="space-y-4">
                  <BriefingCard briefing={briefing} onClick={() => setSelected(briefing)} />
                  {ad && <PomiAd key={ad.id} text={ad.text} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      <BriefingDetailModal briefing={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

/** 역사 연표 — 단일 행 */
function HistoryRow({ record }: { record: HistoricalRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-0 pb-3">
      {/* 연도 */}
      <div className="w-[2.85rem] shrink-0 flex justify-end pr-3 pt-1.5">
        <span className="hud-label text-[0.5rem] text-text-secondary/25 leading-none tabular-nums">
          {record.year}
        </span>
      </div>

      {/* 노드 */}
      <div className="w-[1rem] shrink-0 flex justify-center pt-[0.4rem]">
        <div className="w-[5px] h-[5px] rounded-full bg-border/40 ring-1 ring-border/20" />
      </div>

      {/* 콘텐츠 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex-1 pl-3 text-left group min-w-0"
      >
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="hud-label text-[0.48rem] text-text-secondary/18">
            {record.bulletinNumber}
          </span>
          <Badge variant={eraVariant[record.era]} size="sm">
            {record.era}
          </Badge>
        </div>
        <p
          className={cn(
            "text-[0.72rem] leading-snug transition-colors",
            open
              ? "text-text-secondary/70"
              : "text-text-secondary/38 group-hover:text-text-secondary/55",
          )}
        >
          {record.title}
        </p>
        {open && (
          <p className="mt-1.5 text-[0.68rem] text-text-secondary/35 leading-relaxed">
            {record.content}
          </p>
        )}
      </button>
    </div>
  );
}
