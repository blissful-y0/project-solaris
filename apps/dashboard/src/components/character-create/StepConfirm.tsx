import { Button } from "@/components/ui/Button";

import type { CharacterDraft, CrossoverStyle } from "./types";

type StepConfirmProps = {
  draft: CharacterDraft;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
};

const FACTION_LABELS = { bureau: "Solaris Bureau of Civic Security", static: "Static" } as const;
const CLASS_LABELS = { field: "역장 (Field)", empathy: "감응 (Empathy)", shift: "변환 (Shift)", compute: "연산 (Compute)" } as const;
const CROSSOVER_LABELS: Record<CrossoverStyle, string> = {
  "limiter-override": "리미터 해제",
  "hardware-bypass": "외장형 연산 장치",
  "dead-reckoning": "정신적 오버클럭",
  "defector": "전향자",
};

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

export function StepConfirm({ draft, onSubmit, onEditStep }: StepConfirmProps) {
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
        <SummaryRow label="비용 타입" value={isBureau ? "WILL" : "HP"} />
      </div>

      {/* 능력 상세 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={headingClass}>능력</h3>
          <EditButton onClick={() => onEditStep(2)} />
        </div>
        <SummaryRow label="이름" value={draft.abilityName} />
        <SummaryRow label="설명" value={draft.abilityDescription} />
        <SummaryRow label="제약" value={draft.abilityConstraint} />
        <SummaryRow label="기본 스킬" value={draft.abilityTierBasic} />
        <SummaryRow label="중급 스킬" value={draft.abilityTierMid} />
        <SummaryRow label="상급 스킬" value={draft.abilityTierAdvanced} />
        {draft.crossoverStyle && (
          <SummaryRow label="크로스오버" value={CROSSOVER_LABELS[draft.crossoverStyle]} />
        )}
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
        <SummaryRow label="이미지 URL" value={draft.profileImageUrl} />
        {draft.profileImageUrl && (
          <div className="pt-1">
            <img
              src={draft.profileImageUrl}
              alt="프로필 미리보기"
              className="h-24 w-24 rounded-md object-cover border border-border"
            />
          </div>
        )}
        <SummaryRow label="외형" value={draft.appearance} />
        <SummaryRow label="성격" value={draft.personality} />
        <SummaryRow label="배경" value={draft.backstory} />
      </div>

      {/* 제출 */}
      <div className="pt-4">
        <Button onClick={onSubmit} size="lg" className="w-full">
          제출
        </Button>
      </div>
    </div>
  );
}
