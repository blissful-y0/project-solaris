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
    <section>
      {/* 헤더 */}
      <div className="mb-4">
        <p className="hud-label mb-1">HELIOS INTELLIGENCE FEED</p>
        <h2 className="text-lg font-bold text-text">수신된 정보 목록</h2>
      </div>

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

      {/* 상세 모달 */}
      <BriefingDetailModal
        briefing={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
