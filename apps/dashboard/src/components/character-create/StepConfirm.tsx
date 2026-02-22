import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

import type { CharacterDraft, CrossoverStyle } from "./types";

type StepConfirmProps = {
  draft: CharacterDraft;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
  onLeaderChange?: (checked: boolean) => void;
  submitting?: boolean;
  /** 프로필 이미지 미리보기 URL */
  imagePreviewUrl?: string | null;
};

const FACTION_LABELS = { bureau: "Solaris Bureau of Civic Security", static: "The Static", defector: "전향자" } as const;
const CLASS_LABELS = { field: "역장 (Field)", empathy: "감응 (Empathy)", shift: "변환 (Shift)", compute: "연산 (Compute)" } as const;
const CROSSOVER_LABELS: Record<CrossoverStyle, string> = {
  "limiter-override": "리미터 해제",
  "hardware-bypass": "외장형 연산 장치",
  "dead-reckoning": "정신적 오버클럭",
  "defector": "전향자",
};
const TIER_LABELS = { basic: "기본 스킬", mid: "중급 스킬", advanced: "상급 스킬" } as const;

const sectionClass = "border border-border rounded-lg p-4 bg-bg-secondary/50 space-y-2";
const headingClass = "text-xs uppercase tracking-widest text-primary/80 mb-3 font-semibold";

function SummaryRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={cn("flex gap-2", multiline && "flex-col")}>
      <span className="text-xs text-text-secondary min-w-[80px] shrink-0">{label}</span>
      <span className={cn("text-sm text-text", multiline && "whitespace-pre-wrap")}>{value || "—"}</span>
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
    >
      수정
    </button>
  );
}

function formatCost(hp: string, will: string): string {
  const hpNum = Number(hp) || 0;
  const willNum = Number(will) || 0;
  if (hpNum > 0 && willNum > 0) return `HP ${hpNum} + WILL ${willNum}`;
  if (hpNum > 0) return `HP ${hpNum}`;
  if (willNum > 0) return `WILL ${willNum}`;
  return "—";
}

export function StepConfirm({ draft, onSubmit, onEditStep, onLeaderChange, submitting, imagePreviewUrl }: StepConfirmProps) {
  const isBureau = draft.faction === "bureau";
  const systemName = isBureau ? "하모닉스 프로토콜" : "오버드라이브";

  return (
    <div className="space-y-5">
      <p className="hud-label mb-4">// 입력 내용을 확인하세요</p>

      {/* ─── 이력서 헤더: 이미지 + 기본 정보 ─── */}
      <div className={cn(sectionClass, "!space-y-0")}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={headingClass}>프로필</h3>
          <EditButton onClick={() => onEditStep(2)} />
        </div>

        <div className="flex gap-4">
          {/* 이미지 */}
          <div className="w-24 shrink-0">
            {imagePreviewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element -- blob/data URL 미리보기라 next/image 최적화 대상 아님 */
              <img
                src={imagePreviewUrl}
                alt="프로필"
                className="w-24 h-32 rounded-md border border-border object-cover"
              />
            ) : (
              <div className="w-24 h-32 rounded-md border border-dashed border-border flex items-center justify-center">
                <span className="text-text-secondary/30 text-2xl">?</span>
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-lg font-bold text-text truncate">{draft.name || "—"}</p>
            <p className="text-xs text-text-secondary">
              {draft.faction ? FACTION_LABELS[draft.faction] : "—"}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
              {draft.gender && <span>{draft.gender}</span>}
              {draft.age && <span>{draft.age}세</span>}
              {draft.resonanceRate && (
                <span className={cn(
                  "font-mono font-semibold",
                  isBureau ? "text-primary" : "text-accent",
                )}>
                  RR {draft.resonanceRate}%
                </span>
              )}
            </div>
            {draft.abilityClass && (
              <p className="text-xs text-text-secondary mt-1">
                {CLASS_LABELS[draft.abilityClass]}
                {draft.crossoverStyle && (
                  <span className="text-warning ml-2">+ {CROSSOVER_LABELS[draft.crossoverStyle]}</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* 외형/성격/배경 */}
        <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
          {draft.appearance && <SummaryRow label="외형" value={draft.appearance} multiline />}
          {draft.personality && <SummaryRow label="성격" value={draft.personality} multiline />}
          {draft.backstory && <SummaryRow label="배경" value={draft.backstory} multiline />}
          {draft.notes && <SummaryRow label="기타" value={draft.notes} multiline />}
        </div>
      </div>

      {/* ─── 능력 개요 ─── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>능력 — {draft.abilityName || "—"}</h3>
          <EditButton onClick={() => onEditStep(3)} />
        </div>
        <SummaryRow label="설명" value={draft.abilityDescription} multiline />
        <SummaryRow label="제약/약점" value={draft.abilityWeakness} multiline />
      </div>

      {/* ─── 스킬 상세 ─── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>스킬 상세</h3>
          <EditButton onClick={() => onEditStep(3)} />
        </div>
        {(["basic", "mid", "advanced"] as const).map((tier) => {
          const skill = draft.skills[tier];
          return (
            <div key={tier} className="border-b border-border/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-[0.625rem] uppercase tracking-widest text-primary/60">
                  {TIER_LABELS[tier]}
                </p>
                <span className="text-[0.625rem] font-mono text-text-secondary">
                  {formatCost(skill.costHp, skill.costWill)}
                </span>
              </div>
              <p className="text-sm font-medium text-text">{skill.name || "—"}</p>
              {skill.description && (
                <p className="text-xs text-text-secondary mt-0.5">{skill.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── 리더 신청 ─── */}
      {draft.faction !== null && (
        <div className="flex items-start gap-3 border border-border rounded-lg p-4 bg-bg-secondary/50">
          <input
            type="checkbox"
            id="leaderApplication"
            checked={draft.leaderApplication}
            onChange={(e) => onLeaderChange?.(e.target.checked)}
            className="mt-0.5 accent-primary"
            aria-label="리더 신청"
          />
          <div>
            <label htmlFor="leaderApplication" className="text-sm font-medium text-text cursor-pointer">
              진영 리더에 신청합니다
            </label>
            <p className="text-xs text-text-secondary mt-1">
              승인 시 진영을 대표하는 리더로 지정됩니다
            </p>
          </div>
        </div>
      )}

      {/* ─── 제출 ─── */}
      <div className="pt-4">
        <Button onClick={onSubmit} size="lg" className="w-full" disabled={submitting}>
          {submitting ? "제출 중..." : "제출"}
        </Button>
      </div>
    </div>
  );
}
