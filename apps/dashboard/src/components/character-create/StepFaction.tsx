import { cn } from "@/lib/utils";

import type { Faction } from "./types";

const FACTIONS: { id: Faction; label: string; description: string; theme: string; glow: string }[] = [
  {
    id: "bureau",
    label: "Bureau",
    description: "질서와 통제. 거짓 태양 아래 인류를 관리하는 관료제.",
    theme: "border-primary",
    glow: "glow-cyan-strong",
  },
  {
    id: "static",
    label: "Static",
    description: "저항과 자유. 시스템 밖에서 진실을 찾는 이들.",
    theme: "border-accent",
    glow: "glow-red-strong",
  },
];

type StepFactionProps = {
  value: Faction | null;
  onChange: (faction: Faction) => void;
};

export function StepFaction({ value, onChange }: StepFactionProps) {
  return (
    <div className="space-y-4">
      <p className="hud-label mb-6">// 소속 진영을 선택하세요</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FACTIONS.map((f) => {
          const selected = value === f.id;
          return (
            <button
              key={f.id}
              type="button"
              data-testid={`faction-${f.id}`}
              onClick={() => onChange(f.id)}
              className={cn(
                "text-left p-5 rounded-lg border-2 transition-all hud-corners",
                "bg-bg-secondary/80 backdrop-blur-sm",
                selected
                  ? `${f.theme} ${f.glow}`
                  : "border-border hover:border-text-secondary/30",
              )}
            >
              <h3 className={cn(
                "text-lg font-bold tracking-wider uppercase mb-2",
                selected && f.id === "bureau" && "text-primary text-glow-cyan",
                selected && f.id === "static" && "text-accent text-glow-red",
                !selected && "text-text",
              )}>
                {f.label}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
