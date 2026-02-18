"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  "팩션 선택",      // 0
  "능력 계열",      // 1
  "프로필",         // 2 (구 3)
  "능력 설계",      // 3 (구 2)
  "최종 확인",      // 4
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

function isStepValid(step: number, draft: CharacterDraft): boolean {
  switch (step) {
    case 0:
      return draft.faction !== null;
    case 1:
      return draft.abilityClass !== null;
    case 2: {
      // 프로필 — 이름 + 나이 필수
      const age = Number(draft.age);
      return draft.name.trim() !== "" && draft.age.trim() !== "" && age >= 15;
    }
    case 3:
      // 능력 설계
      return (
        draft.abilityName.trim() !== "" &&
        draft.abilityDescription.trim() !== "" &&
        draft.abilityConstraint.trim() !== ""
      );
    case 4:
      return true;
    default:
      return false;
  }
}

export function WizardShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CharacterDraft>(() => EMPTY_DRAFT);
  const { isSaved, restored, clear } = useDraftSave(draft);
  const [submitting, setSubmitting] = useState(false);

  /* 이미지 — File 객체는 localStorage 직렬화 불가이므로 별도 state */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleImageChange = useCallback((file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  }, []);

  // 복원 확인 상태: "pending" → "ask" → "done"
  const [restoreState, setRestoreState] = useState<"pending" | "ask" | "done">("pending");

  useEffect(() => {
    if (restoreState === "pending") {
      if (restored) {
        setRestoreState("ask");
      } else {
        setRestoreState("done");
      }
    }
  }, [restored, restoreState]);

  const handleRestoreAccept = () => {
    if (restored) setDraft(restored);
    setRestoreState("done");
    toast.success("이전 작성 내용을 불러왔습니다");
  };

  const handleRestoreDecline = () => {
    clear();
    setRestoreState("done");
  };

  const updateDraft = useCallback((patch: Partial<CharacterDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!draft.faction) return;

    setSubmitting(true);
    try {
      /* 프론트엔드 draft → 백엔드 Server Action 페이로드 변환 */
      const payload = {
        name: draft.name,
        faction: draft.faction,
        abilityClass: draft.abilityClass,
        resonanceRate: Number(draft.resonanceRate) || 0,
        profileData: {
          age: draft.age || undefined,
          gender: draft.gender || undefined,
          personality: draft.personality || undefined,
        },
        profileImageUrl: undefined as string | undefined,
        appearance: draft.appearance || undefined,
        backstory: draft.backstory || undefined,
        leaderApplication: draft.leaderApplication,
        crossoverStyle: draft.crossoverStyle,
        abilities: (["basic", "mid", "advanced"] as const).map((tier) => ({
          tier,
          name: draft.skills[tier].name,
          description: draft.skills[tier].description,
          weakness: draft.abilityWeakness,
          costHp: Number(draft.skills[tier].costHp) || 0,
          costWill: Number(draft.skills[tier].costWill) || 0,
        })),
      };

      /* 이미지 업로드 (Supabase Storage) */
      if (imageFile) {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("인증 필요");
          const ext = imageFile.name.split(".").pop() || "webp";
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("character-profile-images")
            .upload(path, imageFile, { contentType: imageFile.type });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("character-profile-images").getPublicUrl(path);
            payload.profileImageUrl = urlData.publicUrl;
          }
        } catch {
          /* Storage 미설정 시 무시 — 이미지 없이 제출 */
        }
      }

      /* Server Action 호출 (통합 빌드에서만 존재) */
      let submitCharacter: ((d: typeof payload) => Promise<{ characterId: string }>) | null = null;
      try {
        const mod = await import("@/app/actions/character");
        submitCharacter = mod.submitCharacter;
      } catch {
        /* 백엔드 미통합 시 mock 동작 */
      }

      if (submitCharacter) {
        await submitCharacter(payload);
        clear();
        toast.success("캐릭터가 제출되었습니다. 관리자 승인을 기다려주세요.");
        router.push("/");
      } else {
        /* 백엔드 미연결 — 로컬 개발용 */
        clear();
        toast.success("[DEV] 캐릭터 제출 시뮬레이션 완료. (DB 미연동)");
        router.push("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "제출에 실패했습니다.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const canNext = isStepValid(step, draft);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 임시 저장 복원 확인 */}
      {restoreState === "ask" && (
        <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm text-text mb-1">
            이전에 작성 중이던 캐릭터가 있습니다.
          </p>
          <p className="text-xs text-text-secondary mb-4">
            이어서 작성하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleRestoreAccept}>
              불러오기
            </Button>
            <Button size="sm" variant="ghost" onClick={handleRestoreDecline}>
              새로 시작
            </Button>
          </div>
        </div>
      )}

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
          <StepProfile
            draft={draft}
            onChange={updateDraft}
            onImageChange={handleImageChange}
            imagePreviewUrl={imagePreviewUrl}
          />
        )}
        {step === 3 && (
          <StepAbilityDesign draft={draft} onChange={updateDraft} />
        )}
        {step === 4 && (
          <StepConfirm
            draft={draft}
            onSubmit={handleSubmit}
            onEditStep={handleEditStep}
            onLeaderChange={(checked) => updateDraft({ leaderApplication: checked })}
            submitting={submitting}
            imagePreviewUrl={imagePreviewUrl}
          />
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={step === 0}
        >
          이전
        </Button>
        {step < 4 && (
          <Button onClick={handleNext} disabled={!canNext}>
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
