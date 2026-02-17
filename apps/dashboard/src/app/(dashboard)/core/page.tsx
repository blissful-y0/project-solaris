import { Card, Badge } from "@/components/ui";

/** 목 브리핑 타임라인 데이터 */
const MOCK_TIMELINE = [
  {
    id: "arc-001",
    label: "ARC EVENT",
    title: "외곽 구역 통신 두절 사건",
    date: "2026.02.18",
    status: "진행 중" as const,
    description: "외곽 7-B 구역에서 대규모 통신 교란 감지. 원인 조사 중.",
  },
  {
    id: "notice-001",
    label: "ADMIN NOTICE",
    title: "시스템 정기 점검 안내",
    date: "2026.02.17",
    status: "완료" as const,
    description: "HELIOS 코어 시스템 정기 점검이 완료되었습니다.",
  },
  {
    id: "arc-002",
    label: "ARC EVENT",
    title: "중앙 아케이드 정전 사태",
    date: "2026.02.15",
    status: "완료" as const,
    description: "민간 구역 대규모 정전. Static 관여 의혹 조사 중 종결.",
  },
  {
    id: "highlight-001",
    label: "COMBAT HIGHLIGHT",
    title: "구역 4-A 교전 기록",
    date: "2026.02.14",
    status: "기록" as const,
    description: "SBCS 소대와 미확인 세력 간 교전. 사상자 없음.",
  },
];

export default function CorePage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <p className="hud-label mb-2">HELIOS CORE</p>
        <h1 className="text-xl font-bold text-text">스토리 브리핑</h1>
        <p className="text-sm text-text-secondary mt-2">
          ARC 사건 발생 시스템 및 주요 브리핑 타임라인.
        </p>
      </div>

      {/* 데스크탑: 타임라인 + 사이드 패널 / 모바일: 단일 열 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* 메인 타임라인 */}
        <div className="space-y-3">
          {MOCK_TIMELINE.map((item) => (
            <article key={item.id}>
              <Card hud>
                <div className="flex items-start gap-4">
                  {/* 좌측: 날짜 표시 */}
                  <div className="shrink-0 text-center w-16 pt-1">
                    <p className="text-xs font-mono text-text-secondary">
                      {item.date.slice(5)}
                    </p>
                  </div>

                  {/* 우측: 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          item.label === "ARC EVENT"
                            ? "danger"
                            : item.label === "COMBAT HIGHLIGHT"
                              ? "info"
                              : "default"
                        }
                        size="sm"
                      >
                        {item.label}
                      </Badge>
                      <span
                        className={`text-xs ${
                          item.status === "진행 중"
                            ? "text-accent font-medium"
                            : "text-text-secondary"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="font-semibold text-text">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </article>
          ))}
        </div>

        {/* 사이드 패널 — 데스크탑에서만 표시 */}
        <aside className="hidden lg:block space-y-4">
          <Card hud>
            <p className="hud-label mb-2 text-primary">SYSTEM STATUS</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">HELIOS Core</span>
                <span className="text-success">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Active ARC</span>
                <span className="text-accent">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Active Operations</span>
                <span className="text-primary">5</span>
              </div>
            </div>
          </Card>

          <Card hud>
            <p className="hud-label mb-2">RECENT NOTICE</p>
            <p className="text-xs text-text-secondary">
              시스템 정기 점검이 완료되었습니다. 모든 서비스가 정상 가동 중입니다.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
