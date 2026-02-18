import { Button } from "@/components/ui/Button";

import type { CharacterDraft, CrossoverStyle } from "./types";

type StepConfirmProps = {
  draft: CharacterDraft;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
  onLeaderChange?: (checked: boolean) => void;
  submitting?: boolean;
};

const FACTION_LABELS = { bureau: "Solaris Bureau of Civic Security", static: "Static" } as const;
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-text-secondary min-w-[80px] shrink-0">{label}</span>
      <span className="text-sm text-text">{value || "—"}</span>
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

/** 코스트 문자열 포맷 */
function formatCost(hp: string, will: string): string {
  const hpNum = Number(hp) || 0;
  const willNum = Number(will) || 0;
  if (hpNum > 0 && willNum > 0) return `HP ${hpNum} + WILL ${willNum}`;
  if (hpNum > 0) return `HP ${hpNum}`;
  if (willNum > 0) return `WILL ${willNum}`;
  return "—";
}

export function StepConfirm({ draft, onSubmit, onEditStep, onLeaderChange, submitting }: StepConfirmProps) {
  const isBureau = draft.faction === "bureau";
  const systemName = isBureau ? "하모닉스 프로토콜" : "오버드라이브";

  return (
    <div className="space-y-5">
      <p className="hud-label mb-6">// 입력 내용을 확인하세요</p>

      {/* 진영 + 계열 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>진영 &amp; 계열</h3>
          <EditButton onClick={() => onEditStep(0)} />
        </div>
        <SummaryRow
          label="진영"
          value={draft.faction ? FACTION_LABELS[draft.faction] : ""}
        />
        <SummaryRow
          label="계열"
          value={draft.abilityClass ? CLASS_LABELS[draft.abilityClass] : ""}
        />
        <SummaryRow label="능력 체계" value={systemName} />
        {draft.crossoverStyle && (
          <SummaryRow label="크로스오버" value={CROSSOVER_LABELS[draft.crossoverStyle]} />
        )}
      </div>

      {/* 능력 개요 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>능력</h3>
          <EditButton onClick={() => onEditStep(2)} />
        </div>
        <SummaryRow label="이름" value={draft.abilityName} />
        <SummaryRow label="설명" value={draft.abilityDescription} />
        <SummaryRow label="제약" value={draft.abilityConstraint} />
        <SummaryRow label="약점" value={draft.abilityWeakness} />
      </div>

      {/* 단계별 스킬 요약 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>스킬 상세</h3>
          <EditButton onClick={() => onEditStep(2)} />
        </div>
        {(["basic", "mid", "advanced"] as const).map((tier) => {
          const skill = draft.skills[tier];
          return (
            <div key={tier} className="border-b border-border/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
              <p className="text-[0.625rem] uppercase tracking-widest text-primary/60 mb-1">
                {TIER_LABELS[tier]}
              </p>
              <SummaryRow label="이름" value={skill.name} />
              <SummaryRow label="설명" value={skill.description} />
              <SummaryRow label="코스트" value={formatCost(skill.costHp, skill.costWill)} />
            </div>
          );
        })}
      </div>

      {/* 프로필 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>프로필</h3>
          <EditButton onClick={() => onEditStep(3)} />
        </div>
        <SummaryRow label="이름" value={draft.name} />
        <SummaryRow label="성별" value={draft.gender} />
        <SummaryRow label="나이" value={draft.age} />
        <SummaryRow label="공명율" value={draft.resonanceRate ? `${draft.resonanceRate}%` : ""} />
        <SummaryRow label="외형" value={draft.appearance} />
        <SummaryRow label="성격" value={draft.personality} />
        <SummaryRow label="배경" value={draft.backstory} />
      </div>

      {/* 리더 신청 */}
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

      {/* 제출 */}
      <div className="pt-4">
        <Button onClick={onSubmit} size="lg" className="w-full" disabled={submitting}>
          {submitting ? "제출 중..." : "제출"}
        </Button>
      </div>
    </div>
  );
}
