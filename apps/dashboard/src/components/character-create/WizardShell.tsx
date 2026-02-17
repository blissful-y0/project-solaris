"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useDraftSave } from "@/hooks/useDraftSave";

import { StepAbilityClass } from "./StepAbilityClass";
import { StepAbilityDesign } from "./StepAbilityDesign";
import { StepConfirm } from "./StepConfirm";
import { StepFaction } from "./StepFaction";
import { StepProfile } from "./StepProfile";
import { EMPTY_DRAFT, type CharacterDraft } from "./types";

const STEP_LABELS = [
  "팩션 선택",
  "능력 계열",
  "능력 설계",
  "프로필",
  "최종 확인",
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

function isStepValid(step: number, draft: CharacterDraft): boolean {
  switch (step) {
    case 0:
      return draft.faction !== null;
    case 1:
      return draft.abilityClass !== null;
    case 2:
      return (
        draft.abilityName.trim() !== "" &&
        draft.abilityDescription.trim() !== "" &&
        draft.abilityConstraint.trim() !== ""
      );
    case 3:
      return draft.name.trim() !== "" && draft.age.trim() !== "";
    case 4:
      return true;
    default:
      return false;
  }
}

export function WizardShell() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CharacterDraft>(() => EMPTY_DRAFT);
  const { isSaved, restored, clear } = useDraftSave(draft);

  // 복원 확인 (한 번만)
  const [restoredChecked, setRestoredChecked] = useState(false);
  if (!restoredChecked && restored) {
    setDraft(restored);
    setRestoredChecked(true);
  } else if (!restoredChecked) {
    setRestoredChecked(true);
  }

  const updateDraft = useCallback((patch: Partial<CharacterDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    // Phase 1: API 미연동 — console.log + 토스트
    console.log("캐릭터 제출:", draft);
    clear();
    toast.success("캐릭터가 제출되었습니다!");
  };

  const handleEditStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const canNext = isStepValid(step, draft);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 스텝 인디케이터 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="hud-label">{STEP_LABELS[step]}</span>
          <span className="text-sm text-text-secondary font-mono">{step + 1} / {TOTAL_STEPS}</span>
        </div>
        {/* 프로그레스 바 */}
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        {/* 임시 저장 표시 */}
        {isSaved && (
          <p className="hud-label mt-2 text-right">임시 저장됨</p>
        )}
      </div>

      {/* 스텝 콘텐츠 */}
      <div className="mb-8">
        {step === 0 && (
          <StepFaction
            value={draft.faction}
            onChange={(faction) => updateDraft({ faction })}
          />
        )}
        {step === 1 && (
          <StepAbilityClass
            value={draft.abilityClass}
            onChange={(abilityClass) => updateDraft({ abilityClass })}
          />
        )}
        {step === 2 && (
          <StepAbilityDesign draft={draft} onChange={updateDraft} />
        )}
        {step === 3 && (
          <StepProfile draft={draft} onChange={updateDraft} />
        )}
        {step === 4 && (
          <StepConfirm
            draft={draft}
            onSubmit={handleSubmit}
            onEditStep={handleEditStep}
          />
        )}
      </div>

      {/* 네비게이션 버튼 */}
      {step < 4 && (
        <div className="flex justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={step === 0}
          >
            이전
          </Button>
          <Button onClick={handleNext} disabled={!canNext}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
