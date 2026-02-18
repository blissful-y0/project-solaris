import { cn } from "@/lib/utils";

import type { CharacterDraft, CrossoverStyle, SkillTier } from "./types";

type StepAbilityDesignProps = {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
};

const labelClass = "block text-xs uppercase tracking-widest text-text-secondary mb-1.5";
const inputClass = cn(
  "w-full min-h-[44px] bg-bg-secondary border border-border rounded-md px-3 py-2 text-text placeholder:text-text-secondary/50",
  "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors",
);
const textareaClass = cn(inputClass, "min-h-[80px] resize-none");
const costInputClass = cn(inputClass, "min-h-[44px] w-full");

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

const TIER_LABELS = {
  basic: "기본 스킬",
  mid: "중급 스킬",
  advanced: "상급 스킬",
} as const;

type TierKey = keyof typeof TIER_LABELS;

/** 티어별 권장 코스트 범위 */
const COST_GUIDE = {
  basic:    { will: "3~5", hp: "15~20", computeWill: "+2" },
  mid:      { will: "8~15", hp: "30~40", computeWill: "+5" },
  advanced: { will: "20~30", hp: "50~60", computeWill: "+10" },
} as const;

/** 개별 스킬 티어 입력 블록 */
function SkillTierBlock({
  tier,
  skill,
  systemName,
  isBureau,
  showDualCost,
  isStaticCompute,
  onChange,
}: {
  tier: TierKey;
  skill: SkillTier;
  systemName: string;
  isBureau: boolean;
  /** 크로스오버 또는 Static+Compute로 HP+WILL 둘 다 표시 */
  showDualCost: boolean;
  /** Static+Compute 특수 규칙 (HP + 추가 WILL) */
  isStaticCompute: boolean;
  onChange: (patch: Partial<SkillTier>) => void;
}) {
  const tierLabel = tier === "advanced"
    ? `${TIER_LABELS[tier]} — ${systemName}`
    : TIER_LABELS[tier];

  const guide = COST_GUIDE[tier];

  return (
    <div className="rounded-lg border border-border bg-bg-secondary/30 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
        {tierLabel}
      </p>

      {/* 스킬 이름 */}
      <div>
        <label htmlFor={`skill-${tier}-name`} className={labelClass}>스킬 이름</label>
        <input
          id={`skill-${tier}-name`}
          type="text"
          maxLength={20}
          value={skill.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={`${TIER_LABELS[tier]}의 이름`}
          className={inputClass}
        />
      </div>

      {/* 스킬 설명 */}
      <div>
        <label htmlFor={`skill-${tier}-desc`} className={labelClass}>스킬 설명</label>
        <textarea
          id={`skill-${tier}-desc`}
          maxLength={300}
          value={skill.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="이 스킬이 어떻게 작동하는지 서술하세요"
          className={textareaClass}
        />
      </div>

      {/* 코스트 입력 */}
      <div className={cn("grid gap-3", showDualCost ? "grid-cols-2" : "grid-cols-1")}>
        {(showDualCost || !isBureau) && (
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`skill-${tier}-hp`} className={labelClass}>HP 소모</label>
              <span className="text-[0.55rem] text-text-secondary/50 tabular-nums">{guide.hp}</span>
            </div>
            <input
              id={`skill-${tier}-hp`}
              type="number"
              min="0"
              max="999"
              value={skill.costHp}
              onChange={(e) => onChange({ costHp: e.target.value })}
              placeholder={guide.hp}
              className={costInputClass}
            />
          </div>
        )}
        {(showDualCost || isBureau) && (
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`skill-${tier}-will`} className={labelClass}>WILL 소모</label>
              <span className="text-[0.55rem] text-text-secondary/50 tabular-nums">
                {isBureau && !showDualCost ? guide.will : isStaticCompute ? guide.computeWill : guide.will}
              </span>
            </div>
            <input
              id={`skill-${tier}-will`}
              type="number"
              min="0"
              max="999"
              value={skill.costWill}
              onChange={(e) => onChange({ costWill: e.target.value })}
              placeholder={isBureau && !showDualCost ? guide.will : isStaticCompute ? guide.computeWill : guide.will}
              className={costInputClass}
            />
          </div>
        )}
      </div>

      {/* 가이드라인 안내 */}
      {isStaticCompute && !showDualCost && (
        <p className="text-[0.625rem] text-warning/70">
          연산(Compute) 계열 — 비동조형 사용 시 HP + 추가 WILL 이중 소모
        </p>
      )}
    </div>
  );
}

export function StepAbilityDesign({ draft, onChange }: StepAbilityDesignProps) {
  const isBureau = draft.faction === "bureau";
  const systemName = isBureau ? "하모닉스 프로토콜" : "오버드라이브";
  const hasCrossover = draft.crossoverStyle !== null;
  /** 비동조형(Static) + 연산(Compute) = HP + 추가 WILL 이중 코스트 */
  const isStaticCompute = !isBureau && draft.abilityClass === "compute";
  /** 이중 코스트 표시 조건: 크로스오버 OR Static+Compute */
  const showDualCost = hasCrossover || isStaticCompute;

  /** 특정 티어의 스킬 데이터를 업데이트 */
  function updateSkill(tier: TierKey, patch: Partial<SkillTier>) {
    onChange({
      skills: {
        ...draft.skills,
        [tier]: { ...draft.skills[tier], ...patch },
      },
    });
  }

  return (
    <div className="space-y-5">
      <p className="hud-label mb-2">// 능력을 설계하세요</p>
      <p className="text-xs text-text-secondary mb-6">
        능력 체계: <span className={cn("font-semibold", isBureau ? "text-primary" : "text-accent")}>{systemName}</span>
        {hasCrossover && (
          <span className="text-warning ml-2">⚠ 크로스오버: HP + WILL 이중 소모</span>
        )}
        {isStaticCompute && !hasCrossover && (
          <span className="text-warning ml-2">⚠ 연산 계열: HP + WILL 이중 소모</span>
        )}
      </p>

      {/* 능력 전체 이름 */}
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

      {/* 단계별 스킬 입력 */}
      <div className="space-y-4 border-t border-border pt-5 mt-5">
        <p className="hud-label">// 단계별 스킬</p>
        <p className="text-xs text-text-secondary mb-2">
          각 스킬의 이름, 설명, 소모 비용을 입력하세요.
        </p>

        {(["basic", "mid", "advanced"] as const).map((tier) => (
          <SkillTierBlock
            key={tier}
            tier={tier}
            skill={draft.skills[tier]}
            systemName={systemName}
            isBureau={isBureau}
            showDualCost={showDualCost}
            isStaticCompute={isStaticCompute}
            onChange={(patch) => updateSkill(tier, patch)}
          />
        ))}
      </div>

      {/* 크로스오버 전투 스타일 (선택사항) */}
      <div className="border-t border-border pt-5 mt-5">
        <div className="mb-4">
          <p className="hud-label mb-1">// 크로스오버 전투 스타일 (선택사항)</p>
          <p className="text-xs text-text-secondary">
            반대 진영의 전투 방식을 선택할 수 있습니다. 선택 시 모든 스킬에 HP + WILL 이중 소모가 적용됩니다.
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
