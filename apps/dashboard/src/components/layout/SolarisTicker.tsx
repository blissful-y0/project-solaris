const tickerEntries = [
  {
    id: "ticker-1",
    text: "헬리오스 코어 정기 점검 완료 — 감시 축 안정도 98.4%",
    priority: "high",
    timestamp: "22:10",
  },
  {
    id: "ticker-2",
    text: "동부 경계구역 공명율 급등 감지 — 순찰조 증원 배치",
    priority: "medium",
    timestamp: "21:44",
  },
  {
    id: "ticker-3",
    text: "석양 의정서 관련 루머 확산 — 비인가 채널 모니터링 강화",
    priority: "low",
    timestamp: "21:02",
  },
];

export function SolarisTicker() {
  const tickerText = tickerEntries
    .map((entry) => `[${entry.timestamp}] ${entry.text}`)
    .join("  //  ");

  return (
    <div
      data-testid="solaris-ticker"
      className="fixed top-14 left-0 right-0 z-30 h-8 border-b border-border bg-bg-secondary/95 md:left-[220px]"
    >
      <div className="flex h-full items-center gap-3 overflow-hidden px-4 md:px-6">
        <span className="hud-label shrink-0 text-primary">HELIOS ALERT</span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track motion-reduce:animate-none">
            <span>{tickerText}</span>
            <span aria-hidden="true">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
