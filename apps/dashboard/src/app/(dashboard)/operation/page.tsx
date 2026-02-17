import { Badge, Card } from "@/components/ui";

type OperationType = "전투" | "RP";
type OperationStatus = "대기중" | "진행중";

type OperationItem = {
  id: string;
  title: string;
  type: OperationType;
  status: OperationStatus;
  participants: number;
  maxParticipants: number;
  host: string;
  summary: string;
};

const OPERATION_LIST: OperationItem[] = [
  {
    id: "op-001",
    title: "구역 7-B 정찰 작전",
    type: "전투",
    status: "대기중",
    participants: 2,
    maxParticipants: 4,
    host: "카이 안데르센",
    summary: "외곽 구역 비동조 신호 탐지. 정찰 및 무력화 임무.",
  },
  {
    id: "op-002",
    title: "중앙 아케이드 야간 순찰",
    type: "RP",
    status: "진행중",
    participants: 3,
    maxParticipants: 6,
    host: "나디아 볼코프",
    summary: "민간 구역 순찰 중 발생하는 일상적 교류.",
  },
  {
    id: "op-003",
    title: "지하 통로 토벌전",
    type: "전투",
    status: "진행중",
    participants: 4,
    maxParticipants: 4,
    host: "레이 노바크",
    summary: "지하 통로에 은거 중인 적대 세력 소탕.",
  },
  {
    id: "op-004",
    title: "보안국 내부 면담",
    type: "RP",
    status: "대기중",
    participants: 1,
    maxParticipants: 3,
    host: "시온 파크",
    summary: "SBCS 내부 기밀 면담. 초대 필요.",
  },
];

export default function OperationPage() {
  return (
    <section className="py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label mb-2">OPERATION</p>
          <h1 className="text-xl font-bold text-text">통합 작전 목록</h1>
        </div>
        <p className="text-xs text-text-secondary">{OPERATION_LIST.length}개 채널</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {OPERATION_LIST.map((item) => (
          <article key={item.id}>
            <Card hud className="h-full">
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === "전투" ? "info" : "warning"}>
                      {item.type}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${
                        item.status === "진행중" ? "text-success" : "text-text-secondary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-primary">
                    {item.participants}/{item.maxParticipants}
                  </p>
                </div>

                <p className="mb-1 font-semibold text-text">{item.title}</p>
                <p className="line-clamp-2 flex-1 text-xs text-text-secondary">{item.summary}</p>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs text-text-secondary">
                    호스트: <span className="text-text">{item.host}</span>
                  </p>
                </div>
              </div>
            </Card>
          </article>
        ))}
      </div>
    </section>
  );
}
