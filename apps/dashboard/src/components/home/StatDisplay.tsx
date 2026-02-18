import { cn } from "@/lib/utils";

/* ─── 팩션 스타일 매핑 ─── */
export const factionStyle = {
  Bureau: { stripe: "bg-primary", label: "BUREAU", color: "text-primary", cardTitle: "SOLARIS CITIZEN ID" },
  Static: { stripe: "bg-accent", label: "STATIC", color: "text-accent", cardTitle: "UNREGISTERED ENTITY" },
} as const;

/* ─── HP 배터리 세그먼트 ─── */
export const hpTiers = {
  high: { bg: "#22c55e", glow: "0 0 6px #22c55e60" },
  mid: { bg: "#eab308", glow: "0 0 6px #eab30860" },
  low: { bg: "#dc2626", glow: "0 0 6px #dc262660" },
} as const;

export function hpTier(current: number, max: number) {
  if (max <= 0) return hpTiers.low;
  const ratio = current / max;
  if (ratio >= 0.6) return hpTiers.high;
  if (ratio >= 0.3) return hpTiers.mid;
  return hpTiers.low;
}

export function HpBattery({ current, max }: { current: number; max: number }) {
  const filled = max > 0 ? Math.round((current / max) * 5) : 0;
  const tier = hpTier(current, max);

  return (
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-8">HP</span>
      <div className="flex gap-[3px] md:flex-1" role="meter" aria-label={`HP ${current}/${max}`} aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="w-5 md:flex-1 h-3 rounded-[2px]"
            style={{
              background: i < filled ? tier.bg : "var(--color-bg-tertiary)",
              boxShadow: i < filled ? tier.glow : "none",
              opacity: i < filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span className="text-[0.6rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── WILL 연속 게이지 (글로우 바) ─── */
export function WillGauge({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const low = pct < 30;

  return (
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-8">WILL</span>
      <div
        className="w-[112px] md:flex-1 h-3 rounded-full bg-bg-tertiary overflow-hidden relative"
        role="meter"
        aria-label={`WILL ${current}/${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* 글로우 배경 */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: low
              ? "linear-gradient(90deg, #dc2626 0%, #f87171 100%)"
              : "linear-gradient(90deg, #0ea5e9 0%, #00d4ff 60%, #67e8f9 100%)",
            boxShadow: low
              ? "0 0 8px #dc262660, inset 0 1px 0 #ffffff20"
              : "0 0 8px #00d4ff60, inset 0 1px 0 #ffffff20",
          }}
        />
        {/* 소모 영역 틱 마크 */}
        {[20, 40, 60, 80].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-bg-secondary/40"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      <span className="text-[0.6rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── 라벨/값 쌍 ─── */
export function DataField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="hud-label block mb-0.5">{label}</span>
      <span className="text-sm text-text font-medium block truncate">{value}</span>
    </div>
  );
}
