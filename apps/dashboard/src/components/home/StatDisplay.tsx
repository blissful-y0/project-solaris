/* ─── 팩션 스타일 매핑 ─── */
export const factionStyle = {
  Enforcer: { stripe: "bg-primary", label: "ENFORCER", color: "text-primary", cardTitle: "SOLARIS CITIZEN ID" },
  Static: { stripe: "bg-accent", label: "STATIC", color: "text-accent", cardTitle: "UNREGISTERED ENTITY" },
} as const;

/* ─── 라벨/값 쌍 ─── */
export function DataField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="hud-label block mb-0.5">{label}</span>
      <span className="text-sm text-text font-medium block truncate">{value}</span>
    </div>
  );
}
