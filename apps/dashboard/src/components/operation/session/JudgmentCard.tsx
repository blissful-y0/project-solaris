import { cn } from "@/lib/utils";
import type { JudgmentResult, JudgmentGrade, ParticipantJudgment } from "./types";

/* ── 판정 등급별 스타일 ── */
const gradeStyles: Record<JudgmentGrade, { label: string; color: string; bg: string }> = {
  success: { label: "SUCCESS", color: "text-primary", bg: "bg-primary/15" },
  partial: { label: "PARTIAL", color: "text-amber-400", bg: "bg-amber-400/15" },
  fail: { label: "FAIL", color: "text-text-secondary", bg: "bg-subtle/30" },
};

/* ── 참가자별 판정 블록 ── */
function ParticipantBlock({ result }: { result: ParticipantJudgment }) {
  const style = gradeStyles[result.grade];
  return (
    <div data-testid={`participant-judgment-${result.participantId}`} className="flex-1 min-w-0">
      {/* 이름 + 등급 */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-text-secondary truncate">{result.participantName}</span>
        <span
          data-testid={`grade-${result.participantId}`}
          className={cn("text-xs font-bold", style.color)}
        >
          {style.label}
        </span>
      </div>
      {/* 4항목 점수 */}
      <div className="space-y-0.5 text-[0.6rem] text-text-secondary">
        <div className="flex justify-between">
          <span>서술 합리성</span>
          <span className="text-text tabular-nums">{result.scores.narrative}/10</span>
        </div>
        <div className="flex justify-between">
          <span>전술</span>
          <span className="text-text tabular-nums">{result.scores.tactical}/10</span>
        </div>
        <div className="flex justify-between">
          <span>대가 반영</span>
          <span className="text-text tabular-nums">{result.scores.cost}/10</span>
        </div>
        <div className="flex justify-between">
          <span>서술 품질</span>
          <span className="text-text tabular-nums">{result.scores.quality}/10</span>
        </div>
      </div>
    </div>
  );
}

type JudgmentCardProps = {
  judgment: JudgmentResult;
  className?: string;
};

export function JudgmentCard({ judgment, className }: JudgmentCardProps) {
  const { turn, participantResults, statChanges } = judgment;

  return (
    <div
      data-testid="judgment-card"
      className={cn(
        "w-full border border-primary/30 rounded-lg overflow-hidden",
        "bg-bg-secondary/90 backdrop-blur-sm",
        "shadow-[0_0_15px_rgba(0,212,255,0.1)]",
        className,
      )}
    >
      {/* 헤더 */}
      <div className="px-4 py-2 border-b border-primary/20 bg-primary/5">
        <span className="hud-label text-primary">
          HELIOS COMBAT SYSTEM // TURN {turn}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* 참가자별 판정 (등급 + 점수) */}
        <div className="flex gap-4">
          {participantResults.map((pr, i) => (
            <div key={pr.participantId} className="contents">
              {i > 0 && <div className="w-px bg-border self-stretch" />}
              <ParticipantBlock result={pr} />
            </div>
          ))}
        </div>

        {/* 스탯 변동 */}
        {statChanges.length > 0 && (
          <div className="border-t border-border pt-2">
            <span className="hud-label text-[0.5rem] block mb-1">스탯 변동</span>
            <div className="space-y-0.5">
              {statChanges.map((sc, i) => {
                const delta = sc.after - sc.before;
                const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;
                const statLabel = sc.stat.toUpperCase();
                return (
                  <div
                    key={`${sc.participantId}-${sc.stat}-${i}`}
                    data-testid="stat-change"
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-text-secondary w-16 truncate">{sc.participantName}</span>
                    <span className="text-text-secondary">{statLabel}</span>
                    <span className="tabular-nums text-text">
                      {sc.before}→{sc.after}
                    </span>
                    <span className={cn(
                      "tabular-nums text-[0.65rem]",
                      delta < 0 ? "text-accent" : "text-success",
                    )}>
                      ({deltaStr}, {sc.reason})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
