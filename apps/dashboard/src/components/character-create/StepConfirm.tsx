import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import type { CharacterDraft } from "./types";

type StepConfirmProps = {
  draft: CharacterDraft;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
};

const FACTION_LABELS = { bureau: "Bureau", static: "Static" } as const;
const CLASS_LABELS = { field: "Field", empathy: "Empathy", shift: "Shift", compute: "Compute" } as const;
const COST_LABELS = { will: "Will", hp: "HP" } as const;

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
        <SummaryRow label="Basic" value={draft.abilityTierBasic} />
        <SummaryRow label="Mid" value={draft.abilityTierMid} />
        <SummaryRow label="Advanced" value={draft.abilityTierAdvanced} />
        <SummaryRow
          label="비용"
          value={draft.abilityCostType ? COST_LABELS[draft.abilityCostType] : ""}
        />
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
