import { cn } from "@/lib/utils";

import type { AbilityClass } from "./types";

const ABILITY_CLASSES: { id: AbilityClass; label: string; description: string }[] = [
  { id: "field", label: "Field", description: "공간과 에너지를 조작하는 능력" },
  { id: "empathy", label: "Empathy", description: "감정과 정신에 작용하는 능력" },
  { id: "shift", label: "Shift", description: "물질과 신체를 변형하는 능력" },
  { id: "compute", label: "Compute", description: "정보와 확률을 연산하는 능력" },
];

type StepAbilityClassProps = {
  value: AbilityClass | null;
  onChange: (abilityClass: AbilityClass) => void;
};

export function StepAbilityClass({ value, onChange }: StepAbilityClassProps) {
  return (
    <div className="space-y-4">
      <p className="hud-label mb-6">// 능력 계열을 선택하세요</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ABILITY_CLASSES.map((ac) => {
          const selected = value === ac.id;
          return (
            <button
              key={ac.id}
              type="button"
              data-testid={`ability-class-${ac.id}`}
              onClick={() => onChange(ac.id)}
              className={cn(
                "text-left p-5 rounded-lg border-2 transition-all hud-corners",
                "bg-bg-secondary/80 backdrop-blur-sm",
                selected
                  ? "border-primary glow-cyan-strong"
                  : "border-border hover:border-text-secondary/30",
              )}
            >
              <h3 className={cn(
                "text-lg font-bold tracking-wider uppercase mb-2",
                selected ? "text-primary text-glow-cyan" : "text-text",
              )}>
                {ac.label}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {ac.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
