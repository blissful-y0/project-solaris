import { cn } from "@/lib/utils";

import type { CharacterDraft, CrossoverStyle } from "./types";

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

/** Bureau 크로스오버 옵션 */
const BUREAU_CROSSOVER = {
  id: "limiter-override" as CrossoverStyle,
  label: "리미터 해제",
  sublabel: "Safe-mode Override",
  desc: "안전 등급을 강제 해제하여 오버드라이브급 파괴력을 발휘. WILL 소모 3배, 사용 후 1턴 행동불능.",
};

/** Static 크로스오버 옵션 */
const STATIC_CROSSOVERS: { id: CrossoverStyle; label: string; sublabel: string; desc: string }[] = [
  {
    id: "hardware-bypass",
    label: "외장형 연산 장치",
    sublabel: "Hardware Bypass",
    desc: "불법 연산 모듈로 하모닉스급 정밀 제어. 장비 과부하 리스크, 헬리오스 감지망 노출.",
  },
  {
    id: "dead-reckoning",
    label: "정신적 오버클럭",
    sublabel: "Dead Reckoning",
    desc: "정신력만으로 파형을 억제. HP + WILL 이중 소모, 극심한 두통과 환각.",
  },
  {
    id: "defector",
    label: "전향자",
    sublabel: "Defector",
    desc: "前 보안국 소속. 하모닉스 훈련 보유. 능력 사용 시 헬리오스가 즉시 위치 특정. HP 100 / WILL 200.",
  },
];

export function StepAbilityDesign({ draft, onChange }: StepAbilityDesignProps) {
  const isBureau = draft.faction === "bureau";
  const systemName = isBureau ? "하모닉스 프로토콜" : "오버드라이브";
  const costType = isBureau ? "WILL" : "HP";

  return (
    <div className="space-y-5">
      <p className="hud-label mb-2">// 능력을 설계하세요</p>
      <p className="text-xs text-text-secondary mb-6">
        능력 체계: <span className={cn("font-semibold", isBureau ? "text-primary" : "text-accent")}>{systemName}</span>
        {" "}— 비용: <span className="text-text">{costType}</span>
      </p>

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
          placeholder="능력의 한계나 사용 조건을 서술하세요"
          className={textareaClass}
        />
      </div>

      {/* 약점 */}
      <div>
        <label htmlFor="abilityWeakness" className={labelClass}>약점</label>
        <textarea
          id="abilityWeakness"
          maxLength={200}
          value={draft.abilityWeakness}
          onChange={(e) => onChange({ abilityWeakness: e.target.value })}
          placeholder="능력의 약점이나 부작용을 서술하세요"
          className={textareaClass}
        />
      </div>

      {/* 비용 수치 */}
      <div>
        <label htmlFor="abilityCostAmount" className={labelClass}>비용 수치</label>
        <input
          id="abilityCostAmount"
          type="text"
          maxLength={10}
          value={draft.abilityCostAmount}
          onChange={(e) => onChange({ abilityCostAmount: e.target.value })}
          placeholder={`${costType} 소모량 (예: 15)`}
          className={inputClass}
        />
      </div>

      {/* 단계별 서술 */}
      <div className="space-y-4 border-t border-border pt-5 mt-5">
        <p className="hud-label">// 단계별 서술</p>

        <div>
          <label htmlFor="abilityTierBasic" className={labelClass}>기본 스킬</label>
          <textarea
            id="abilityTierBasic"
            maxLength={300}
            value={draft.abilityTierBasic}
            onChange={(e) => onChange({ abilityTierBasic: e.target.value })}
            placeholder="가장 낮은 출력의 기본 사용"
            className={textareaClass}
          />
        </div>

        <div>
          <label htmlFor="abilityTierMid" className={labelClass}>중급 스킬</label>
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
          <label htmlFor="abilityTierAdvanced" className={labelClass}>
            상급 스킬 — {systemName}
          </label>
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

      {/* 크로스오버 전투 스타일 (선택사항) */}
      <div className="border-t border-border pt-5 mt-5">
        <div className="mb-4">
          <p className="hud-label mb-1">// 크로스오버 전투 스타일 (선택사항)</p>
          <p className="text-xs text-text-secondary">
            반대 진영의 전투 방식을 선택할 수 있습니다. 추가 대가가 따릅니다.
          </p>
        </div>

        <div className="space-y-3">
          {/* 선택 안 함 옵션 */}
          <button
            type="button"
            onClick={() => onChange({ crossoverStyle: null })}
            className={cn(
              "w-full text-left p-3 rounded-md border transition-all",
              draft.crossoverStyle === null
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-text-secondary/30",
            )}
          >
            <span className="text-sm text-text">선택 안 함</span>
            <span className="text-xs text-text-secondary ml-2">— 기본 전투 스타일 유지</span>
          </button>

          {/* Bureau: 리미터 해제 */}
          {isBureau && (
            <button
              type="button"
              data-testid="crossover-limiter-override"
              onClick={() => onChange({ crossoverStyle: BUREAU_CROSSOVER.id })}
              className={cn(
                "w-full text-left p-3 rounded-md border transition-all",
                draft.crossoverStyle === BUREAU_CROSSOVER.id
                  ? "border-accent/40 bg-accent/5 glow-red"
                  : "border-border hover:border-text-secondary/30",
              )}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-text">{BUREAU_CROSSOVER.label}</span>
                <span className="text-[0.625rem] text-text-secondary tracking-wide">{BUREAU_CROSSOVER.sublabel}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{BUREAU_CROSSOVER.desc}</p>
            </button>
          )}

          {/* Static: 3가지 루트 */}
          {!isBureau && STATIC_CROSSOVERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-testid={`crossover-${opt.id}`}
              onClick={() => onChange({ crossoverStyle: opt.id })}
              className={cn(
                "w-full text-left p-3 rounded-md border transition-all",
                draft.crossoverStyle === opt.id
                  ? "border-primary/40 bg-primary/5 glow-cyan"
                  : "border-border hover:border-text-secondary/30",
              )}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-text">{opt.label}</span>
                <span className="text-[0.625rem] text-text-secondary tracking-wide">{opt.sublabel}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
