import type { Briefing } from "./mock-briefings";
import { BriefingCard } from "./BriefingCard";

type BriefingFeedProps = {
  briefings: Briefing[];
};

export function BriefingFeed({ briefings }: BriefingFeedProps) {
  /* 최신순 정렬 */
  const sorted = [...briefings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <section>
      {/* 헤더 */}
      <div className="mb-4">
        <p className="hud-label mb-1">SOLARIS BRIEFING</p>
        <h2 className="text-lg font-bold text-text">오늘의 브리핑</h2>
      </div>

      {/* 타임라인 */}
      {sorted.length === 0 ? (
        <p className="text-sm text-text-secondary">수신된 브리핑이 없습니다</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((briefing) => (
            <BriefingCard key={briefing.id} briefing={briefing} />
          ))}
        </div>
      )}
    </section>
  );
}
