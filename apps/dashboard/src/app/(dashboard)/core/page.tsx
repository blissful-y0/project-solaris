import { Badge, Card } from "@/components/ui";

const CORE_TIMELINE = [
  {
    id: "core-1",
    title: "정화 작전 제3막 개시",
    detail: "코어 외곽 방어막이 12분 후 재기동됩니다.",
    timestamp: "22:14",
  },
  {
    id: "core-2",
    title: "동부 감시축 노이즈 급증",
    detail: "센서 신뢰도가 81%로 하락해 수동 보정이 필요합니다.",
    timestamp: "21:46",
  },
];

const NOTICE_ITEMS = [
  "금일 23:00부터 채널 정기 점검이 진행됩니다.",
  "비인가 로그 아카이브 열람 시 즉시 계정이 잠금됩니다.",
];

const HIGHLIGHTS = [
  {
    id: "highlight-1",
    title: "코어 외곽 제압전",
    summary: "Bureau 분대가 Static 침투조를 7분 내 차단했습니다.",
  },
  {
    id: "highlight-2",
    title: "열교환실 방어",
    summary: "보조 발전 라인이 복구되어 전투 지원률이 상승했습니다.",
  },
];

export default function CorePage() {
  return (
    <section className="py-6 space-y-6">
      <div>
        <p className="hud-label mb-1">HELIOS CORE</p>
        <h1 className="text-xl font-bold text-text">코어 전황 센터</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card hud className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-text">스토리 브리핑 타임라인</h2>
          <div className="space-y-3">
            {CORE_TIMELINE.map((item) => (
              <article key={item.id} className="rounded-md border border-border bg-bg-tertiary/40 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-text">{item.title}</p>
                  <span className="text-xs text-text-secondary">{item.timestamp}</span>
                </div>
                <p className="text-sm text-text-secondary">{item.detail}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card hud className="space-y-3">
          <h2 className="text-sm font-semibold text-text">관리자 공지</h2>
          <ul className="space-y-2 text-sm text-text-secondary">
            {NOTICE_ITEMS.map((notice) => (
              <li key={notice}>- {notice}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card hud className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-text">전투 하이라이트</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <article key={item.id} className="rounded-md border border-border bg-bg-tertiary/40 p-3">
                <p className="font-medium text-text">{item.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.summary}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card hud className="space-y-2">
          <h2 className="text-sm font-semibold text-text">ARC 진행 상태</h2>
          <p className="text-2xl font-bold text-primary">74%</p>
          <Badge variant="warning" size="md">
            사건 발생 임계치 접근
          </Badge>
          <p className="text-sm text-text-secondary">
            공명율 편차가 안정 구간을 벗어나기 시작했습니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
