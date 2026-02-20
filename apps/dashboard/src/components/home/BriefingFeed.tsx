"use client";

import { useMemo, useState } from "react";
import type { Briefing } from "./mock-briefings";
import { pomiAds } from "./mock-briefings";
import { BriefingCard } from "./BriefingCard";
import { BriefingDetailModal } from "./BriefingDetailModal";
import { PomiAd } from "./PomiAd";

type BriefingFeedProps = {
  briefings: Briefing[];
};

export function BriefingFeed({ briefings }: BriefingFeedProps) {
  const [selected, setSelected] = useState<Briefing | null>(null);

  /* 최신순 정렬 */
  const sorted = useMemo(
    () =>
      [...briefings].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [briefings],
  );

  return (
    <section className="border border-border/50 bg-bg-secondary/20 rounded-xl overflow-hidden hud-corners">
      {/* 헤더 */}
      <div className="p-5 border-b border-white/[0.05] bg-bg-tertiary/30 backdrop-blur-sm relative z-10">
        <p className="hud-label mb-1 text-primary">HELIOS INTELLIGENCE FEED</p>
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          수신된 정보 목록 <span className="animate-pulse w-2 h-2 rounded-full bg-success inline-block"></span>
        </h2>
      </div>

      {/* 컨텐츠 (네이티브 스크롤) */}
      <div className="p-5">
        {/* 타임라인 + Pomi 광고 삽입 */}
        {sorted.length === 0 ? (
          <p className="text-sm text-text-secondary">수신된 브리핑이 없습니다</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((briefing, idx) => {
              /* 3개 브리핑마다 1개 PomiAd 삽입 */
              const adIndex = Math.floor(idx / 3);
              const showAd = (idx + 1) % 3 === 0 && adIndex < pomiAds.length;
              const ad = showAd ? pomiAds[adIndex] : null;
              return (
                <div key={briefing.id} className="space-y-4">
                  <BriefingCard
                    briefing={briefing}
                    onClick={() => setSelected(briefing)}
                  />
                  {ad && <PomiAd key={ad.id} text={ad.text} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <BriefingDetailModal
        briefing={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
