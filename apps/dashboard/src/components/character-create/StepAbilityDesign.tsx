import { cn } from "@/lib/utils";

import type { CharacterDraft, CostType } from "./types";

type StepAbilityDesignProps = {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
};

const labelClass = "block text-xs uppercase tracking-widest text-text-secondary mb-1.5";
const inputClass = cn(
  "w-full min-h-[44px] bg-bg-secondary border border-border rounded-md px-3 py-2 text-text placeholder:text-text-secondary/50",
  "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors",
);
const textareaClass = cn(inputClass, "min-h-[80px] resize-y");

export function StepAbilityDesign({ draft, onChange }: StepAbilityDesignProps) {
  return (
    <div className="space-y-5">
      <p className="hud-label mb-6">// 능력을 설계하세요</p>

      {/* 능력 이름 */}
      <div>
        <label htmlFor="abilityName" className={labelClass}>능력 이름</label>
        <input
          id="abilityName"
          type="text"
          maxLength={20}
          value={draft.abilityName}
          onChange={(e) => onChange({ abilityName: e.target.value })}
          placeholder="능력의 이름을 입력하세요"
          className={inputClass}
        />
      </div>

      {/* 능력 설명 */}
      <div>
        <label htmlFor="abilityDescription" className={labelClass}>능력 설명</label>
        <textarea
          id="abilityDescription"
          maxLength={200}
          value={draft.abilityDescription}
          onChange={(e) => onChange({ abilityDescription: e.target.value })}
          placeholder="능력이 어떻게 작동하는지 설명하세요"
          className={textareaClass}
        />
      </div>

      {/* 제약 사항 */}
      <div>
        <label htmlFor="abilityConstraint" className={labelClass}>제약 사항</label>
        <textarea
          id="abilityConstraint"
          maxLength={200}
          value={draft.abilityConstraint}
          onChange={(e) => onChange({ abilityConstraint: e.target.value })}
          placeholder="능력의 한계나 약점을 서술하세요"
          className={textareaClass}
        />
      </div>

      {/* 티어별 설명 */}
      <div className="space-y-4 border-t border-border pt-5 mt-5">
        <p className="hud-label">// 티어별 서술</p>

        <div>
          <label htmlFor="abilityTierBasic" className={labelClass}>기본 단계</label>
          <textarea
            id="abilityTierBasic"
            maxLength={300}
            value={draft.abilityTierBasic}
            onChange={(e) => onChange({ abilityTierBasic: e.target.value })}
            placeholder="가장 낮은 출력의 사용"
            className={textareaClass}
          />
        </div>

        <div>
          <label htmlFor="abilityTierMid" className={labelClass}>중급 단계</label>
          <textarea
            id="abilityTierMid"
            maxLength={300}
            value={draft.abilityTierMid}
            onChange={(e) => onChange({ abilityTierMid: e.target.value })}
            placeholder="일반적인 전투 상황에서의 사용"
            className={textareaClass}
          />
        </div>

        <div>
          <label htmlFor="abilityTierAdvanced" className={labelClass}>상급 단계</label>
          <textarea
            id="abilityTierAdvanced"
            maxLength={300}
            value={draft.abilityTierAdvanced}
            onChange={(e) => onChange({ abilityTierAdvanced: e.target.value })}
            placeholder="최대 출력, 큰 부담을 동반"
            className={textareaClass}
          />
        </div>
      </div>

      {/* 비용 타입 */}
      <div className="border-t border-border pt-5 mt-5">
        <p className={cn(labelClass, "mb-3")}>비용 타입</p>
        <div className="flex gap-6">
          {(["will", "hp"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="abilityCostType"
                value={type}
                checked={draft.abilityCostType === type}
                onChange={() => onChange({ abilityCostType: type })}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-text uppercase tracking-wide">
                {type === "will" ? "Will" : "HP"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
